export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
}

// The dev server talks to the local Keycloak (the AppHost pins it to port 8080).
// Production builds expect Keycloak behind the same origin under /keycloak, as set up
// by deploy/Caddyfile. VITE_KEYCLOAK_URL overrides both at build time.
const keycloakUrl =
  import.meta.env.VITE_KEYCLOAK_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : `${window.location.origin}/keycloak`);
const baseUrl = `${keycloakUrl.replace(/\/+$/, '')}/realms/cloudboard`;
const clientId = 'cloudboard-client';

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const response = await fetch(`${baseUrl}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
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

export function buildLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/callback`,
    scope: 'openid profile email',
    response_type: 'code',
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
