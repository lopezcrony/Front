import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { LoginService } from './login.service';
import { ValidationService } from '../../shared/validators/validations.service';
import { LoginLoadingComponent } from '../../shared/loading/loginLoading.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoginLoadingComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private validationService: ValidationService,

  ) {
    this.loginForm = this.fb.group({
      correoUsuario: ['', validationService.getValidatorsForField("login", "correoUsuario")],
      claveUsuario: ['', validationService.getValidatorsForField("login", "claveUsuario")],
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('login', fieldName, errorKey);
    }
    return '';
  }

  private markFormFieldsAsTouched() {
    Object.values(this.loginForm.controls).forEach(control => control.markAsTouched());
  }

  onSubmit() {
    if (this.loginForm.invalid) return this.markFormFieldsAsTouched();
    this.isLoading = true;

    const formValue = this.loginForm.value;

    const loginData = {
      correoUsuario: formValue.correoUsuario,
      claveUsuario: formValue.claveUsuario
    };

    this.loginService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }
}