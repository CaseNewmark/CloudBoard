import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import App from './App.vue';
import router from './router';
import { blurOnEnter } from './directives/blurOnEnter';
import { setApiBaseUrl } from './services/apiClient';
import { useAuthStore } from './stores/auth';

setApiBaseUrl(''); // same-origin; dev server proxies /api, production serves API and app together

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.use(ToastService);
app.use(ConfirmationService);

app.directive('blur-on-enter', blurOnEnter);

// Instantiated right after Pinia is installed so its apiClient auth-hook and
// token-refresh timer are wired up before the router runs its first guard.
useAuthStore().initializeAuth();

app.mount('#app');
