import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, finalize, tap, timeout } from 'rxjs';
import { CurrentUser, UserRole } from '../models/models';

export interface LoginRequest { role: UserRole; password?: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<CurrentUser | null>(null);

  readonly user       = this._user.asReadonly();
  readonly isAdmin    = computed(() => this._user()?.role === 'ADMIN');
  readonly isLoggedIn = computed(() => this._user() !== null);

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<CurrentUser> {
    return this.http.post<CurrentUser>('/api/auth/login', req, { withCredentials: true }).pipe(
      timeout(8000),
      tap(user => this._user.set(user))
    );
  }

  me(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>('/api/auth/me', { withCredentials: true }).pipe(
      timeout(5000),
      tap(user => this._user.set(user))
    );
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      finalize(() => { this._user.set(null); this.router.navigate(['/login']); })
    ).subscribe();
  }
}
