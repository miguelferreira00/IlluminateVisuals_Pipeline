import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, of } from 'rxjs';

// Tracks whether a session-restore attempt has already been made this page load.
// Prevents a new HTTP round-trip on every navigation when the session is expired.
let sessionRestoreAttempted = false;

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  if (sessionRestoreAttempted) {
    router.navigate(['/login']);
    return false;
  }

  sessionRestoreAttempted = true;
  return auth.me().pipe(
    map(() => true),
    catchError(() => { router.navigate(['/login']); return of(false); })
  );
};
