import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RestoreService } from './restore.service'; // Importa el servicio
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-restore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.css']
})
export class RestoreComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordError: string = '';
  token: string = '';

  passwordPattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private restoreService: RestoreService // Inyecta el servicio
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      console.log('Token recibido:', this.token);
    });
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validatePassword(): boolean {
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Las contraseñas no coinciden');
      return false;
    }
    if (!this.passwordPattern.test(this.newPassword)) {
      this.toastr.error('La contraseña debe tener entre 8 y 16 caracteres, incluir al menos una mayúscula, una minúscula y un número');
      return false;
    }
    return true;
  }

  onSubmit() {
    if (!this.validatePassword()) {
      return;
    }

    this.restoreService.restorePassword(this.token, this.newPassword).subscribe({
      next: (response: any) => {
        this.toastr.success('Tu contraseña ha sido actualizada exitosamente');
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al restablecer la contraseña:', error);
        if (error.status === 400) {
          this.toastr.error('El token de restablecimiento es inválido o ha expirado');
        } else if (error.status === 0) {
          this.toastr.error('No se pudo conectar con el servidor. Verifica tu conexión o que el servidor esté en funcionamiento.');
        } else {
          this.toastr.error('Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.');
        }
      }
    });
  }
}
