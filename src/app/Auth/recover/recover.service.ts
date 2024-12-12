import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RecoverService {
    private apiUrl = `${environment.apiUrl}/recover`;

    constructor(
        private http: HttpClient,
        private router: Router,
        private toastr: ToastrService,
    ) { }

    recovery(correoUsuario: string) {

        this.http.post(this.apiUrl, { correoUsuario: correoUsuario }).subscribe({
            next: () => {
                this.toastr.success('Se han enviado instrucciones para restablecer tu contraseña a tu correo electrónico');
                this.router.navigate(['/']);
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error al enviar la solicitud de recuperación:', error);
                if (error.status === 404) {
                    this.toastr.error('No se encontró un usuario con ese correo electrónico');
                } else if (error.status === 0) {
                    this.toastr.error('No se pudo conectar con el servidor. Verifica tu conexión o que el servidor esté en funcionamiento.');
                } else {
                    this.toastr.error('Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.');
                }
            }
        });

    }
}
