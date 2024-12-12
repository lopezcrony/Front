import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { CrudModalDirective } from '../../shared/directives/crud-modal.directive';
import { CRUDComponent } from '../../shared/crud/crud.component';
import { AlertsService } from '../../shared/alerts/alerts.service';
import { ValidationService } from '../../shared/validators/validations.service';

import { ProvidersService } from './providers.service';
import { Proveedor } from './providers.model';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    CRUDComponent,
    CrudModalDirective,
  ],
  templateUrl: './providers.component.html',
})

export class ProvidersComponent implements OnInit {

  providers: Proveedor[] = [];
  // Aquí se guardan los proveedores filtrados según la búsqueda
  filteredProviders: Proveedor[] = [];
  providerForm: FormGroup;
  showModal = false;
  isEditing = false;

  columns: { field: string, header: string, type: string }[] = [
    { field: 'nitProveedor', header: 'NIT', type: 'text' },
    { field: 'nombreProveedor', header: 'Nombre', type: 'text' },
    { field: 'direccionProveedor', header: 'Dirección', type: 'text' },
    { field: 'telefonoProveedor', header: 'Teléfono', type: 'text' },
  ];
  
  constructor(
    private providersService: ProvidersService,
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private toastr: ToastrService,
    private validationService: ValidationService
  ) {

    this.providerForm = this.fb.group({
      idProveedor: [null],
      nitProveedor: ['', this.validationService.getValidatorsForField('providers', 'nitProveedor')],
      nombreProveedor: ['', this.validationService.getValidatorsForField('providers', 'nombreProveedor')],
      direccionProveedor: ['', this.validationService.getValidatorsForField('providers', 'direccionProveedor')],
      telefonoProveedor: ['', this.validationService.getValidatorsForField('providers', 'telefonoProveedor')],
      estadoProveedor: [true]
    });
  }

  loadProviders() {
    this.providersService.getAllProviders().subscribe(data => {
      this.providers = data;
      this.filteredProviders = data;
    });
  }

  ngOnInit() {
    this.loadProviders();
  }

  openCreateModal() {
    this.isEditing = false;
    this.providerForm.reset({ estadoProveedor: true });
    this.showModal = true;
  };

  openEditModal(provider: Proveedor) {
    this.isEditing = true;
    this.providerForm.patchValue(provider);
    this.showModal = true;
  };

  cancelModalMessage() {
    this.alertsService.menssageCancel()
  };

  closeModal() {
    this.showModal = false;
    this.providerForm.reset();
  };

  isFieldInvalid(fieldName: string): boolean {
    const field = this.providerForm.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  };

  getErrorMessage(fieldName: string): string {
    const control = this.providerForm.get(fieldName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('providers', fieldName, errorKey);
    }
    return '';
  };

  private markFormFieldsAsTouched() {
    Object.values(this.providerForm.controls).forEach(control => control.markAsTouched());
  };

  // Crea o actualiza un proveedor
  saveProvider() {

    if (this.providerForm.invalid) { return this.markFormFieldsAsTouched(); }

    const providerData = this.providerForm.value
    const request = this.isEditing
      ? this.providersService.updateProvider(providerData)
      : this.providersService.createProvider(providerData);

    request.subscribe({
      next: () => {
        this.toastr.success('¡Proveedor guardado con éxito!', 'Éxito');
        this.loadProviders();
        this.closeModal();
      },
      error: (error) => {
        this.toastr.error(error, 'Error');
      }
    });
  }

  searchProviders(query: string) {
    this.filteredProviders = this.providers.filter(provider =>
      provider.nitProveedor.toLowerCase().includes(query.toLowerCase()) ||
      provider.nombreProveedor.toLowerCase().includes(query.toLowerCase()) ||
      provider.direccionProveedor.toLowerCase().includes(query.toLowerCase()) ||
      provider.telefonoProveedor.toLowerCase().includes(query.toLowerCase())
    );
  };

  changeProviderStatus(updatedProvider: Proveedor) {
    const estadoCliente = updatedProvider.estadoProveedor ?? false;

    this.providersService.updateStatusProvider(updatedProvider.idProveedor, estadoCliente).subscribe({
      next: () => {
        [this.providers, this.filteredProviders].forEach(list => {
          const index = list.findIndex(p => p.idProveedor === updatedProvider.idProveedor);
          if (index !== -1) {
            list[index] = { ...list[index], ...updatedProvider };
          }
        });
        this.toastr.success('Estado del proveedor actualizado con éxito', 'Éxito');
      },
      error: () => {
        this.toastr.error('Error al actualizar el estado del proveedor', 'Error');
      }
    });
  };

};
