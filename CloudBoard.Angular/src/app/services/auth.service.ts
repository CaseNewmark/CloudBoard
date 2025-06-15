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
    
    // Set up automatic token refresh check
    this.setupTokenRefreshCheck();
  }

  private checkAuthState(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // Check if token is still valid
      if (this.isTokenValid(token)) {
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(JSON.parse(user));
      } else {
        // Token is expired, try to refresh it
        this.refreshTokenIfPossible();
      }
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // Add 1 minute buffer before expiration
      const bufferTime = 1 * 60 * 1000;
      return now < (exp - bufferTime);
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }

  private setupTokenRefreshCheck(): void {
    // Check token validity every 5 minutes
    setInterval(() => {
      if (this.isLoggedIn()) {
        const token = localStorage.getItem('access_token');
        if (token && !this.isTokenValid(token)) {
          console.log('Token expired, attempting refresh...');
          this.refreshTokenIfPossible();
        }
      }
    }, 1 * 60 * 1000); // 1 minute
  }

  private async refreshTokenIfPossible(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      console.log('No refresh token available, logging out...');
      this.logout();
      return;
    }

    try {
      const newTokens = await this.refreshAccessToken(refreshToken);
      
      if (newTokens.access_token) {
        localStorage.setItem('access_token', newTokens.access_token);
        if (newTokens.refresh_token) {
          localStorage.setItem('refresh_token', newTokens.refresh_token);
        }
        // Store ID token if present
        if (newTokens.id_token) {
          localStorage.setItem('id_token', newTokens.id_token);
        }
        
        // Get updated user info
        const userInfo = await this.getUserInfo(newTokens.access_token);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(userInfo);
        
        console.log('Token refreshed successfully');
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
  }

  private async refreshAccessToken(refreshToken: string): Promise<any> {
    const tokenUrl = 'http://localhost:8080/realms/cloudboard/protocol/openid-connect/token';
    const clientId = 'cloudboard-client';

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: refreshToken,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${result.error_description || result.error}`);
    }
    
    return result;
  }

  // Add method to check if token needs refresh
  public async ensureValidToken(): Promise<boolean> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return false;
    }

    if (this.isTokenValid(token)) {
      return true;
    }

    // Token is expired or about to expire, try to refresh
    await this.refreshTokenIfPossible();
    
    // Check if we now have a valid token
    const newToken = localStorage.getItem('access_token');
    return newToken ? this.isTokenValid(newToken) : false;
  }

  login(keycloakUrl: string = 'http://localhost:8080'): void {
    // Redirect to Keycloak login
    const clientId = 'cloudboard-client';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const postLogoutRedirectUri = encodeURIComponent(window.location.origin + '/home');
    const scope = 'openid profile email';
    const responseType = 'code';
    
    const authUrl = `${keycloakUrl}/realms/cloudboard/protocol/openid-connect/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `post_logout_redirect_uri=${postLogoutRedirectUri}&` +
      `scope=${scope}&` +
      `response_type=${responseType}`;
      
    window.location.href = authUrl;
  }

  async handleCallback(code: string): Promise<void> {
    try {
      console.log('Handling auth callback with code:', code);
      
      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);
      
      console.log('Token response received:', tokenResponse ? 'Success' : 'Failed');
      
      if (tokenResponse.access_token) {
        localStorage.setItem('access_token', tokenResponse.access_token);
        
        if (tokenResponse.refresh_token) {
          localStorage.setItem('refresh_token', tokenResponse.refresh_token);
        }
        
        // Store ID token - this is crucial for logout
        if (tokenResponse.id_token) {
          localStorage.setItem('id_token', tokenResponse.id_token);
        }
        
        // Get user info
        const userInfo = await this.getUserInfo(tokenResponse.access_token);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(userInfo);
        
        console.log('Authentication completed successfully for user:', userInfo.username);
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      this.logout();
      throw error; // Re-throw so the callback component can handle it
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<any> {
    const tokenUrl = 'http://localhost:8080/realms/cloudboard/protocol/openid-connect/token';
    const clientId = 'cloudboard-client';
    const redirectUri = window.location.origin + '/auth/callback';

    console.log('Exchanging code for tokens...');
    console.log('Token URL:', tokenUrl);
    console.log('Redirect URI:', redirectUri);
    
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

    const result = await response.json();
    console.log('Token exchange response status:', response.status);
    console.log('Token exchange response:', result);
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${result.error_description || result.error || 'Unknown error'}`);
    }
    
    return result;
  }

  private async getUserInfo(accessToken: string): Promise<User> {
    const userInfoUrl = 'http://localhost:8080/realms/cloudboard/protocol/openid-connect/userinfo';
    
    const response = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

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
    const idToken = localStorage.getItem('id_token');
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('user');
    
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Build logout URL with id_token_hint
    const keycloakLogoutUrl = 'http://localhost:8080/realms/cloudboard/protocol/openid-connect/logout';
    const postLogoutRedirectUri = encodeURIComponent(window.location.origin + '/home');
    
    let logoutUrl = `${keycloakLogoutUrl}?post_logout_redirect_uri=${postLogoutRedirectUri}`;
    
    if (idToken) {
      logoutUrl += `&id_token_hint=${encodeURIComponent(idToken)}`;
    }
    
    console.log('Logging out with URL:', logoutUrl);
    window.location.href = logoutUrl;
  }

  // Alternative logout method that just clears local state without Keycloak logout
  localLogout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('user');
    
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Just redirect to home without going through Keycloak
    window.location.href = '/home';
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}