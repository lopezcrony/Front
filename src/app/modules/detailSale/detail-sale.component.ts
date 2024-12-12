import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { CRUDComponent } from '../../shared/crud/crud.component';
import { CrudModalDirective } from '../../shared/directives/crud-modal.directive';
import { AlertsService } from '../../shared/alerts/alerts.service';

import { DetailSale } from './detailSale.model'
import { DetailSalesService } from './detail.Sale.service';
import { Sale } from '../sales/sales.model'
import { SaleService } from '../sales/sales.service'
import { Product } from '../products/products.model';
import { ProductsService } from '../products/products.service';
import jsPDF from 'jspdf';
import { error } from 'console';

@Component({
  selector: 'app-detail-sale',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    CRUDComponent,
    CrudModalDirective,
  ],
  templateUrl: './detail-sale.component.html',
  styleUrl: './detail-sale.component.css'
})
export class DetailSaleComponent implements OnInit {

  startDates: Date = new Date();
  endDates: Date = new Date(); 
  
  

  Sales: Sale[] = [];
  filteredSale: Sale[] = [];

  detailSale: DetailSale[] = []
  filteredDetailSale: any[] = []

  products: Product[] = []

  colums: { field: string, header: string, type: string }[] = [
    { field: 'idVenta', header: 'Nro. Venta', type: 'text' },
    { field: 'fechaVenta', header: 'Fecha', type: 'dateTime' },
    { field: 'totalVenta', header: 'Total', type: 'currency' },

  ];

  showModal = false;
  viewModal = false;
  selectedDetailSales: DetailSale | undefined
  detailModalVisible: boolean = false
  isFieldDisabled: boolean = false;

  constructor(
    private saleService: SaleService,
    private alertsService: AlertsService,
    private detailSaleService: DetailSalesService,
    private toastr: ToastrService,
    private productService: ProductsService
  ) { }

  ngOnInit(): void {
    this.loadSales();
    this.loadProducts();
    this.loadDetailSales()
  }

  loadSales() {
    this.saleService.getSales().subscribe(data => {
      this.Sales = data;
      this.filteredSale = data;
    },
    );
  }

  loadDetailSales() {
    this.detailSaleService.getDetailSale().subscribe(data => {
      this.detailSale = data;
      this.filteredDetailSale = data;
    },
    );
  }

  setStartDate(date: Date) 
  { 
    console.log(this.startDates)
    this.startDates = date; 
  } 
  
  setEndDate(date: Date) 
  { 
    console.log(this.endDates)
    this.endDates = date;
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe(data => {
      this.products = data
      this.loadSales()
    });
  };

  showCategoryModal() {
    this.detailModalVisible = true;
  };

  openShowModal(detailSale: DetailSale) {
    // Asigna el producto seleccionado a una variable para usar en la vista
    this.selectedDetailSales = detailSale;
    // Muestra la modal
    this.detailModalVisible = true;

    // Llama a la función que carga el detalle de la venta por id de venta y llena el array
    this.detailSaleService.getDetailSaleByidSale(detailSale.idVenta).subscribe({
      next: (detailSale) => {
        this.filteredDetailSale = detailSale.map(detailSale => {
          const product = this.products.find(product => product.idProducto === detailSale.idProducto)!;
          return { ...detailSale, nombreProducto: product.nombreProducto };
        });
      },
      error: () => {
        this.toastr.error('Error al cargar el detalle de venta.', 'Error');
      }
    });
  }

  changeSaleStatus(updatedSale: Sale) {

    this.saleService.cancelSale(updatedSale.idVenta).subscribe({
      next: () => {
        this.loadSales();
        this.toastr.success(`Venta anulada con éxito.`, 'Éxito');
      },
      error: () => {
        this.toastr.error(`Error al anular la venta.`, 'Error');
      }
    });
  }

  cancelSale(updatedSale: Sale) {
    // Mostrar mensaje de confirmación
    this.alertsService.confirm(
      `¿Estás seguro de que deseas anular la venta?`,

      () => {
        updatedSale.estadoVenta = false; 
        this.changeSaleStatus(updatedSale);

        this.saleService.cancelSale(updatedSale.idVenta).subscribe({
          next: () => {
            this.loadSales();
            this.toastr.success('Venta anulada con éxito.', 'Éxito');
          },
          error: () => {
            this.toastr.error('Error al anular la venta.', 'Error');
            
          }
        });
        
      },
      () => {
        this.toastr.info('Anulación cancelada', 'Información');
      }
    );
  }


  searchDetailSale(query: string) {
    const lowerCaseQuery = query.toLowerCase();
    
    if (!query) {
        this.filteredSale = [...this.Sales]; // Si no hay query, mostrar todos los resultados
        return;
    }
    
    this.filteredSale = this.Sales.filter(detailSale =>
        detailSale.idVenta.toString().includes(lowerCaseQuery) ||
        detailSale.totalVenta.toString().includes(lowerCaseQuery) ||
        (detailSale.fechaVenta && new Date(detailSale.fechaVenta).toLocaleDateString().toLowerCase().includes(lowerCaseQuery)) ||
        (detailSale.estadoVenta ? 'vigente' : 'anulado').includes(lowerCaseQuery)

    );
}

// ----------------------------------------- Descarga de PDF ---------------------------------------------------

downloadPDF() {
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

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 12;
  const lineHeight = 6;
  const columnWidth = (pageWidth - 2 * margin) / 3;
  let yPosition = margin;

  // Colores corporativos
  const colors = {
    primary: [0, 83, 156],
    secondary: [100, 100, 100],
    accent: [41, 128, 185],
    success: [46, 204, 113],
    container: [240, 240, 240]
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
  doc.text('REPORTE DE VENTAS', pageWidth / 2, yPosition, { align: 'center' });
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
  let totalVentas = 0;
  this.Sales.forEach(sale => totalVentas += sale.totalVenta);

  setColor(colors.accent);
  setStyle(styles.subtitle);
  doc.text('Resumen General', margin, yPosition);
  yPosition += lineHeight;

  setStyle(styles.normal);
  setColor(colors.secondary);
  doc.text(`Total de Ventas: ${this.Sales.length}`, margin, yPosition);
  doc.text(`Valor Total: $${totalVentas.toFixed(2)}`, pageWidth - margin - 50, yPosition);
  yPosition += lineHeight * 1.5; // Reducido el espaciado

  // Encabezado de la lista de ventas
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(margin, yPosition - 6, pageWidth - (margin * 2), lineHeight + 2, 'F');

  setStyle(styles.subtitle);
  setColor([255, 255, 255]);
  doc.text('DETALLE DE VENTAS', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight;

  // Definir el tipo SalesByDate
  type SalesByDate = {
    [date: string]: {
      [productName: string]: { cantidad: number, subtotal: number }
    }
  };

  // Filtrar ventas por el rango de fechas y asegurarse de incluir el día de hoy
  const salesByDate: SalesByDate = this.Sales.reduce((acc: SalesByDate, sale) => {
    const saleDate = new Date(sale.fechaVenta);
    saleDate.setHours(0, 0, 0, 0); // Ajustar horas para evitar problemas de comparación
    this.startDates.setHours(0, 0, 0, 0);
    this.endDates.setHours(23, 59, 59, 999); // Incluir todo el día hasta las 23:59:59

    if (!sale.estadoVenta || saleDate < this.startDates || saleDate > this.endDates) return acc;

    const saleDateString = saleDate.toLocaleDateString();
    const details = this.detailSale.filter(d => d.idVenta === sale.idVenta);

    details.forEach(detail => {
      const product = this.products.find(p => p.idProducto === detail.idProducto);
      if (!product) return;

      if (!acc[saleDateString]) acc[saleDateString] = {};

      if (!acc[saleDateString][product.nombreProducto]) {
        acc[saleDateString][product.nombreProducto] = { 
          cantidad: 0, 
          subtotal: 0 
        };
      }

      acc[saleDateString][product.nombreProducto].cantidad += detail.cantidadProducto;
      acc[saleDateString][product.nombreProducto].subtotal += detail.subtotal;
    });

    return acc;
  }, {} as SalesByDate);

  Object.entries(salesByDate).forEach(([date, products]) => {
    // Calcular la altura dinámica del contenedor basado en la cantidad de productos
    const containerHeightDynamic = Object.keys(products).length * lineHeight * 2 + 30; // Ajustado para incluir el total

    if (yPosition + containerHeightDynamic > pageHeight - margin * 3) {
      doc.addPage();
      yPosition = margin;
    }

    // Dibujar el contenedor con altura dinámica
    doc.setFillColor(colors.container[0], colors.container[1], colors.container[2]);
    doc.rect(margin + 4, yPosition, pageWidth - (margin * 2) - 8, containerHeightDynamic, 'F');

    // Contenido de la venta
    setStyle(styles.subtitle);
    setColor(colors.primary);
    doc.text(`Ventas del ${date}`, margin + 9, yPosition + lineHeight);

    // Ajuste dinámico de la posición `y`
    let yOffset = yPosition + lineHeight * 2;

    // Mostrar encabezado de la tabla
    setStyle(styles.bold);
    setColor(colors.secondary);
    doc.text('Producto', margin + 9, yOffset);
    doc.text('Cantidad', margin + columnWidth + 9, yOffset);
    doc.text('Subtotal', margin + columnWidth * 2 + 9, yOffset);
    yOffset += lineHeight;

    // Iterar sobre los productos vendidos
    Object.entries(products).forEach(([productName, info]) => {
      // Mostrar producto, cantidad y subtotal en una tabla
      setStyle(styles.normal);
      setColor(colors.secondary);
      doc.text(productName, margin + 9, yOffset);
      doc.text(info.cantidad.toString(), margin + columnWidth + 9, yOffset);
      doc.text(`$${info.subtotal.toFixed(2)}`, margin + columnWidth * 2 + 9, yOffset);

      // Incrementar la posición `yOffset` para el siguiente producto
      yOffset += lineHeight;
    });

    // Calcular y mostrar el total de las ventas del día dentro del recuadro gris
    const totalDia = Object.values(products).reduce((sum, p) => sum + p.subtotal, 0);
    setStyle(styles.bold);
    setColor(colors.success);
    doc.text(`Total del día: $${totalDia.toFixed(2)}`, pageWidth - margin - 55, yOffset);

    yPosition = yOffset + lineHeight + 4; // Ajustar `yPosition` para el siguiente contenedor
  });

  // Pie de página
  yPosition = pageHeight - margin * 3;
  setStyle(styles.small);
  setColor(colors.secondary);
  doc.text('Reporte generado automáticamente - Tienda Santa Clara', pageWidth / 2, yPosition, { align: 'center' });

  // Guardar el PDF
  doc.save('informe_ventas.pdf');
}



}

















