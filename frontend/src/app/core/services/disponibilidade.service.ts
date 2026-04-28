import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DisponibilidadeService {
  constructor(private http: HttpClient) {}

  get(adminId: number, dataInicio: string, dataFim: string): Observable<string[]> {
    const params = new HttpParams()
      .set('adminId', adminId)
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);
    return this.http.get<string[]>('/api/disponibilidade', { params, withCredentials: true });
  }

  todos(dataInicio: string, dataFim: string): Observable<Record<string, {id: number, nome: string}[]>> {
    const params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim);
    return this.http.get<Record<string, {id: number, nome: string}[]>>('/api/disponibilidade/todos', { params, withCredentials: true });
  }

  toggle(dataHora: string): Observable<void> {
    return this.http.post<void>('/api/disponibilidade/toggle', { dataHora }, { withCredentials: true });
  }
}
