import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import * as keycloakApi from '@/services/keycloakApi';
import * as tokenService from '@/services/token';
import { setAuthHook } from '@/services/apiClient';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

const USER_KEY = 'user';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const currentUser = ref<User | null>(null);

  let refreshTimer: ReturnType<typeof setInterval> | undefined;

  function setUser(userInfo: any): void {
    const user: User = {
      id: userInfo.sub,
      username: userInfo.preferred_username,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      roles: userInfo.realm_access?.roles || [],
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    currentUser.value = user;
  }

  function clearUser(): void {
    localStorage.removeItem(USER_KEY);
    currentUser.value = null;
  }

  function loadUserFromStorage(): void {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      currentUser.value = JSON.parse(userData);
    }
  }

  async function refreshTokenSilently(): Promise<void> {
    const refreshTokenValue = tokenService.getRefreshToken();
    if (!refreshTokenValue) {
      logout();
      return;
    }

    try {
      const tokens = await keycloakApi.refreshToken(refreshTokenValue);
      tokenService.setTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);

      const userInfo = await keycloakApi.getUserInfo(tokens.access_token);
      setUser(userInfo);

      isLoggedIn.value = true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }

  function initializeAuth(): void {
    if (tokenService.hasValidToken()) {
      loadUserFromStorage();
      isLoggedIn.value = true;
    } else if (tokenService.getRefreshToken()) {
      void refreshTokenSilently();
    }

    refreshTimer = setInterval(() => {
      if (isLoggedIn.value && !tokenService.hasValidToken()) {
        void refreshTokenSilently();
      }
    }, 60000); // Check every minute
  }

  async function login(): Promise<void> {
    window.location.href = keycloakApi.buildLoginUrl();
  }

  async function handleCallback(code: string): Promise<void> {
    try {
      const tokens = await keycloakApi.exchangeCodeForTokens(code);
      tokenService.setTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);

      const userInfo = await keycloakApi.getUserInfo(tokens.access_token);
      setUser(userInfo);

      isLoggedIn.value = true;
    } catch (error) {
      console.error('Authentication failed:', error);
      logout();
      throw error;
    }
  }

  async function ensureValidToken(): Promise<boolean> {
    if (tokenService.hasValidToken()) {
      return true;
    }

    await refreshTokenSilently();
    return tokenService.hasValidToken();
  }

  function logout(): void {
    const idToken = tokenService.getIdToken();
    tokenService.clearTokens();
    clearUser();
    isLoggedIn.value = false;

    window.location.href = keycloakApi.buildLogoutUrl(idToken || undefined);
  }

  function localLogout(): void {
    tokenService.clearTokens();
    clearUser();
    isLoggedIn.value = false;
    window.location.href = '/home';
  }

  function stopRefreshTimer(): void {
    if (refreshTimer) clearInterval(refreshTimer);
  }

  // Wire this store into the plain apiClient module so requests carry auth
  // headers and retry-on-401 without apiClient importing Pinia directly.
  setAuthHook({
    ensureValidToken,
    getAccessToken: tokenService.getAccessToken,
    onUnauthorized: () => logout(),
  });

  const displayName = computed(() => currentUser.value?.firstName || currentUser.value?.username);

  return {
    isLoggedIn,
    currentUser,
    displayName,
    initializeAuth,
    login,
    handleCallback,
    ensureValidToken,
    logout,
    localLogout,
    stopRefreshTimer,
  };
});
