import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleStatus { connected: boolean; configured: boolean; }

@Injectable({ providedIn: 'root' })
export class GoogleCalendarService {
  constructor(private http: HttpClient) {}

  status(): Observable<GoogleStatus> {
    return this.http.get<GoogleStatus>('/api/google/status', { withCredentials: true });
  }

  authorize(): void {
    // Redireciona o browser para o fluxo OAuth2 do Google
    window.location.href = this.buildBackendUrl('/api/google/authorize');
  }

  disconnect(): Observable<void> {
    return this.http.delete<void>('/api/google/disconnect', { withCredentials: true });
  }

  private buildBackendUrl(path: string): string {
    const apiBase = (window as any).__API_BASE_URL__ ?? '';
    return apiBase + path;
  }
}
