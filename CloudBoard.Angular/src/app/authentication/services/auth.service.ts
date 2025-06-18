import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TokenService } from './token.service';
import { KeycloakApiService } from './keycloak-api.service';
import { UserService, User } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenService = inject(TokenService);
  private keycloakApi = inject(KeycloakApiService);
  private userService = inject(UserService);
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public currentUser$ = this.userService.currentUser$;

  constructor() {
    this.initializeAuth();
    this.startTokenRefreshTimer();
  }

  private initializeAuth(): void {
    if (this.tokenService.hasValidToken()) {
      this.userService.loadUserFromStorage();
      this.isLoggedInSubject.next(true);
    } else if (this.tokenService.getRefreshToken()) {
      this.refreshTokenSilently();
    }
  }

  private startTokenRefreshTimer(): void {
    setInterval(() => {
      if (this.isLoggedIn() && !this.tokenService.hasValidToken()) {
        this.refreshTokenSilently();
      }
    }, 60000); // Check every minute
  }

  async login(): Promise<void> {
    window.location.href = this.keycloakApi.buildLoginUrl();
  }

  async handleCallback(code: string): Promise<void> {
    try {
      const tokens = await this.keycloakApi.exchangeCodeForTokens(code);
      this.tokenService.setTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);
      
      const userInfo = await this.keycloakApi.getUserInfo(tokens.access_token);
      this.userService.setUser(userInfo);
      
      this.isLoggedInSubject.next(true);
    } catch (error) {
      console.error('Authentication failed:', error);
      this.logout();
      throw error;
    }
  }

  private async refreshTokenSilently(): Promise<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return;
    }

    try {
      const tokens = await this.keycloakApi.refreshToken(refreshToken);
      this.tokenService.setTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);
      
      const userInfo = await this.keycloakApi.getUserInfo(tokens.access_token);
      this.userService.setUser(userInfo);
      
      this.isLoggedInSubject.next(true);
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
  }

  async ensureValidToken(): Promise<boolean> {
    if (this.tokenService.hasValidToken()) {
      return true;
    }

    await this.refreshTokenSilently();
    return this.tokenService.hasValidToken();
  }

  logout(): void {
    const idToken = this.tokenService.getIdToken();
    this.tokenService.clearTokens();
    this.userService.clearUser();
    this.isLoggedInSubject.next(false);
    
    window.location.href = this.keycloakApi.buildLogoutUrl(idToken || undefined);
  }

  localLogout(): void {
    this.tokenService.clearTokens();
    this.userService.clearUser();
    this.isLoggedInSubject.next(false);
    window.location.href = '/home';
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): User | null {
    return this.userService.getCurrentUser();
  }
}