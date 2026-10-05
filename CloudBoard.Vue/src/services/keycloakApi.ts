export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
}

// The dev server talks to the local Keycloak on port 8080; under the AppHost, VITE_KEYCLOAK_URL
// carries its actual URL (https when Aspire found a trusted dev certificate). Production builds
// expect Keycloak behind the same origin under /keycloak, as set up by deploy/Caddyfile.
// VITE_KEYCLOAK_URL overrides both.
const keycloakUrl =
  import.meta.env.VITE_KEYCLOAK_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : `${window.location.origin}/keycloak`);
const baseUrl = `${keycloakUrl.replace(/\/+$/, '')}/realms/cloudboard`;
const clientId = 'cloudboard-client';
/** Keycloak identity provider to send users to directly, skipping Keycloak's own login form. */
const identityProvider = 'google';

// Per-login values kept across the redirect to Keycloak and back (this tab only).
const STATE_KEY = 'oauth_state';
const CODE_VERIFIER_KEY = 'oauth_code_verifier';

function randomString(bytes = 32): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return base64Url(values);
}

function base64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** PKCE (RFC 7636): the S256 challenge for a verifier. */
async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

/**
 * Exchanges the code from the login redirect for tokens. `state` must match the one this
 * tab sent, and the PKCE verifier proves the code was requested by this tab.
 */
export async function exchangeCodeForTokens(code: string, state: string | undefined): Promise<TokenResponse> {
  const expectedState = sessionStorage.getItem(STATE_KEY);
  const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
  if (!state || !expectedState || state !== expectedState || !codeVerifier) {
    throw new Error('Login response does not match a login started in this tab');
  }

  const response = await fetch(`${baseUrl}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      code_verifier: codeVerifier,
      redirect_uri: `${window.location.origin}/auth/callback`,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error_description || result.error || 'Token exchange failed');
  }
  return result;
}

export async function refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
  const response = await fetch(`${baseUrl}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshTokenValue,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error_description || result.error || 'Token refresh failed');
  }
  return result;
}

export async function getUserInfo(accessToken: string): Promise<any> {
  const response = await fetch(`${baseUrl}/protocol/openid-connect/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }
  return response.json();
}

/** The Keycloak login URL; `kc_idp_hint` makes Keycloak forward straight to Google. */
export async function buildLoginUrl(): Promise<string> {
  const state = randomString();
  const codeVerifier = randomString(48);
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/callback`,
    scope: 'openid profile email',
    response_type: 'code',
    state,
    code_challenge: await codeChallenge(codeVerifier),
    code_challenge_method: 'S256',
    kc_idp_hint: identityProvider,
  });
  return `${baseUrl}/protocol/openid-connect/auth?${params}`;
}

export function buildLogoutUrl(idToken?: string): string {
  const params = new URLSearchParams({
    post_logout_redirect_uri: `${window.location.origin}/logout-success`,
  });
  if (idToken) {
    params.set('id_token_hint', idToken);
  }
  return `${baseUrl}/protocol/openid-connect/logout?${params}`;
}
