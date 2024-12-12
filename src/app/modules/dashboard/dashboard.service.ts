
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDailyReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/dashboard/informe-diario`, { responseType: 'blob' });
  }

  getSales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ventas`);
  }

  getDetailsSale(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detalleVenta`);
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`);
  }
}
