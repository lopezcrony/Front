import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { CRUDComponent } from '../../shared/crud/crud.component';
import { CrudModalDirective } from '../../shared/directives/crud-modal.directive';
import { AlertsService } from '../../shared/alerts/alerts.service';
import { ValidationService } from '../../shared/validators/validations.service';

import { ProvidersService } from '../providers/providers.service';
import { ReturnSaleService } from './return-sale.service';
import { ReturnSaleModel } from './return-sale.model';
import { Barcode } from '../barcodes/barcode.model';
import { BarcodesService } from '../barcodes/barcodes.service';
import { ProductsService } from '../products/products.service';
import { forkJoin, Subscription } from 'rxjs';
import { Product } from '../products/products.model';
import { ScannerSocketService } from '../scanner/scanner.service';


interface SelectOption {
  label: string;
  value: string;
}
@Component({
  selector: 'app-return-sale',
  standalone: true,
  imports: [    
    ...SHARED_IMPORTS,
    CRUDComponent,
    CrudModalDirective,
  ],
  templateUrl: './return-sale.component.html',
})
export class ReturnSaleComponent implements OnInit {

  providers:any []=[];
  barcode: any[] = [];
  returnSale: ReturnSaleModel[] = [];
  filteredReturnSale: ReturnSaleModel[] = [];
  products: any[] = [];
 returnSaleForm: FormGroup;
 
 private scannerSubscription: Subscription | null = null;
 private barcodeSubscription: Subscription | null = null;

    colums: { field: string, header: string, type: string }[] = [
    { field: 'codigoBarra', header: 'Código', type: 'text' },
    { field: 'nombreProducto', header: 'Producto', type: 'text' },
    { field: 'cantidad', header: 'Cantidad', type: 'text' },
    { field: 'tipoReembolso', header: 'Tipo Reembolso', type: 'text' },
    { field: 'motivoDevolucion', header: 'Motivo', type: 'text' },   
    { field: 'valorDevolucion', header: 'Valor', type: 'currency' },
    { field: 'fechaDevolucion', header: 'Fecha', type: 'date' },
  ];
  
  options: SelectOption[] = [
    { label: 'Dinero', value: 'Dinero' },
    { label: 'Producto', value: 'Producto' },
  ];

  motivos: SelectOption[] = [
    { label: 'Caducidad', value: 'Caducidad' },
    { label: 'Equivocación', value: 'Equivocación' },
  ];
  showModal = false;
  isEditing = false;

  constructor(
    private returnSaleService: ReturnSaleService,
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private toastr: ToastrService,
    private validationService: ValidationService,
    private providerService: ProvidersService,
    private barcodeService: BarcodesService,
    private productService: ProductsService,
    private scannerService: ScannerSocketService

  ) {
    this.returnSaleForm = this.fb.group({
      CodigoProducto: ['', validationService.getValidatorsForField('returnSale', 'CodigoProducto')],
      cantidad: ['', validationService.getValidatorsForField('returnSale', 'cantidad')],
      fechaDeBaja: new Date(),
      motivoDevolucion: ['', validationService.getValidatorsForField('returnSale', 'motivoDevolucion')],
      tipoReembolso: ['', validationService.getValidatorsForField('returnSale', 'tipoReembolso')],
      idProveedor: ['', validationService.getValidatorsForField('returnSale', 'idProveedor')],
    });
  }

  ngOnInit() {
    this.loadProviders();
    this.loadBardCode();
    this.returnSaleForm.get('tipoReembolso')?.valueChanges.subscribe((value) => {
      this.updateMotivosOptions(value);
    });  
    this.loadReturnSale() 
  }

  
    // Escucha cambios en `tipoReembolso` para actualizar dinámicamente los motivos
    updateMotivosOptions(tipoReembolso: string) {
      this.motivos = tipoReembolso === 'Dinero'
        ? [
            { label: 'Caducidad', value: 'Caducidad' },
            { label: 'Equivocación', value: 'Equivocación' }
          ]
        : [{ label: 'Caducidad', value: 'Caducidad' }];
    }
  


  loadReturnSale() {
    forkJoin({
      code: this.barcodeService.getAllBarcodes(),
      returnSale: this.returnSaleService.getReturnSale(),
      products: this.productService.getAllProducts()
    }).subscribe({
      next: ({returnSale, code, products }) => {

        this.products = products;
        this.barcode = code.map(c => {
          const product = this.products.find(p => p.idProducto === c.idProducto);
          return { ...c, nombreProducto: product?.nombreProducto };
        });

        this.returnSale = returnSale.map(repp => {
          const code = this.barcode.find(codes => codes.idCodigoBarra === repp.idCodigoBarra);
          return { 
            ...repp, 
            codigoBarra: code ? code.codigoBarra : 'Desconocido',
            nombreProducto: code ? code.nombreProducto : 'Desconocido'
          };
        });
        this.filteredReturnSale = this.returnSale; 
      },
      error: (error) => {
        console.error('Error al cargar los datos', error);
        this.toastr.error('Ocurrió un error al cargar los datos', 'Error');
      }
    })
  }

  loadProviders() {
    this.providerService.getAllProviders().subscribe(data => {
      this.providers = data.filter(p => p.estadoProveedor === true);
    });
  }

  loadBardCode() {
    this.barcodeService.getAllBarcodes().subscribe(data => {
      this.barcode = data;
      this.loadReturnSale();
    });
  }

  // Activar el scanner al enfocar el campo de código de barras
  onBarcodeFieldFocus() {
    this.scannerService.getLatestBarcode().subscribe({
      next: (code: string) => {
        this.handleScannedCode(code);
      },
      error: (error) => {
        console.error('Error al recibir datos del scanner:', error);
        this.toastr.error('Error al procesar el código escaneado.', 'Error');
      },
    });
  }
  
  // Desactivar el scanner al salir del campo de código de barras
  onBarcodeFieldBlur() {
    // Cancelar la suscripción si existe
    if (this.scannerSubscription) {
      this.scannerSubscription.unsubscribe();
      this.scannerSubscription = null;
    }
  }
  
  // Manejar el código escaneado
  private handleScannedCode(code: string) {
    // Suscripción al servicio de escaneo
    this.barcodeSubscription = this.scannerService.getLatestBarcode().subscribe({
      next: (barcodeData) => {
        if (barcodeData && barcodeData.barcode) {
          console.log('Código de barras recibido para buscar productos:', barcodeData.barcode);
  
          // Buscar el código en la lista de códigos de barras
          const barcode = this.barcode.find((b) => b.codigoBarra === barcodeData.barcode);
  
          if (barcode) {
            // Buscar el producto asociado al código de barra
            const product = this.products.find((p) => p.idProducto === barcode.idProducto);
  
            if (product) {
              // Rellenar el formulario con los datos del producto
              this.returnSaleForm.patchValue({
                CodigoProducto: barcode.codigoBarra// Campo vacío, el usuario debe completarlo
              });
              this.toastr.success(`Producto encontrado: ${product.nombreProducto}`, 'Scanner');
            } else {
              // Si no hay producto asociado
              this.toastr.warning('Producto no encontrado para este código.', 'Advertencia');
            }
          } else {
            // Si el código no existe en la lista de códigos de barras
            this.toastr.warning('Código de barra no registrado.', 'Advertencia');
          }
        } else {
          // Si el código escaneado es inválido o no llega correctamente
          this.toastr.warning('Código de barra no recibido o inválido.', 'Advertencia');
        }
      },
      error: (error) => {
        console.error('Error al recibir el código de barras:', error);
        this.toastr.error('Error al procesar el código de barras.', 'Error');
      },
    });
  }
  

  // Variable para manejar la suscripción

// Método para iniciar la escucha al escáner
startListeningToScanner() {
  console.log('Iniciando escucha al escáner...');
  this.barcodeSubscription = this.scannerService.getLatestBarcode().subscribe({
    next: (barcodeData) => {
      if (barcodeData && barcodeData.barcode) {
        this.handleScannedCode(barcodeData.barcode);
      }
    },
    error: (error) => {
      console.error('Error al recibir el código de barras:', error);
      this.toastr.error('Error al procesar el código de barras.', 'Error');
    },
  });
}

// Método para detener la escucha al escáner
stopListeningToScanner() {
  console.log('Deteniendo escucha al escáner...');
  if (this.barcodeSubscription) {
    this.barcodeSubscription.unsubscribe();
    this.barcodeSubscription = null;
  }
}

  openCreateModal() {
    this.isEditing = false;
    this.showModal = true;
  }

  closeModal() {
    this.stopListeningToScanner();
    this.loadReturnSale()
    this.showModal = false;
    this.returnSaleForm.reset();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.returnSaleForm.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.returnSaleForm.get(fieldName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('returnSale', fieldName, errorKey);
    }
    return '';
  }

  private markFormFieldsAsTouched() {
    Object.values(this.returnSaleForm.controls).forEach(control => control.markAsTouched());
  }

  saveReturnSale() {
    // Válida el formulario antes de enviarlo
    if (this.returnSaleForm.invalid) {
      this.markFormFieldsAsTouched();
      return;
    }

    const lossData = this.returnSaleForm.value;
    const request = this.isEditing ?
      this.returnSaleService.createReturnSale(lossData) :
      this.returnSaleService.createReturnSale(lossData);
      console.log(lossData)

    request.subscribe({
      next: () => {
        this.toastr.success('Devolución guardada con éxito!', 'Éxito');
        this.loadReturnSale();
        this.closeModal();
      },
      error: (error) => {
        this.toastr.error(error.message, 'Error');
        console.error('Error al agregar un registro', error);
        if (error.status === 500) {
          this.toastr.error('No se puede agregar', 'Error');
        } else {
          this.toastr.error('Ocurrió un error al agregar la devolucion, revise el stock.', 'Error');
        }
      }
    });

  }


  changeSaleStatus(updatedSale: ReturnSaleModel) {
    // Asegúrate de que el estado es un booleano (true o false)
    const estadoVentas = updatedSale.estado !== undefined ? updatedSale.estado : false;
  
    // Llamar al servicio para actualizar el estadoVenta
    this.returnSaleService.updateStatusSale(updatedSale.idDevolucionVenta, estadoVentas).subscribe({
      next: () => {
        // Actualiza las listas Sales y filteredSale
        [this.returnSale, this.filteredReturnSale].forEach(list => {
          const index = list.findIndex(sale => sale.idDevolucionVenta === updatedSale.idDevolucionVenta);
          if (index !== -1) {
            // Actualiza solo el campo 'estadoVenta' en lugar de reemplazar todo el objeto
            list[index] = { ...list[index], estado: estadoVentas };
          }
          console.log(estadoVentas)
        });
        this.toastr.success('Estado actualizado con éxito', 'Éxito');
      },
      error: () => {
        this.toastr.error('Error al actualizar el estado', 'Error');
      }
    });
  }
  
  cancelSale(updatedSale: ReturnSaleModel) {
    // Mostrar mensaje de confirmación
    this.alertsService.confirm(
    `¿Estás seguro de que deseas cancelar esta devolución?`,
      
      () => {
        updatedSale.estado = false;        
        this.changeSaleStatus(updatedSale);

        this.returnSaleService.cancelSale(updatedSale.idDevolucionVenta).subscribe({
          next: () => {
            this.loadReturnSale();
            this.toastr.success('Devolución anulada con éxito.', 'Éxito');
          },
          error: () => {
            this.toastr.error('Error al anular la devolución.', 'Error');
          }
        });

        
      },
      () => {
        this.toastr.info('Anulación cancelada', 'Información');
      }
    );
  }
  
  

  searchReturnSale(query: string) {
    if (!query) {
      this.filteredReturnSale = [...this.returnSale]; // Si no hay query, mostrar todos los resultados
      return;
    }

    // Define el estado que estás buscando. Aquí asumo que buscas "true" en la query.

    this.filteredReturnSale = this.returnSale.filter(returSale =>{
      const barCode = returSale as unknown as Barcode & {codigoBarra?: string};
      const code =(barCode.codigoBarra || '').toLowerCase().includes(query);
      const productName = returSale as unknown as Product & {nombreProducto?: string};
      const product = (productName.nombreProducto || '').toLowerCase().includes(query.toLowerCase());

     const reembolso= returSale.tipoReembolso.toLowerCase().includes(query.toLowerCase());
    const cantidad =returSale.cantidad.toString().includes(query.toLowerCase());
    const motivo =  returSale.motivoDevolucion.toLowerCase().includes(query.toLowerCase()) ;
    const fecha=  returSale.fechaDevolucion && new Date(returSale.fechaDevolucion).toLocaleDateString().includes(query.toLowerCase());
    const valor=  returSale.valorDevolucion.toString().includes(query.toLowerCase())

    const estado = (returSale.estado ? 'vigente' : 'anulado').includes(query.toLowerCase())
    
      return code || reembolso || cantidad || motivo ||fecha || valor || estado || product
    }
    );
  }


}
