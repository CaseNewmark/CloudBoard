const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ID_TOKEN_KEY = 'id_token';
const BUFFER_TIME = 1 * 60 * 1000; // 1 minute

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getIdToken(): string | null {
  return localStorage.getItem(ID_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string, idToken?: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (idToken) localStorage.setItem(ID_TOKEN_KEY, idToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
}

export function isTokenValid(token?: string): boolean {
  const accessToken = token || getAccessToken();
  if (!accessToken) return false;

  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() < expiry - BUFFER_TIME;
  } catch {
    return false;
  }
}

export function hasValidToken(): boolean {
  return isTokenValid();
}
