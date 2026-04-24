import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reuniao, ReuniaoRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReuniaoService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Reuniao[]> {
    return this.http.get<Reuniao[]>('/api/reunioes', { withCredentials: true });
  }

  criar(req: ReuniaoRequest): Observable<Reuniao> {
    return this.http.post<Reuniao>('/api/reunioes', req, { withCredentials: true });
  }
}
