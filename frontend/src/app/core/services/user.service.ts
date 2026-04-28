import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrentUser, UserResumo } from '../models/models';

export interface CreateCallerRequest { nome: string; username: string; password: string; email?: string; }

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  admins(): Observable<CurrentUser[]> {
    return this.http.get<CurrentUser[]>('/api/users/admins', { withCredentials: true });
  }

  listar(): Observable<UserResumo[]> {
    return this.http.get<UserResumo[]>('/api/users', { withCredentials: true });
  }

  criarCaller(req: CreateCallerRequest): Observable<UserResumo> {
    return this.http.post<UserResumo>('/api/users/callers', req, { withCredentials: true });
  }

  alterarPassword(id: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`/api/users/${id}/password`, { newPassword }, { withCredentials: true });
  }

  desativar(id: number): Observable<void> {
    return this.http.put<void>(`/api/users/${id}/desativar`, {}, { withCredentials: true });
  }
}
