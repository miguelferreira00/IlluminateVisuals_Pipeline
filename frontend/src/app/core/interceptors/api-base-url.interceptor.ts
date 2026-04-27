import { HttpInterceptorFn } from '@angular/common/http';
import { buildApiUrl } from '../config/api.config';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);

  const nextReq = req.clone({
    url: buildApiUrl(req.url),
  });

  return next(nextReq);
};
