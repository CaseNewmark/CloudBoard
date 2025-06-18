import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly ID_TOKEN_KEY = 'id_token';
  private readonly BUFFER_TIME = 1 * 60 * 1000; // 1 minute

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getIdToken(): string | null {
    return localStorage.getItem(this.ID_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken?: string, idToken?: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    if (idToken) localStorage.setItem(this.ID_TOKEN_KEY, idToken);
  }

  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ID_TOKEN_KEY);
  }

  isTokenValid(token?: string): boolean {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return false;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      return now < (expiry - this.BUFFER_TIME);
    } catch {
      return false;
    }
  }

  hasValidToken(): boolean {
    return this.isTokenValid();
  }
}