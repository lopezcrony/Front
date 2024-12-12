import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Subscription } from 'rxjs';

import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { ValidationService } from '../../shared/validators/validations.service';

import { DetailSale } from '../detailSale/detailSale.model';
import { Product } from '../products/products.model';
import { Credit } from '../credits/credit.model';
import { Client } from '../clients/client.model';

import { ProductsService } from '../products/products.service';
import { CreditsService } from '../credits/credits.service';
import { ClientService } from '../clients/clients.service';
import { SaleService } from './sales.service';
import { CreditDetailService } from '../detailCredit/creditDetail.service';
import { BarcodesService } from '../barcodes/barcodes.service';
import jsPDF from 'jspdf';
import { ScannerSocketService } from '../scanner/scanner.service';
import { AlertsService } from '../../shared/alerts/alerts.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  imports: [
    ...SHARED_IMPORTS,
  ]
})
export class SalesComponent implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef;

  busquedaForm: FormGroup;
  creditForm: FormGroup;
  clientForm!: FormGroup;

  minDate: Date = new Date();

  total: number = 0;
  montoRecibido: number = 0;
  cambio: number = 0;

  selectedClient: any = null;
  imprimirRecibo: boolean = true;
  showCreditModal: boolean = false;
  showClientModal: boolean = false;
  idSale: number | null = null;
  selectedProduct: any = null;
  searchText: string = '';

  products: Product[] = [];
  clients: Client[] = [];
  credits: Credit[] = [];
  detailSale: any[] = [];

  filteredProducts: Product[] = [];
  filteredCredits: Credit[] = [];
  filteredBarcodes: any[] = [];

  private barcodeSubscription!: Subscription;


  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private productService: ProductsService,
    private barcodeService: BarcodesService,
    private creditService: CreditsService,
    private creditDetailService: CreditDetailService,
    private clientService: ClientService,
    private toastr: ToastrService,
    private validationService: ValidationService,
    private scannerSocketService: ScannerSocketService,
    private alertsService: AlertsService,
  ) {
    this.busquedaForm = this.fb.group({
      busqueda: ['']
    });
    this.creditForm = this.fb.group({
      cliente: [null, Validators.required],
      montoCredito: [0, [Validators.required, Validators.min(1)]],
      plazoMaximo: ['', Validators.required],
      totalVenta: [{ value: this.total, disabled: true }]
    });
    this.clientForm = this.fb.group({
      idCliente: [null],
      cedulaCliente: ['', this.validationService.getValidatorsForField('clients', 'cedulaCliente')],
      nombreCliente: ['', this.validationService.getValidatorsForField('clients', 'nombreCliente')],
      apellidoCliente: ['', this.validationService.getValidatorsForField('clients', 'apellidoCliente')],
      direccionCliente: ['', this.validationService.getValidatorsForField('clients', 'direccionCliente')],
      telefonoCliente: ['', this.validationService.getValidatorsForField('clients', 'telefonoCliente')],
      estadoCliente: [true]
    });
  }

  ngOnInit() { this.loadProducts(); this.loadSaleFromLocalStorage(); // Agregar la suscripción al scanner 
    this.barcodeSubscription = this.scannerSocketService.getLatestBarcode() .subscribe(barcodeData => { 
      if (barcodeData && barcodeData.barcode) { // Mostrar el código de barras en el input 
        console.log('Código de barras recibido para buscar productos:', barcodeData.barcode); // Añadimos log para verificar 
        this.busquedaForm.patchValue({ busqueda: barcodeData.barcode }); // Limpiar el input después de 5 segundos 
        setTimeout(() => { this.busquedaForm.patchValue({ busqueda: '' }); }, 5000); // Usar el método existente 
        this.searchByBarcode(barcodeData.barcode); } }); }
  ngOnDestroy() {
    if (this.barcodeSubscription) {
      this.barcodeSubscription.unsubscribe();
    }
  };

  loadProducts() {
    this.productService.getAllProducts().subscribe(data => {
      this.products = data.filter(p => p.estadoProducto === true);
      this.filteredProducts = [...this.products];
    });
  }

  // --------------------------------------BUSCADOR DE PRODUCTOS-------------------------------------------
  handleSearch(event: any, searchInput: any): void {
    const query = event.query.toLowerCase();
    this.searchText = query; // Guardamos el texto de búsqueda
    const isBarcode = /^[0-9]+$/.test(query);

    if (isBarcode) {
      setTimeout(() => {
        this.searchByBarcode(query);
      }, 700);
    } else {
      let exactMatches = this.products.filter(p =>
        p.nombreProducto.toLowerCase() === query
      );

      let partialMatches = this.products.filter(p =>
        p.nombreProducto.toLowerCase().includes(query) && p.nombreProducto.toLowerCase() !== query
      );

      this.filteredProducts = [...exactMatches, ...partialMatches];

      if (this.filteredProducts.length > 0) {
        this.selectedProduct = this.filteredProducts[0];

        setTimeout(() => {
          if (searchInput && searchInput.panelVisible) {
            searchInput.selectItem(this.filteredProducts[0]);
          }
        }, 2000);
      }
    }
  }

  searchByBarcode(barcode: string) {
    if (!barcode) return;

    this.barcodeService.getProductByBarcode(barcode).subscribe({
      next: (barcodeData: { idProducto: number; }) => {
        if (barcodeData) {
          this.productService.getOneProduct(barcodeData.idProducto).subscribe({
            next: (product: any) => {
              if (product) {
                this.addProductSale(product);
              }
            },
            error: () => {
              this.toastr.error('Error al obtener el producto');
            }
          });
        } else {
          this.toastr.warning('Producto no encontrado');
        }
      },
      error: () => {
        this.toastr.warning('Código de barras no registrado');
      }
    });
  }

  // Función para agregar producto cuando se presiona Enter
  onEnterPressed(): void {
    if (this.selectedProduct) {  // Asegúrate de que haya un producto seleccionado
      this.addProductSale(this.selectedProduct);  // Añadir el objeto del producto completo, no solo el nombre
      this.selectedProduct = null;  // Resetea el producto seleccionado después de agregarlo
      this.busquedaForm.get('busqueda')?.setValue('');  // Limpia el campo de búsqueda
    }
  }

  onSelect(event: any): void {
    this.selectedProduct = event;
    this.busquedaForm.get('busqueda')?.setValue(this.searchText);
    setTimeout(() => {
      this.clear();
    }, 100);
  }

  clear() {
    this.searchText = '';
    this.selectedProduct = null;
    this.busquedaForm.get('busqueda')?.setValue('');
  }

  getImageUrl(productId: any): string {
    return this.productService.getImageUrl(productId);
  }

  // --------------------------------------AGREGAR PRODUCTO A VENTA-------------------------------------------

  loadSaleFromLocalStorage() {
    const savedDetailSale = localStorage.getItem('detailSale');
    const savedTotal = localStorage.getItem('total');

    if (savedDetailSale) {
      this.detailSale = JSON.parse(savedDetailSale);
    }

    if (savedTotal) {
      this.total = parseFloat(savedTotal);
      this.creditForm.get('totalVenta')?.setValue(this.total);
    }

    console.log('Venta restaurada desde localStorage', 'Info');
  }

  saveSaleToLocalStorage() {
    console.log('Guardando en localStorage:', this.detailSale, this.total); // Verifica datos
    localStorage.setItem('detailSale', JSON.stringify(this.detailSale));
    localStorage.setItem('total', this.total.toString());
  }


  getProductName(idProducto: number): string {
    const product = this.products.find(p => p.idProducto === idProducto);
    return product!.nombreProducto;
  };

  getProductPrice(idProducto: number): number {
    const product = this.products.find(p => p.idProducto === idProducto);
    return product ? product.precioVenta : 0;
  };

  getProductStock(idProducto: number): number {
    const product = this.products.find(p => p.idProducto === idProducto);
    return product ? product.stock : 0;
  };

  addProductSale(event: any): void {
    const product = event && event.value ? event.value : event;
    if (product.stock <= 0) {
      this.toastr.error('Stock insuficiente', 'Error')
    }
    else {
      const existingProduct = this.detailSale.find(item => item.idProducto === product.idProducto);

      if (existingProduct) {
        existingProduct.cantidadProducto++;
        this.updateSubtotal(existingProduct);
      } else {
        const newDetail = {
          idProducto: product.idProducto,
          nombreProducto: product.nombreProducto,
          precioVenta: product.precioVenta,
          cantidadProducto: 1,
          subtotal: product.precioVenta
        };
        this.detailSale.push(newDetail);
      }
      this.updateTotal();
      this.saveSaleToLocalStorage();
    }
    this.busquedaForm.get('busqueda')?.setValue('');
  }

  cambiarCantidad(item: DetailSale, incremento: number) {
    const product = this.products.find(p => p.idProducto === item.idProducto);
    if (product) {
      item.cantidadProducto += incremento;
      if (item.cantidadProducto <= 0) {
        this.removeProductFromSale(item);
      } else {
        item.subtotal = item.cantidadProducto * product.precioVenta;
        this.updateTotal();
        this.saveSaleToLocalStorage();
      }
    }
  }

  onInputCantidad(item: any) {
    // Si el usuario introduce manualmente un 0, se elimina el producto
    if (item.cantidadProducto == 0) {
      this.removeProductFromSale(item);
      this.toastr.warning('La cantidad no puede ser inferior a 1', 'Producto eliminado');
    } else {
      this.updateSubtotal(item);
      this.saveSaleToLocalStorage();
    }
  }

  updateSubtotal(item: any): void {
    item.subtotal = item.cantidadProducto * item.precioVenta;
    this.updateTotal();
  };

  removeProductFromSale(item: DetailSale) {
    this.detailSale = this.detailSale.filter(i => i !== item);
    this.updateTotal();
    this.saveSaleToLocalStorage();
  }

  updateTotal(): void {
    this.total = this.detailSale.reduce((sum, item) => sum + item.subtotal, 0);
    this.creditForm.get('totalVenta')?.setValue(this.total);
  }

  // --------------------------------------FINALIZAR VENTA-------------------------------------------




  calcularCambio() {
    if (this.montoRecibido && this.total) {
      this.cambio = this.montoRecibido - this.total;
    } else {
      this.cambio = 0;
    }
  }

  isPagoValido(): boolean {
    return this.montoRecibido >= this.total;
  }

  createSale(callback: (success: boolean) => void) {
    if (this.detailSale.length === 0) {
      this.toastr.error('No hay productos en la venta', 'Error');
      callback(false);
      return;
    }

    const saleData = { fechaVenta: new Date() };
    const saleDetail = this.detailSale;

    this.saleService.createSale(saleData, saleDetail).subscribe({
      next: (response) => {
        this.idSale = response.newSale.idVenta;
        this.loadProducts();
        callback(true);
      },
      error: (error) => {
        this.toastr.error('No se pudo registrar la venta', 'Error');
        callback(false);
      }
    });

  }

  clearLocalStorage() {
    localStorage.removeItem('detailSale');
    localStorage.removeItem('total');
  }

  finalizeSale() {
    this.createSale((completed) => {
      if (!completed) return;

      this.toastr.success('Venta registrada', 'Éxito');

      if (this.imprimirRecibo) this.downloadPDF(); // Llama a la función de descarga del PDF si el switch está activado

      this.clearLocalStorage();
      this.resetForm();
    });
  }

  cancelSale() {

    this.alertsService.confirm(
      `¿Estás seguro de que deseas cancelar esta venta?`,

      () => {
        this.clearLocalStorage();
        this.resetForm();
        this.toastr.success('Venta Cancelada', 'Info');
      },
      () => {
        this.toastr.info('cancelado', 'Información');
      }
    );




  };
  // ---------------------------------------- ASIGNAR CREDITO ----------------------------------------- //
  loadCreditsClients() {
    forkJoin({
      clients: this.clientService.getAllClients(),
      credits: this.creditService.getAllCredits()
    }).subscribe(({ clients, credits }) => {
      this.clients = clients.filter(c => c.estadoCliente === true);
      this.credits = credits
        // Doble filtro para asegurarnos de que no aparezcan clientes inactivos
        .filter(credit => this.clients.some(c => c.idCliente === credit.idCliente))
        .map(credit => {
          const client = this.clients.find(c => c.idCliente === credit.idCliente);
          return {
            ...credit,
            nombreCliente: client ? `${client.nombreCliente} ${client.apellidoCliente}` : '',
            cedulaCliente: client ? client.cedulaCliente : ''
          };
        });
      this.filteredCredits = this.credits
    });
  }

  searchCreditClient(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCredits = this.credits.filter(credit => {
      const creditWithClientName = credit as Credit & { nombreCliente?: string };
      return (creditWithClientName.nombreCliente || '').toLowerCase().includes(query);
    });
  }

  showCreditAssignmentModal() {
    this.createSale((completed) => {
      if (!completed) return;
    });
    this.loadCreditsClients();
    this.showCreditModal = true;
  }

  addSaleToCredit() {
    const creditDetail = {
      idCredito: this.selectedClient,
      idVenta: this.idSale,
      montoAcreditado: this.creditForm.value.montoCredito,
      plazoMaximo: this.creditForm.value.plazoMaximo
    };

    this.creditDetailService.addSaleToCredit(creditDetail).subscribe({
      next: () => {
        this.toastr.success('Venta asignada', 'Éxito');
        this.closeModal();
        this.resetForm();
      },
      error: (error) => {
        this.toastr.error(`No se pudo asignar el crédito: ${error.message}`, 'Error');
        // Aquí se debería eliminar la venta creada
        console.log(creditDetail)
      }
    });
  }

  cancelarAsignacionCredito() {
    this.closeModal();
    if (this.idSale !== null) {
      this.saleService.deleteSale(this.idSale)
        .subscribe({
          next: () => {
            this.toastr.success('Venta cancelada', 'Éxito');
            this.resetForm();
          },
          error: (error) => {
            this.toastr.error(`No se pudo cancelar la venta: ${error.message}`, 'Error');
          }
        });
    }

    this.resetForm();
  };

  closeModal() {
    this.showCreditModal = false;
  }

  resetForm(): void {
    this.busquedaForm.reset();
    this.creditForm.reset();
    this.detailSale = [];
    this.total = 0;
    this.selectedClient = null;
    this.imprimirRecibo = true;
    this.idSale = null;
    this.montoRecibido = 0;
    this.cambio = 0;
    this.loadProducts();
  }

  // ---------------------------------------- CREATE CLIENT----------------------------------------- //

  onClientSelect(event: any) {
    this.selectedClient = event.value.idCredito;
    console.log(this.selectedClient)
  };

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  };

  getErrorMessage(fieldName: string): string {
    const control = this.clientForm.get(fieldName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('clients', fieldName, errorKey);
    }
    return '';
  };

  private markFormFieldsAsTouched() {
    Object.values(this.clientForm.controls).forEach(control => control.markAsTouched());
  };

  saveClient() {
    if (this.clientForm.invalid) return this.markFormFieldsAsTouched();

    this.clientService.createClient(this.clientForm.value).subscribe({
      next: () => {
        this.toastr.success('Cliente creado correctamente', 'Éxito');
        this.showClientModal = false;
        this.loadCreditsClients();
      },
      error: (error) => {
        this.toastr.error(`No se pudo crear el cliente: ${error.message}`, 'Error');
      }
    });
  };

  cancelClientCreation() {
    this.showClientModal = false;
  }

  // --------------------------------------IMPRIMIR RECIBO-------------------------------------------
  downloadPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 12;
    const lineHeight = 6;
    let yPosition = margin;

    // Colores corporativos
    const colors = {
      primary: [0, 83, 156],    // Azul corporativo
      secondary: [100, 100, 100], // Gris para texto normal
      accent: [41, 128, 185],     // Azul claro para detalles
      success: [46, 204, 113]     // Verde para el total
    };

    // Configuración de estilos
    const styles = {
      title: { fontSize: 20, fontStyle: 'bold' },
      subtitle: { fontSize: 12, fontStyle: 'bold' },
      normal: { fontSize: 10, fontStyle: 'normal' },
      small: { fontSize: 8, fontStyle: 'normal' }
    };

    // Función helper para cambiar estilos
    const setStyle = (style: { fontSize: any; fontStyle: any; }) => {
      doc.setFontSize(style.fontSize);
      doc.setFont('helvetica', style.fontStyle);
    };

    // Función para establecer color
    const setColor = (color: number[]) => {
      doc.setTextColor(color[0], color[1], color[2]);
    };

    // Franja de color en la parte superior
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 15, 'F');

    // Encabezado
    setStyle(styles.title);
    setColor([255, 255, 255]);
    doc.text('COMPROBANTE DE VENTA', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight + 6;

    // Información de la venta
    setStyle(styles.subtitle);
    const fecha = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Información del negocio
    setStyle(styles.normal);
    setColor(colors.primary);
    doc.text('Tienda Santa Clara', margin, yPosition);
    setColor(colors.secondary);
    doc.text(`Fecha: ${fecha}`, pageWidth - margin - 50, yPosition);
    yPosition += lineHeight;
    doc.text('Calle 80 N°87 A 30', margin, yPosition);
    yPosition += lineHeight;
    doc.text('Tel: (123) 456-7890', margin, yPosition);
    yPosition += lineHeight * 2;

    // Tabla de productos
    const tableColumns = {
      item: { x: margin, width: 15 },
      producto: { x: margin + 15, width: 70 },
      cantidad: { x: margin + 85, width: 25 },
      precio: { x: margin + 110, width: 35 },
      subtotal: { x: margin + 145, width: 35 }
    };

    // Encabezados de tabla con fondo
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), lineHeight + 3, 'F');

    setStyle(styles.subtitle);
    setColor([255, 255, 255]); // Texto blanco para los encabezados
    doc.text('N°', tableColumns.item.x, yPosition);
    doc.text('Producto', tableColumns.producto.x, yPosition);
    doc.text('Cant.', tableColumns.cantidad.x, yPosition);
    doc.text('Precio', tableColumns.precio.x, yPosition);
    doc.text('Subtotal', tableColumns.subtotal.x, yPosition);
    yPosition += lineHeight;

    // Línea después de encabezados
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);

    yPosition += 5;

    // Productos
    setStyle(styles.normal);
    setColor(colors.secondary);
    this.detailSale.forEach((d, index) => {
      if (yPosition + lineHeight > pageHeight - margin * 2) {
        doc.addPage();
        yPosition = margin;
        // Repetir encabezados en nueva página
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), lineHeight + 3, 'F');
        setStyle(styles.subtitle);
        setColor([255, 255, 255]);
        doc.text('N°', tableColumns.item.x, yPosition);
        doc.text('Producto', tableColumns.producto.x, yPosition);
        doc.text('Cant.', tableColumns.cantidad.x, yPosition);
        doc.text('Precio', tableColumns.precio.x, yPosition);
        doc.text('Subtotal', tableColumns.subtotal.x, yPosition);
        yPosition += lineHeight + 6;
        setStyle(styles.normal);
        setColor(colors.secondary);
      }

      doc.text(`${index + 1}`, tableColumns.item.x, yPosition);
      doc.text(d.nombreProducto, tableColumns.producto.x, yPosition);
      doc.text(d.cantidadProducto.toString(), tableColumns.cantidad.x, yPosition);
      doc.text(`$${d.precioVenta.toFixed(2)}`, tableColumns.precio.x, yPosition);
      doc.text(`$${d.subtotal.toFixed(2)}`, tableColumns.subtotal.x, yPosition);
      yPosition += lineHeight;
    });

    // Línea final de productos
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Total
    setStyle(styles.subtitle);
    setColor(colors.success);
    doc.text('Total:', pageWidth - margin - 70, yPosition);
    doc.text(`$${this.total.toFixed(2)}`, pageWidth - margin - 35, yPosition);
    yPosition += lineHeight * 2;

    // Pie de página
    setStyle(styles.small);
    setColor(colors.primary);
    doc.text('¡Gracias por su compra!', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight;
    setColor(colors.secondary);
    doc.text('Conserve este comprobante para cualquier aclaración', pageWidth / 2, yPosition, { align: 'center' });

    // Guardar el PDF
    doc.save('comprobante_venta.pdf');
  }
}