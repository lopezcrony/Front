import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Product } from '../products/products.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class ProductsService {

  private apiUrl = `${environment.apiUrl}/productos`;
  private baseUrl = `${environment.apiUrl}/uploads`;


  constructor(private http: HttpClient, private authService: AuthService, private toastr: ToastrService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('img', file); // Campo 'img'

    return this.http.post<{ nombre: string }>(`${this.baseUrl}`, formData);
  }

  getImageUrl(productId: any): string {
    return `${this.baseUrl}/productos/${productId}`;
  }

  getBarcodeByProduct(idProducto: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/codigo_barra/${idProducto}`);
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getOneProduct(id: number): any {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createProduct(Product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, Product, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(Product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${Product.idProducto}`, Product, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateStatusProduct(id: number, status: boolean): Observable<Product> {
    const body = { estadoProducto: status };

    return this.http.patch<Product>(`${this.apiUrl}/${id}`, body, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Método para eliminar
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  checkProductExists(nombreProducto: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/products/exists/${encodeURIComponent(nombreProducto)}`);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de la red
      errorMessage = error.error.message;
    } else {
      // Error del lado del servidor
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
