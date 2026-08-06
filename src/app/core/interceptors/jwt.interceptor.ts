import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { PUBLIC_ENDPOINTS } from '../constants/auth.constants';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Check if request points to the NixLang API base URL
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  // Check if the URL matches any of the registered public endpoints
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => req.url.includes(endpoint));

  // Add authorization header with jwt token if user is logged in and request is to api
  if (isApiUrl && !isPublicEndpoint) {
    const currentSession = authService.session();
    if (currentSession?.accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${currentSession.accessToken}`
        }
      });
    }
  }

  return next(req);
};
