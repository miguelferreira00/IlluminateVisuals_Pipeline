import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardKpis, CallsPorDia } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  kpis(): Observable<DashboardKpis> {
    return this.http.get<DashboardKpis>('/api/dashboard/kpis', { withCredentials: true });
  }

  callsPorDia(): Observable<CallsPorDia[]> {
    return this.http.get<CallsPorDia[]>('/api/dashboard/calls-por-dia', { withCredentials: true });
  }
}
