import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { CRUDComponent } from '../../shared/crud/crud.component';
import { CrudModalDirective } from '../../shared/directives/crud-modal.directive';
import { AlertsService } from '../../shared/alerts/alerts.service';
import { ValidationService } from '../../shared/validators/validations.service';

import { User } from './users.model';
import { Role } from '../roles/roles.model';
import { UsersService } from './users.service';
import { RolesService } from '../roles/roles.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  imports: [
    ...SHARED_IMPORTS,
    CRUDComponent,
    CrudModalDirective,
  ],
})

export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  columns = [
    { field: 'nombreRol', header: 'Rol', type: 'text' },
    { field: 'cedulaUsuario', header: 'Cédula', type: 'text' },
    { field: 'nombreUsuario', header: 'Nombre', type: 'text' },
    { field: 'apellidoUsuario', header: 'Apellido', type: 'text' },
    { field: 'telefonoUsuario', header: 'Teléfono', type: 'text' },
    { field: 'correoUsuario', header: 'Correo', type: 'text' },
  ];
  userForm!: FormGroup;
  showModal = false;
  isEditing = false;

  constructor(
    private userService: UsersService,
    private roleService: RolesService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private validationService: ValidationService,
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.userForm = this.fb.group({
      idUsuario: [null],
      idRol: ['', this.validationService.getValidatorsForField('users', 'idRol')],
      cedulaUsuario: ['', this.validationService.getValidatorsForField('users', 'cedulaUsuario')],
      nombreUsuario: ['', this.validationService.getValidatorsForField('users', 'nombreUsuario')],
      apellidoUsuario: ['', this.validationService.getValidatorsForField('users', 'apellidoUsuario')],
      telefonoUsuario: ['', this.validationService.getValidatorsForField('users', 'telefonoUsuario')],
      correoUsuario: ['', this.validationService.getValidatorsForField('users', 'correoUsuario')],
      claveUsuario: [''],
      confirmarClave: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      roles: this.roleService.getAllRoles(),
      users: this.userService.getAllUsers()
    }).subscribe(({ roles, users }) => {
      this.filteredRoles = roles.filter(r => r.estadoRol === true);
      this.roles = roles;
      this.users = users.map((user: User) => {
        const role = this.roles.find(r => r.idRol === user.idRol)!;
        return { ...user, nombreRol: role.nombreRol };
      });
      this.filteredUsers = this.users;
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe(data => {
      this.roles = data.filter(r => r.estadoRol === true);
    });
  }

  openCreateModal() {
    this.isEditing = false;
    // Reset form with initial validators for new user
    this.userForm.get('claveUsuario')?.setValidators(
      this.validationService.getValidatorsForField('users', 'claveUsuario')
    );
    this.userForm.get('confirmarClave')?.setValidators(
      this.validationService.getValidatorsForField('users', 'claveUsuario')
    );
    this.userForm.reset({ estadoUsuario: true });
    this.userForm.updateValueAndValidity();
    this.showModal = true;
  }

  openEditModal(user: User) {
    this.isEditing = true;
    // Remove validators for password fields in edit mode
    this.userForm.get('claveUsuario')?.clearValidators();
    this.userForm.get('confirmarClave')?.clearValidators();
    this.userForm.patchValue({
      ...user,
      claveUsuario: '',
      confirmarClave: ''
    });
    this.userForm.get('claveUsuario')?.updateValueAndValidity();
    this.userForm.get('confirmarClave')?.updateValueAndValidity();
    this.showModal = true;
  }

  cancelModalMessage() {
    this.alertsService.menssageCancel();
  }

  closeModal() {
    this.showModal = false;
    this.userForm.reset();
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('claveUsuario')?.value;
    const confirmPassword = g.get('confirmarClave')?.value;
    
    // Solo validar si ambos campos tienen valor
    if (password || confirmPassword) {
      return password === confirmPassword ? null : { 'mismatch': true };
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('users', fieldName, errorKey);
    }
    return '';
  }

  private markFormFieldsAsTouched() {
    Object.values(this.userForm.controls).forEach(control => control.markAsTouched());
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.markFormFieldsAsTouched();
      return;
    }

    const userData = { ...this.userForm.value };

    // Validar contraseñas solo si estamos creando o si se ingresó una nueva contraseña
    if (!this.isEditing || userData.claveUsuario) {
      if (userData.claveUsuario !== userData.confirmarClave) {
        this.toastr.error('Las contraseñas no coinciden', 'Error');
        return;
      }
    }

    // Si estamos editando y no se ingresó nueva contraseña, la eliminamos
    if (this.isEditing && !userData.claveUsuario) {
      delete userData.claveUsuario;
    }
    delete userData.confirmarClave;

    const request = this.isEditing
      ? this.userService.updateUser(userData)
      : this.userService.createUser(userData);

    request.subscribe({
      next: () => {
        this.toastr.success(
          this.isEditing 
            ? '¡Usuario actualizado con éxito!' 
            : '¡Usuario creado con éxito!',
          'Éxito'
        );
        this.loadData();
        this.closeModal();
      },
      error: (error) => { this.toastr.error(error, 'Error'); }
    });
  }

  confirmDelete(user: User) {
    this.alertsService.confirm(
      `¿Estás seguro de eliminar a ${user.nombreUsuario} ${user.apellidoUsuario}?`,
      () => this.userService.deleteUser(user.idUsuario).subscribe({
        next: () => {
          this.toastr.success('Usuario eliminado exitosamente', 'Éxito');
          this.loadData();
        },
        error: (error) => {
          this.toastr.error(
            error.error?.message || 'Error al eliminar el usuario',
            'Error'
          );
        }
      })
    );
  }

  searchUser(query: string) {
    this.filteredUsers = this.users.filter(user => {
      const roleUser = user as User & { nombreRol?: string };
      const role = (roleUser.nombreRol || '').toLowerCase().includes(query.toLowerCase());
      const cedula = user.cedulaUsuario.toLowerCase().includes(query.toLowerCase());
      const nombre = user.nombreUsuario.toLowerCase().includes(query.toLowerCase());
      const apellido = user.apellidoUsuario.toLowerCase().includes(query.toLowerCase());
      const correo = user.correoUsuario.toLowerCase().includes(query.toLowerCase());

      return role || cedula || nombre || apellido || correo;
    });
  }

  changeUserStatus(updatedUser: User) {
    const estadoUsuario = updatedUser.estadoUsuario ?? false;

    this.userService.updateStatusUser(updatedUser.idUsuario, estadoUsuario).subscribe({
      next: () => {
        [this.users, this.filteredUsers].forEach(list => {
          const index = list.findIndex(c => c.idUsuario === updatedUser.idUsuario);
          if (index !== -1) {
            list[index] = { ...list[index], ...updatedUser };
          }
        });
        this.toastr.success('Estado del usuario actualizado con éxito', 'Éxito');
      },
      error: (error) => {
        this.toastr.error(
          error.error?.message || 'Error al actualizar el estado del usuario',
          'Error'
        );
      }
    });
  }

  exportUsers() {
    // Implementación del método de exportación
  }
}