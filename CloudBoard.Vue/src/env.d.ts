/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Keycloak base URL (without /realms/...). Overrides the dev/production defaults in keycloakApi.ts. */
  readonly VITE_KEYCLOAK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
