import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SlotDisponivel } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  constructor(private http: HttpClient) {}

  slots(dias = 14, duracaoMinutos = 30): Observable<SlotDisponivel[]> {
    const params = new HttpParams().set('dias', dias).set('duracaoMinutos', duracaoMinutos);
    return this.http.get<SlotDisponivel[]>('/api/agenda/slots', { params, withCredentials: true });
  }
}
