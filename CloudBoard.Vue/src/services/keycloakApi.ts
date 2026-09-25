export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
}

const baseUrl = 'http://localhost:8080/realms/cloudboard';
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
