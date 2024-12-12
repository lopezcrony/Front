import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { RecoverService } from './recover.service';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.css']
})
export class RecoverComponent {
  correoUsuario: string = '';
  emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private recoverService: RecoverService
  ) {}

  volverALogin() {
    this.router.navigate(['/']);
  }

  validateEmail(): boolean {
    if (!this.emailPattern.test(this.correoUsuario)) {
      this.toastr.error('El correo electrónico debe tener un formato válido');
      return false;
    }
    return true;
  }

  enviarSolicitudRecuperacion() {
    if (!this.validateEmail()) {
      return;
    }
   this.recoverService.recovery(this.correoUsuario);

  }
}