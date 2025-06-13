import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if user is already logged in (e.g., from localStorage)
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.isLoggedInSubject.next(true);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(keycloakUrl: string = 'http://localhost:8080'): void {
    // Redirect to Keycloak login
    const clientId = 'cloudboard-client';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const scope = 'openid profile email';
    const responseType = 'code';
    
    const authUrl = `${keycloakUrl}/realms/cloudboard/protocol/openid-connect/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=${responseType}`;
      
    window.location.href = authUrl;
  }

  async handleCallback(code: string): Promise<void> {
    try {
      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);
      
      if (tokenResponse.access_token) {
        localStorage.setItem('access_token', tokenResponse.access_token);
        localStorage.setItem('refresh_token', tokenResponse.refresh_token);
        
        // Get user info
        const userInfo = await this.getUserInfo(tokenResponse.access_token);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(userInfo);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      this.logout();
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<any> {
    const tokenUrl = 'http://localhost:8080/realms/cloudboard/protocol/openid-connect/token';
    const clientId = 'cloudboard-client';
    const redirectUri = window.location.origin + '/auth/callback';

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    return response.json();
  }

  private async getUserInfo(accessToken: string): Promise<User> {
    const userInfoUrl = 'http://localhost:8080/realms/cloudboard/protocol/openid-connect/userinfo';
    
    const response = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const userInfo = await response.json();
    
    return {
      id: userInfo.sub,
      username: userInfo.preferred_username,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      roles: userInfo.realm_access?.roles || []
    };
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Redirect to Keycloak logout
    const keycloakLogoutUrl = 'http://localhost:8080/realms/cloudboard/protocol/openid-connect/logout';
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `${keycloakLogoutUrl}?redirect_uri=${redirectUri}`;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}