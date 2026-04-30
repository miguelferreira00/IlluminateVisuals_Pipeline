import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IcsStatus { connected: boolean; url: string; }

@Injectable({ providedIn: 'root' })
export class IcsCalendarService {
  constructor(private http: HttpClient) {}

  status(): Observable<IcsStatus> {
    return this.http.get<IcsStatus>('/api/ics/status', { withCredentials: true });
  }

  saveUrl(url: string): Observable<void> {
    return this.http.put<void>('/api/ics/url', { url }, { withCredentials: true });
  }

  removeUrl(): Observable<void> {
    return this.http.delete<void>('/api/ics/url', { withCredentials: true });
  }
}
