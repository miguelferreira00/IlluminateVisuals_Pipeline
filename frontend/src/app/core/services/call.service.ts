import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Call, CallRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CallService {
  constructor(private http: HttpClient) {}

  registar(req: CallRequest): Observable<Call> {
    return this.http.post<Call>('/api/calls', req, { withCredentials: true });
  }

  buscarPorContacto(contactoId: number): Observable<Call[]> {
    return this.http.get<Call[]>(`/api/contactos/${contactoId}/calls`, { withCredentials: true });
  }
}
