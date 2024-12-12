import { Component, OnInit, Provider } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { AbstractControl, ValidationErrors } from '@angular/forms';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { CRUDComponent } from '../../shared/crud/crud.component';
import { CrudModalDirective } from '../../shared/directives/crud-modal.directive';
import { ValidationService } from '../../shared/validators/validations.service';

import { Shopping } from '../shoppings/shopping.model';
import { ShoppingsService } from '../shoppings/shoppings.service';
import { ProvidersService } from '../providers/providers.service';
import { ProductsService } from '../products/products.service';

import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Product } from '../products/products.model';

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    CRUDComponent,
    CrudModalDirective,
    RouterModule
  ],
  templateUrl: './shoppingsDetails.create.component.html',
  styleUrls: ['./shoppingsDetails.component.css'],
})
export class ShoppingsComponent implements OnInit {
  shoppingForm: FormGroup;
  shoppings: Shopping[] = [];
  providers: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  filteredProviders: any[] = [];
  filteredShoppings: Shopping[] = [];

  constructor(
    private fb: FormBuilder,
    private shoppingService: ShoppingsService,
    private providerService: ProvidersService,
    private Router: Router,
    private productService: ProductsService,
    private toastr: ToastrService,
    private validationService: ValidationService
  ) {
    this.shoppingForm = this.fb.group({
      shopping: this.fb.group({
        idProveedor: ['', this.validationService.getValidatorsForField('shoppings', 'idProveedor')],
        fechaCompra: ['', [this.fechaNoPosteriorValidator]],
        numeroFactura: ['', this.validationService.getValidatorsForField('shoppings', 'numeroFactura')],
        valorCompra: [{ value: 0, disabled: true }],
      }),
      shoppingDetail: this.fb.array([])
    });
  }

  ngOnInit() {
    this.searchProvider;
    this.searchProduct;
    this.loadData();
    this.addShoppingDetail();
  }

  get shoppingDetailArray() {
    return this.shoppingForm.get('shoppingDetail') as FormArray;
  }

  loadShoppings() {
    this.shoppingService.getAllShoppings().subscribe((data: any) => {
      this.shoppings = data; // Asegúrate de que el formato sea correcto
    });
  }

  loadData() {
    forkJoin({
      providers: this.providerService.getAllProviders(),
      products: this.productService.getAllProducts(),
      shoppings: this.shoppingService.getAllShoppings()
    }).subscribe(({ providers, products, shoppings }) => {
      this.providers = providers.filter(p => p.estadoProveedor === true);
      this.products = products.filter(pr => pr.estadoProducto === true);
      this.filteredShoppings = shoppings;
    })
  }

  searchProduct(event: any) {
    const query = event.query.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.nombreProducto.toLowerCase().includes(query)
    );
  }

  searchProvider(event: any) {
    const query = event.query.toLowerCase();
    this.filteredProviders = this.providers.filter(provider =>
      provider.nombreProveedor.toLowerCase().includes(query)
    );
  }

  createShoppingDetail(): FormGroup {
    return this.fb.group({
      idProducto: ['', this.validationService.getValidatorsForField('shoppings', 'idProducto')],
      codigoBarra: ['', this.validationService.getValidatorsForField('shoppings', 'codigoBarra')],
      cantidadProducto: ['', this.validationService.getValidatorsForField('shoppings', 'cantidadProducto')],
      precioCompraUnidad: ['', this.validationService.getValidatorsForField('shoppings', 'precioCompraUnidad')],
      subtotal: [{ value: 0, disabled: true }]
    });
  }

  addShoppingDetail() {

    this.shoppingDetailArray.push(this.createShoppingDetail());
  }

  removeShoppingDetail(index: number) {
    this.shoppingDetailArray.removeAt(index);
    this.calculateTotalValue();
  }

  calculateSubtotal(index: number) {
    const detailGroup = this.shoppingDetailArray.at(index);
    const cantidad = detailGroup.get('cantidadProducto')?.value || 0;
    const precio = detailGroup.get('precioCompraUnidad')?.value || 0;
    const subtotal = cantidad * precio;

    detailGroup.patchValue({ subtotal });

    // Calcula el total después de actualizar el subtotal
    this.calculateTotalValue();
  }

  calculateTotalValue() {
    const shoppingDetailArray = this.shoppingForm.get('shoppingDetail') as FormArray;
    const valorCompra = shoppingDetailArray.controls.reduce((acc, control) => {
      const subtotal = control.get('subtotal')?.value || 0;
      return acc + subtotal;
    }, 0);

    // Actualiza el valor de compra en el control correspondiente
    this.shoppingForm.get('shopping.valorCompra')?.setValue(valorCompra);
  }

  fechaNoPosteriorValidator(control: AbstractControl): ValidationErrors | null {
    const fechaSeleccionada = new Date(control.value);
    const fechaActual = new Date();

    // Ajustar la hora a 0 para comparar solo la fecha
    fechaActual.setHours(0, 0, 0, 0);

    return fechaSeleccionada > fechaActual ? { fechaPosterior: true } : null;
  }

  onDateChange(event: Date) {
    if (event) {
      // Formatear la fecha a "YYYY-MM-DD"
      const formattedDate = event.toISOString().split('T')[0];
      this.shoppingForm.patchValue({
        fechaCompra: formattedDate
      });
    }
  }


  validateNumberInput(event: any, field: string): void {
    const value = event.target.value;
    if (value < 1) {
      // Evita valores negativos o cero para cantidadProducto y precioCompraUnidad
      event.target.value = '';
      this.shoppingForm.get(field)?.setValue(null); // Resetea el campo si el valor es inválido
    }
  }

  validateNumberCodeBarInput(event: any, field: string): void {
    const value = event.target.value;
    if (value < 0) {
      // Evita valores negativos o cero para cantidadProducto y precioCompraUnidad
      event.target.value = '';
      this.shoppingForm.get(field)?.setValue(null); // Resetea el campo si el valor es inválido
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.shoppingForm.get(`shopping.${fieldName}`) ||
      this.shoppingDetailArray.at(0)?.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  }

  isFieldInvalidDetail(index: number, fieldName: string): boolean {
    const detail = this.shoppingDetailArray.at(index);
    const field = detail?.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  }

  isFieldEmpty(fieldName: string): boolean {
    const field = this.shoppingForm.get(fieldName);
    return !field?.value; // Retorna true si el valor es null, undefined o una cadena vacía
  }

  isFieldEmptyDetail(fieldName: string): boolean {
    const field = this.shoppingDetailArray.get(fieldName);
    return !field?.value; // Retorna true si el valor es null, undefined o una cadena vacía
  }

  getErrorMessage(fieldName: string): string {
    const control = this.shoppingForm.get(`shopping.${fieldName}`) ||
      this.shoppingDetailArray.at(0)?.get(fieldName);

    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('shoppings', fieldName, errorKey);
    }
    return '';
  }

  getErrorMessageDetail(index: number, fieldName: string): string {
    const detail = this.shoppingDetailArray.at(index);
    const control = detail?.get(fieldName);
    
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('shoppings', fieldName, errorKey);
    }
    return '';
  }

  private markFormFieldsAsTouched() {
    Object.values(this.shoppingForm.controls).forEach(c => c.markAsTouched());
  }

  saveShopping() {
    if (this.shoppingForm.invalid) {
      return  this.markFormFieldsAsTouched();;
    }

    const formValue = this.shoppingForm.getRawValue();

    // Convertir la fechaCompra al formato "YYYY-MM-DD"
    const rawDate = new Date(formValue.shopping.fechaCompra);
    const formattedDate = rawDate.toISOString().split('T')[0]; // Obtener solo la parte de la fecha

    const shoppingData = {
      ...formValue.shopping,
      fechaCompra: formattedDate, // Fecha en formato "YYYY-MM-DD"
      estadoCompra: true, // Asegurar el estado por defecto
      fechaRegistro: new Date().toISOString() // Fecha actual para registro
    };

    const shoppingDetails = formValue.shoppingDetail.map((detail: { idProducto: { idProducto: any; }; }) => ({
      ...detail,
      idProducto: detail.idProducto.idProducto
    }));

    if (shoppingDetails.length === 0) {
      this.toastr.error('Debe agregar al menos un detalle de compra.', 'Error');
      return;
    }

    this.shoppingService.createShopping(shoppingData, shoppingDetails).subscribe({
      next: (response) => {
        this.toastr.success('Compra y detalles guardados exitosamente.', 'Éxito');
        this.resetForm();
        this.Router.navigate(['/shoppingview']);
      },
      error: (error) => { this.toastr.error(error, 'Error'); }
    });
  }


  resetForm() {
    this.shoppingForm.reset();
    this.shoppingDetailArray.clear();
    this.addShoppingDetail();
  }

  changeShoppingStatus(updatedShopping: Shopping) {
    const estadoShopping = updatedShopping.estadoCompra ?? false;

    this.shoppingService.updateStatusShopping(updatedShopping.idCompra, estadoShopping).subscribe({
      next: () => {
        [this.shoppings, this.filteredShoppings].forEach(list => {
          const index = list.findIndex(c => c.idCompra === updatedShopping.idCompra);
          if (index !== -1) {
            list[index] = { ...list[index], ...updatedShopping };
          }
        });
        this.toastr.success('Estado actualizado con éxito', 'Éxito');
      },
      error: () => {
        this.toastr.error('Error al actualizar el estado', 'Error');
      }
    });
  }

}