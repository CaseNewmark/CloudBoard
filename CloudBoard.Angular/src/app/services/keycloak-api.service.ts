import { Injectable } from '@angular/core';

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeycloakApiService {
  private readonly baseUrl = 'http://localhost:8080/realms/cloudboard';
  private readonly clientId = 'cloudboard-client';

  async exchangeCodeForTokens(code: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
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

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        refresh_token: refreshToken,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error_description || result.error || 'Token refresh failed');
    }
    return result;
  }

  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/protocol/openid-connect/userinfo`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    return response.json();
  }

  buildLoginUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: 'openid profile email',
      response_type: 'code',
    });
    return `${this.baseUrl}/protocol/openid-connect/auth?${params}`;
  }

  buildLogoutUrl(idToken?: string): string {
    const params = new URLSearchParams({
      post_logout_redirect_uri: `${window.location.origin}/logout-success`,
    });
    if (idToken) {
      params.set('id_token_hint', idToken);
    }
    return `${this.baseUrl}/protocol/openid-connect/logout?${params}`;
  }
}