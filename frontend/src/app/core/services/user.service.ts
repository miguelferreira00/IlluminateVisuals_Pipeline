import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrentUser } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  admins(): Observable<CurrentUser[]> {
    return this.http.get<CurrentUser[]>('/api/users/admins', { withCredentials: true });
  }
}
