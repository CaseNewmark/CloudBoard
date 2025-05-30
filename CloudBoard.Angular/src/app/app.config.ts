import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { API_BASE_URL } from './services/api-client-service';
import { ConfirmationService, MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme:{
        preset: Aura
      }
    }),
    provideRouter(routes),
    {
      provide: API_BASE_URL,
      useValue: 'http://localhost:4200'
    },
    MessageService,
    ConfirmationService
  ]
};
