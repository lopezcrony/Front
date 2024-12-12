import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CRUDComponent } from '../../shared/crud/crud.component';
import { CrudModalDirective } from '../../shared/directives/crud-modal.directive';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { ValidationService } from '../../shared/validators/validations.service';
import { AlertsService } from '../../shared/alerts/alerts.service';

import { ProductsService } from '../products/products.service';
import { ShoppingsService } from './shoppings.service';
import { ProvidersService } from '../providers/providers.service';
import { Shopping } from './shopping.model';
import { jsPDF } from 'jspdf';
import { ShoppingdetailsService } from '../shoppingdetails/shoppingsDetails.service';
import { Shoppingdetails } from '../shoppingdetails/shoppingsDetail.model';
import { Product } from '../products/products.model';
import { Proveedor } from '../providers/providers.model';

@Component({
  selector: 'app-shoppinview',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    CRUDComponent,
    CrudModalDirective,
  ],
  templateUrl: './shopping.component.html'
})
export class ShoppinviewComponent implements OnInit {

  shoppingForm: FormGroup;

  filteredProducts: any[] = [];
  filteredShoppings: Shopping[] = [];
  providers: any[] = [];
  products: any[] = [];
  shoppingdetails: any[] = [];
  viewModal = false;
  selectedShopping: Shopping | undefined;


  // ----pdf
  startDates: Date = new Date();
  endDates: Date = new Date();
  shoppingdetailspdf: Shoppingdetails[] = [];
  productspdf: Product[] = [];
  provider: Proveedor[] = [];
  shoppings: Shopping[] = [];


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private shoppingService: ShoppingsService,
    private providerService: ProvidersService,
    private productService: ProductsService,
    private toastr: ToastrService,
    private ValidationService: ValidationService,
    private alertsService: AlertsService,
    private shoppingDetailservice: ShoppingdetailsService
  ) {
    this.shoppingForm = this.fb.group({
      idProveedor: ['', Validators.required],
      fechaCompra: ['', Validators.required],
      numeroFactura: ['', Validators.required],
      valorCompra: [{ value: 0, disabled: false }],
      detalles: this.fb.array([]) // FormArray para los detalles
    });
  }

  columns: { field: string, header: string, type: string }[] = [
    { field: 'nombreProveedor', header: 'Proveedor', type: 'text' },
    { field: 'fechaCompra', header: 'Fecha Compra', type: 'date' },
    { field: 'fechaRegistro', header: 'Fecha Registro', type: 'date' },
    { field: 'numeroFactura', header: 'Nro. Factura', type: 'text' },
    { field: 'valorCompra', header: 'Valor Compra', type: 'currency' },
  ];

  // Asegura que se cargue toda la información antes de ser mostrada
  loadAllData() {
    forkJoin({
      providers: this.providerService.getAllProviders(),
      products: this.productService.getAllProducts(),
      shoppings: this.shoppingService.getAllShoppings()
    }).subscribe(({ providers, products, shoppings }) => {
      this.providers = providers.filter(p => p.estadoProveedor === true);
      this.products = products.filter(pr => pr.estadoProducto === true);
      this.filteredProducts = this.products;

      this.shoppings = shoppings.map(shopping => {
        const provider = this.providers.find(p => p.idProveedor === shopping.idProveedor);
        return { ...shopping, nombreProveedor: provider ? provider.nombreProveedor : 'Desconocido' };
      });
      this.filteredShoppings = this.shoppings;
    });
  }

  ngOnInit() {
    this.loadProviders()
    this.loadShoppings()
    this.loadAllData();
    this.loadProducts()
    this.loadDetailShoppings()

    //  console.log('Productos:', this.productspdf); console.log('Detalles de Compra:', this.shoppingdetailspdf); console.log('Compras:', this.shoppings);
  }


  getNameProvider(id: number): string {
    const provider = this.providers.find(p => p.idProveedor === id);
    return provider?.nombreProveedor || 'Proveedor no encontrado';
  }


  loadProducts() {
    this.productService.getAllProducts().subscribe(
      data => {
        this.productspdf = data;
      });

  }


  loadProviders() {
    this.providerService.getAllProviders().subscribe(
      data => {
        this.provider = data;
      });

  }


  loadDetailShoppings() {
    this.shoppingDetailservice.getAllShoppingDetails().subscribe(
      data => {
        this.shoppingdetailspdf = data;
      });
  }


  loadShoppings() {
    this.shoppingService.getAllShoppings().subscribe(data => {
      this.shoppings = data.map(shopping => ({
        ...shopping,
        nombreProveedor: this.getNameProvider(shopping.idProveedor) // Agregar nombre del proveedor
      }));
      this.filteredShoppings = [...this.shoppings]; // Inicializar la lista filtrada
    });
  }



  setStartDate(date: Date) {
    this.startDates = date;
  }

  setEndDate(date: Date) {
    this.endDates = date;
  }

  openShopping() {
    this.router.navigate(['/shoppings']); // Navega a la ruta del componente ShoppinviewComponent
  }

  openShowModal(shopping: Shopping) {
    // Asigna el producto seleccionado a una variable para usar en la vista
    this.selectedShopping = shopping;
    // Muestra la modal
    this.viewModal = true;

    this.shoppingService.getShoppingdetailsByShopping(shopping.idCompra).subscribe({
      next: (data) => {
        this.shoppingdetails = data.map(detail => {
          const product = this.products.find(p => p.idProducto === detail.idProducto);
          return { ...detail, nombreProducto: product ? product.nombreProducto : 'Desconocido' };
        });
      },
      error: (err) => {
        this.toastr.error('Error al cargar los detalles de compra.');
      }
    });
  }

  cancelShopping(shopping: Shopping) {

    this.alertsService.confirm(
      `¿Estás seguro de anular esta compra?`,
      () => {
        this.shoppingService.cancelShopping(shopping.idCompra).subscribe({
          next: () => {
            this.loadAllData();
            this.toastr.success('Compra anulada con éxito.', 'Éxito');
          },
          error: () => {
            this.toastr.error('Error al anular la compra.', 'Error');
          }
        });
      }
    );
  }

  searchShopping(query: string) {
    if (!query.trim()) {
      this.filteredShoppings = this.shoppings;
      return;
    }

    const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const numericQuery = parseFloat(query);

    this.filteredShoppings = this.shoppings.filter(shopping => {
      const provider = shopping as Shopping & { nombreProveedor?: string };
      const providerName = provider.nombreProveedor || this.getNameProvider(shopping.idProveedor) || '';
      const normalizedProviderName = providerName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      const numeroFactura = !isNaN(numericQuery) &&
        shopping.numeroFactura != null &&
        shopping.numeroFactura.toString().includes(query);
      const matchProvider = normalizedProviderName.includes(normalizedQuery);
      return numeroFactura || matchProvider;
    });
  }

//generar PDF
  downloadPurchasePDF() {
    // Si las fechas no están definidas, usar la fecha actual
    if (!this.startDates) {
      this.startDates = new Date();
    }
    if (!this.endDates) {
      this.endDates = new Date();
    }

    // Validación de fechas
    if (this.startDates > this.endDates) {
      this.toastr.error('La fecha de inicio no puede ser mayor que la fecha de fin. Por favor, corrige las fechas.');
      return;
    }

    // Ordenar las compras por fecha, de más nueva a más antigua
    const sortedShoppings = this.shoppings.sort((a, b) => new Date(b.fechaCompra).getTime() - new Date(a.fechaCompra).getTime());

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 12;
    const lineHeight = 6;
    const columnWidth = (pageWidth - 2 * margin) / 4;
    let yPosition = margin;

    // Colores corporativos
    const colors = {
      primary: [50, 50, 50],       // Gris oscuro (cabeceras o títulos)
      secondary: [100, 100, 100], // Gris medio (textos secundarios)
      accent: [150, 150, 150],    // Gris claro (detalles o iconos)
      success: [200, 200, 200],   // Gris más claro (fondos o contenedores)
      container: [240, 240, 240]  // Gris casi blanco (background principal)
    };

    const styles = {
      title: { fontSize: 16, fontStyle: 'bold' },
      subtitle: { fontSize: 12, fontStyle: 'bold' },
      normal: { fontSize: 9, fontStyle: 'normal' },
      bold: { fontSize: 9, fontStyle: 'bold' },
      small: { fontSize: 8, fontStyle: 'normal' }
    };

    // Funciones helper
    const setStyle = (style: { fontSize: any; fontStyle: any; }) => {
      doc.setFontSize(style.fontSize);
      doc.setFont('helvetica', style.fontStyle);
    };

    const setColor = (color: number[]) => {
      doc.setTextColor(color[0], color[1], color[2]);
    };

    // Franja de color en la parte superior (más delgada)
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 15, 'F');

    // Título del reporte
    setStyle(styles.title);
    setColor([255, 255, 255]);
    doc.text('REPORTE DE COMPRAS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight + 6;

    // Información del negocio y fecha
    setStyle(styles.normal);
    setColor(colors.primary);
    doc.text('Tienda Santa Clara', margin, yPosition);

    const fecha = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    setColor(colors.secondary);
    doc.text(`Fecha de generación: ${fecha}`, pageWidth - margin - 50, yPosition);
    yPosition += lineHeight * 1.5; // Reducido el espaciado

    // Resumen general
    let totalCompras = 0;
    sortedShoppings.forEach(compra => totalCompras += compra.valorCompra ?? 0);

    setColor(colors.accent);
    setStyle(styles.subtitle);
    doc.text('Resumen General', margin, yPosition);
    yPosition += lineHeight;

    setStyle(styles.normal);
    setColor(colors.secondary);
    doc.text(`Total de Compras: ${sortedShoppings.length}`, margin, yPosition);
    doc.text(`Valor Total: $${totalCompras.toFixed(2)}`, pageWidth - margin - 50, yPosition);
    yPosition += lineHeight * 1.5; // Reducido el espaciado

    // Encabezado de la lista de compras
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(margin, yPosition - 6, pageWidth - (margin * 2), lineHeight + 2, 'F');

    setStyle(styles.subtitle);
    setColor([255, 255, 255]);
    doc.text('DETALLE DE COMPRAS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight;

    // Definir el tipo PurchasesByDate
    type PurchasesByDate = {
      [date: string]: {
        [productName: string]: { cantidad: number, precioUnidad: number, subtotal: number }
      }
    };

    // Filtrar compras por el rango de fechas y asegurarse de incluir el día de hoy
    const purchasesByDate: PurchasesByDate = sortedShoppings.reduce((acc: PurchasesByDate, compra) => {
      const purchaseDate = new Date(compra.fechaCompra);
      purchaseDate.setHours(0, 0, 0, 0); // Ajustar horas para evitar problemas de comparación
      this.startDates.setHours(0, 0, 0, 0);
      this.endDates.setHours(23, 59, 59, 999); // Incluir todo el día hasta las 23:59:59

      if (!compra.estadoCompra || purchaseDate < this.startDates || purchaseDate > this.endDates) return acc;

      const purchaseDateString = purchaseDate.toLocaleDateString();
      const details = this.shoppingdetailspdf.filter(d => d.idCompra === compra.idCompra);

      if (!acc[purchaseDateString]) acc[purchaseDateString] = {};

      details.forEach(detail => {
        const product = this.productspdf.find(p => p.idProducto === detail.idProducto);
        if (!product) return;

        if (!acc[purchaseDateString][product.nombreProducto]) {
          acc[purchaseDateString][product.nombreProducto] = {
            cantidad: 0,
            precioUnidad: 0,
            subtotal: 0
          };
        }

        acc[purchaseDateString][product.nombreProducto].cantidad += detail.cantidadProducto;
        acc[purchaseDateString][product.nombreProducto].precioUnidad = detail.precioCompraUnidad;
        acc[purchaseDateString][product.nombreProducto].subtotal += detail.subtotal;
      });

      return acc;
    }, {} as PurchasesByDate);

    // Agrupar y mostrar las compras por fecha
    Object.entries(purchasesByDate).forEach(([date, products]) => {
      // Calcular la altura dinámica del contenedor basado en la cantidad de productos
      const containerHeightDynamic = Object.keys(products).length * lineHeight * 3 + 20; // Ajustado para incluir el total

      if (yPosition + containerHeightDynamic > pageHeight - margin * 3) {
        doc.addPage();
        yPosition = margin;
      }

      // Dibujar el contenedor con altura dinámica
      doc.setFillColor(colors.container[0], colors.container[1], colors.container[2]);
      doc.rect(margin + 4, yPosition, pageWidth - (margin * 2) - 8, containerHeightDynamic, 'F');

      // Contenido de la compra
      setStyle(styles.subtitle);
      setColor(colors.primary);
      doc.text(`Compras del ${date}`, margin + 9, yPosition + lineHeight);

      // Ajuste dinámico de la posición `y`
      let yOffset = yPosition + lineHeight * 2;

      // Mostrar encabezado de la tabla
      setStyle(styles.bold);
      setColor(colors.secondary);
      doc.text('Producto', margin + 9, yOffset);
      doc.text('Cantidad', margin + columnWidth + 9, yOffset);
      doc.text('Precio Unidad', margin + columnWidth * 2 + 9, yOffset);
      doc.text('Subtotal', margin + columnWidth * 3 + 9, yOffset);
      yOffset += lineHeight;

      // Iterar sobre los productos comprados
      Object.entries(products).forEach(([productName, info]) => {
        // Mostrar producto, cantidad, precio unidad y subtotal en una tabla
        setStyle(styles.normal);
        setColor(colors.secondary);
        doc.text(productName, margin + 9, yOffset);
        doc.text(info.cantidad.toString(), margin + columnWidth + 9, yOffset);
        doc.text(`$${info.precioUnidad.toFixed(2)}`, margin + columnWidth * 2 + 9, yOffset);
        doc.text(`$${info.subtotal.toFixed(2)}`, margin + columnWidth * 3 + 9, yOffset);

        // Incrementar la posición `yOffset` para el siguiente producto
        yOffset += lineHeight;
      });

      // Calcular y mostrar el total de las compras del día dentro del recuadro gris
      const totalDia = Object.values(products).reduce((sum, p) => sum + p.subtotal, 0);
      setStyle(styles.bold);
      setColor(colors.success);
      doc.text(`Total del día: $${totalDia.toFixed(2)}`, pageWidth - margin - 55, yOffset);

      yPosition = yOffset + lineHeight * 2 + 4; // Ajustar `yPosition` para el siguiente contenedor
    });

    // Pie de página
    yPosition = pageHeight - margin * 3;
    setStyle(styles.small);
    setColor(colors.secondary);
    doc.text('Reporte generado automáticamente - Tienda Santa Clara', pageWidth / 2, yPosition, { align: 'center' });

    // Guardar el PDF
    doc.save('informe_compras.pdf');
  }


}