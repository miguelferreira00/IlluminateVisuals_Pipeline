import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contacto, ContactoResumo, ContactoRequest, PagedResponse, ContactoEstado, Setor } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ContactoService {
  constructor(private http: HttpClient) {}

  listar(estado?: ContactoEstado, setor?: Setor, search?: string, page = 0, size = 50): Observable<PagedResponse<ContactoResumo>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'atualizadoEm,desc');
    if (estado) params = params.set('estado', estado);
    if (setor)  params = params.set('setor', setor);
    if (search) params = params.set('search', search);
    return this.http.get<PagedResponse<ContactoResumo>>('/api/contactos', { params, withCredentials: true });
  }

  buscarPorId(id: number): Observable<Contacto> {
    return this.http.get<Contacto>(`/api/contactos/${id}`, { withCredentials: true });
  }

  criar(req: ContactoRequest): Observable<Contacto> {
    return this.http.post<Contacto>('/api/contactos', req, { withCredentials: true });
  }

  atualizar(id: number, req: ContactoRequest): Observable<Contacto> {
    return this.http.put<Contacto>(`/api/contactos/${id}`, req, { withCredentials: true });
  }

  atualizarEstado(id: number, estado: ContactoEstado, contacto: Contacto): Observable<Contacto> {
    // Explicitly pick only ContactoRequest fields — avoids sending id/criadoEm/atualizadoEm to the backend
    const { empresa, setor, nomeDecisor, cargo, telefone, email, linkedinUrl, scorePotencial, notas } = contacto;
    return this.atualizar(id, { empresa, setor, nomeDecisor, cargo, telefone, email, linkedinUrl, estado, scorePotencial, notas });
  }
}
