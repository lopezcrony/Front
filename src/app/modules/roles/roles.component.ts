import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ValidationService } from '../../shared/validators/validations.service';
import { AlertsService } from '../../shared/alerts/alerts.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { CRUDComponent } from '../../shared/crud/crud.component';
import { CrudModalDirective } from '../../shared/directives/crud-modal.directive';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { Role, Permission, PermissionGroup } from './roles.model';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    CRUDComponent,
    CrudModalDirective,
  ],
})
export class RolesComponent implements OnInit {
  filteredRoles: Role[] = [];
  roles: Role[] = [];
  permissionGroups: PermissionGroup[] = [];
  rolesForm!: FormGroup;
  showModal = false;
  isEditing = false;
  columns = [
    { field: 'nombreRol', header: 'Nombre', type: 'text' },
  ];

  constructor(
    private roleService: RolesService,
    private permissionsService: PermissionsService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private validationService: ValidationService,
  ) {
    this.initForm();
  }

  private initForm() {
    this.rolesForm = this.fb.group({
      idRol: [null],
      nombreRol: ['', this.validationService.getValidatorsForField('roles', 'nombreRol')],
      estadoRol: [true],
      permissions: this.fb.array([],)
    });
  }

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  private groupPermissions(permissions: Permission[]): PermissionGroup[] {
    const moduleMap = new Map<string, Permission[]>();
    
    permissions.forEach(permission => {
      const modulo = this.getModuleFromPermission(permission.nombrePermiso);
      if (!moduleMap.has(modulo)) {
        moduleMap.set(modulo, []);
      }
      moduleMap.get(modulo)?.push(permission);
    });

    return Array.from(moduleMap.entries()).map(([modulo, permisos]) => ({
      modulo,
      icon: this.getModuleIcon(modulo),
      permisos,
      checked: false
    }));
  }

  private getModuleFromPermission(permissionName: string): string {
    if (permissionName.includes('Rol')) return 'Roles';
    if (permissionName.includes('Usuario')) return 'Usuarios';
    if (permissionName.includes('Venta')) return 'Ventas';
    if (permissionName.includes('Proveedor')) return 'Proveedores';
    if (permissionName.includes('Producto')) return 'Productos';
    if (permissionName.includes('Crédito') || permissionName.includes('Abono')) return 'Créditos';
    if (permissionName.includes('Cliente')) return 'Clientes';
    if (permissionName.includes('Categoría')) return 'Categorias';
    if (permissionName.includes('Compra')) return 'Compras';
    if (permissionName.includes('Devolución')) return 'Devoluciones';
    return 'Otros';
  }

  private getModuleIcon(modulo: string): string {
    const iconMap: { [key: string]: string } = {
      'Roles': 'pi pi-users',
      'Usuarios': 'pi pi-user',
      'Ventas': 'pi pi-shopping-cart',
      'Proveedores': 'pi pi-truck',
      'Productos': 'pi pi-box',
      'Créditos': 'pi pi-money-bill',
      'Clientes': 'pi pi-user-plus',
      'Categorias': 'pi pi-tags',
      'Compras': 'pi pi-shopping-bag',
      'Devoluciones': 'pi pi-replay'
    };
    return iconMap[modulo] || 'pi pi-circle';
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.filteredRoles = data.map(role => ({
          ...role,
          permissions: role.Permissions?.map(p => p.nombrePermiso).join(', ') || ''
        }));
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.toastr.error('Error al cargar los roles');
      }
    });
  }

  loadPermissions() {
    this.permissionsService.getAllPermissions().subscribe({
      next: (data) => {
        this.permissionGroups = this.groupPermissions(data);
        this.initPermissionsForm(data);
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.toastr.error('Error al cargar los permisos');
      }
    });
  }

  initPermissionsForm(permissions: Permission[]) {
    const permissionsControls = permissions.map(() => this.fb.control(false));
    this.rolesForm.setControl('permissions', this.fb.array(permissionsControls));
  }

  openCreateModal() {
    this.isEditing = false;
    this.rolesForm.reset({ estadoRol: true });
    const permissions = this.rolesForm.get('permissions') as FormArray;
    permissions.controls.forEach(control => control.setValue(false));
    this.permissionGroups.forEach(group => group.checked = false);
    this.selectAll = false;
    this.showModal = true;
  }

  openEditModal(role: Role) {
    this.isEditing = true;
    this.rolesForm.patchValue({
      idRol: role.idRol,
      nombreRol: role.nombreRol,
      estadoRol: role.estadoRol
    });

    const permissions = this.rolesForm.get('permissions') as FormArray;
    const allPermissions = this.permissionGroups.flatMap(g => g.permisos);
    
    permissions.controls.forEach((control, index) => {
      const permission = allPermissions[index];
      const isChecked = role.Permissions?.some(p => p.idPermiso === permission.idPermiso);
      control.setValue(isChecked);
    });

    this.permissionGroups.forEach(group => {
      group.checked = this.isGroupChecked(group);
    });

    this.updateSelectAllState();
    this.showModal = true;
  }

  toggleGroupPermissions(group: PermissionGroup) {
    const permissions = this.rolesForm.get('permissions') as FormArray;
    const allPermissions = this.permissionGroups.flatMap(g => g.permisos);
    
    group.permisos.forEach(permission => {
      const index = allPermissions.findIndex(p => p.idPermiso === permission.idPermiso);
      if (index !== -1) {
        permissions.at(index).setValue(group.checked);
      }
    });
    
    this.updateSelectAllState();
  }

  onPermissionChange(group: PermissionGroup) {
    group.checked = this.isGroupChecked(group);
    this.updateSelectAllState();
  }

  // Método para actualizar el estado del checkbox "Seleccionar todos"
  private updateSelectAllState() {
    const permissions = this.rolesForm.get('permissions') as FormArray;
    this.selectAll = permissions.controls.every(control => control.value === true);
  }
  
  isGroupChecked(group: PermissionGroup): boolean {
    const permissions = this.rolesForm.get('permissions') as FormArray;
    const allPermissions = this.permissionGroups.flatMap(g => g.permisos);
    
    return group.permisos.every(permission => {
      const index = allPermissions.findIndex(p => p.idPermiso === permission.idPermiso);
      return index !== -1 && permissions.at(index).value;
    });
  }

  isGroupIndeterminate(group: PermissionGroup): boolean {
    const permissions = this.rolesForm.get('permissions') as FormArray;
    const allPermissions = this.permissionGroups.flatMap(g => g.permisos);
    
    const groupPermissions = group.permisos.map(permission => {
      const index = allPermissions.findIndex(p => p.idPermiso === permission.idPermiso);
      return index !== -1 ? permissions.at(index).value : false;
    });
    
    const checkedCount = groupPermissions.filter(Boolean).length;
    return checkedCount > 0 && checkedCount < group.permisos.length;
  }

  findPermissionIndex(permission: Permission): number {
    return this.permissionGroups.flatMap(g => g.permisos)
      .findIndex(p => p.idPermiso === permission.idPermiso);
  }

    private hasSelectedPermissions(): boolean {
    const permissionsArray = this.rolesForm.get('permissions') as FormArray;
    return permissionsArray.controls.some(control => control.value === true);
  }

  selectAll: boolean = false;

  toggleAllPermissions(event: any) {
    const checked = event.checked;
    const permissions = this.rolesForm.get('permissions') as FormArray;
    
    permissions.controls.forEach(control => control.setValue(checked));
    this.permissionGroups.forEach(group => group.checked = checked);
    
    this.selectAll = checked;
  }

  saveRole() {
    // Primero validamos si hay permisos seleccionados
    if (!this.hasSelectedPermissions()) {
      this.toastr.error('Debe seleccionar al menos un permiso', 'Error al guardar');
      return; // Se detiene la ejecución aquí si no hay permisos
    }

    // Luego validamos el resto del formulario
    if (this.rolesForm.invalid) {
      Object.keys(this.rolesForm.controls).forEach(key => {
        const control = this.rolesForm.get(key);
        if (control) control.markAsTouched();
      });
      return;
    }

    // Si llegamos aquí, el formulario es válido y tiene permisos seleccionados
    const roleData = this.prepareRoleData();
    const request = this.isEditing
      ? this.roleService.updateRoles(roleData)
      : this.roleService.createRoles(roleData);

    request.subscribe({
      next: (response) => {
        this.toastr.success('¡Rol guardado con éxito!', 'Éxito');
        this.loadRoles();
        this.closeModal();
      },
      error: (error) => { this.toastr.error(error, 'Error'); }
    });
  }

  private prepareRoleData() {
    const formValue = this.rolesForm.value;
    return {
      ...formValue,
      permissions: this.permissionGroups
        .flatMap(g => g.permisos)
        .filter((_, index) => formValue.permissions[index])
        .map(p => p.nombrePermiso)
    };
  }

    //Este codigo es para eliminar el Rol

    confirmDelete(role: Role) {
      this.alertsService.confirm(
        `¿Estás seguro de eliminar a ${role.nombreRol}?`,
        () => this.roleService.deleteRoles(role.idRol).subscribe(() => {
          this.toastr.success('Rol eliminado exitosamente', 'Éxito');
          this.loadRoles();
        })
      );
    }
  
    closeModal() {
      this.showModal = false;
    }
  
    //Esto es para buscar los roles
    
    searchRoles(query: string) {
      this.filteredRoles = this.roles.filter(role =>
        role.nombreRol.toLowerCase().includes(query.toLowerCase())
      );
    }
  
    //Esto es para cambiar el estado del Rol
  
    changeRoleStatus(updatedRole: Role) {
      const estadoRol = updatedRole.estadoRol ?? false;
      
      this.roleService.updateStatusRole(updatedRole.idRol, estadoRol).subscribe({
        next: () => {
          [this.roles, this.filteredRoles].forEach(list => {
            const index = list.findIndex(c => c.idRol === updatedRole.idRol);
            if (index !== -1) {
              list[index] = { ...list[index], ...updatedRole };
            }
          });
          this.toastr.success('Estado del rol actualizado con éxito', 'Éxito');
        },
        error: () => {
          this.toastr.error('Error al actualizar el estado del rol', 'Error');
        }
      });
    }

    exportRoles() {
      // Implementar la lógica de exportación si es necesario
    }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.rolesForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.rolesForm.get(fieldName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('roles', fieldName, errorKey);
    }
    return '';
  }

  cancelModalMessage() {
    this.alertsService.menssageCancel()
  }
}