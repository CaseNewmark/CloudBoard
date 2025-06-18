import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth for Keycloak URLs
    if (req.url.includes('localhost:8080/realms/cloudboard')) {
      return next.handle(req);
    }

    return from(this.authService.ensureValidToken()).pipe(
      switchMap((hasValidToken) => {
        if (hasValidToken) {
          const token = localStorage.getItem('access_token');
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(authReq);
        } else {
          // No valid token, let the request go through without auth
          return next.handle(req);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token might be invalid, try to refresh
          return from(this.authService.ensureValidToken()).pipe(
            switchMap((hasValidToken) => {
              if (hasValidToken) {
                // Retry the request with new token
                const token = localStorage.getItem('access_token');
                const authReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${token}`
                  }
                });
                return next.handle(authReq);
              } else {
                // Refresh failed, logout user
                this.authService.logout();
                return throwError(() => error);
              }
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}