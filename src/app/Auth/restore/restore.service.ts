import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestoreService {
  private apiUrl = `${environment.apiUrl}/restore`;

  constructor(
    private http: HttpClient,
  ) {}

  restorePassword(token: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'x-reset-token': token
    });

    return this.http.post(this.apiUrl, { claveUsuario: newPassword }, { headers });
  }
}
