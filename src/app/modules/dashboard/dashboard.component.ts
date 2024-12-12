import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService } from './dashboard.service';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';

import moment from 'moment';
import 'moment/locale/es';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    TabMenuModule,
    TagModule,
    ProgressBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  salesPeriodItems = [
    { label: 'Diario' },
    { label: 'Semanal' },
    { label: 'Mensual' },
    { label: 'Anual' }
  ];

  weeklySalesChartData: any;
  topProductsChartData: any;
  lineChartOptions: any;
  doughnutChartOptions: any;

  productosEnStockCritico: any[] = [];
  topProductosTabla: any[] = [];

  totalSales: number = 0;
  currentPeriod: string = '';
  salesTrendPercentage: number = 0;
  salesTrendClass: string = '';
  salesTrendIcon: string = '';

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    moment.locale('es');

    this.initializeChartOptions();
    this.loadWeeklySales();
    this.loadTopProducts();
    this.loadInventoryCriticalStock();
    this.calculateSalesPeriod('day');
  }

  initializeChartOptions(): void {
    this.lineChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'top' },
      }
    };

    this.doughnutChartOptions = {
      responsive: true,
      plugins: { legend: { position: 'right' } }
    };
  }

  onPeriodChange(event: any): void {
    const periodMap: { [key: string]: 'day' | 'week' | 'month' | 'year' } = {
      'Diario': 'day',
      'Semanal': 'week',
      'Mensual': 'month',
      'Anual': 'year'
    };

    const label = event.label || event.item?.label;

    if (!label) { console.error('No label found in the event'); return; }

    const period = periodMap[label];

    if (!period) { console.error('Invalid period label:', label); return; }

    this.currentPeriod = label;
    this.calculateSalesPeriod(period);
  }

  calculateSalesPeriod(period: 'day' | 'week' | 'month' | 'year'): void {
    this.dashboardService.getSales().subscribe(sales => {
      const currentPeriodSales = sales.filter(sale =>
        moment(sale.fechaVenta).isSame(moment(), period)
      );

      const totalSalesForPeriod = currentPeriodSales.reduce((acc, sale) => acc + sale.totalVenta, 0);

      this.totalSales = totalSalesForPeriod;
    });
  }

  loadWeeklySales(): void {
    this.dashboardService.getSales().subscribe(sales => {
      const processedData = this.processWeeklySales(sales);
      this.weeklySalesChartData = {
        labels: processedData.labels,
        datasets: [{
          label: 'Ventas',
          data: processedData.data,
          borderColor: '#42A5F5',
          tension: 0.4
        }]
      };
    });
  }

  processWeeklySales(sales: any[]): { labels: string[], data: number[] } {
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');
    const dailySales = sales
      .filter(sale => moment(sale.fechaVenta).isBetween(startOfWeek, endOfWeek, 'day', '[]'))
      .reduce((acc, sale) => {
        const day = moment(sale.fechaVenta).format('dddd');
        acc[day] = (acc[day] || 0) + sale.totalVenta;
        return acc;
      }, {} as { [key: string]: number });

    const weekDays = moment.weekdays();
    const data = weekDays.map(day => dailySales[day] || 0);

    return { labels: weekDays, data };
  }

  loadTopProducts(): void {
    this.dashboardService.getDetailsSale().subscribe(details => {
      this.dashboardService.getProducts().subscribe(products => {
        const processedData = this.processTopProducts(details, products);

        this.topProductsChartData = {
          labels: processedData.labels,
          datasets: [{
            data: processedData.data,
            backgroundColor: [
              '#42A5F5', '#66BB6A',
              '#FFA726', '#FF7043',
              '#AB47BC'
            ]
          }]
        };
      });
    });
  }

  processTopProducts(details: any[], products: any[]): { labels: string[], data: number[] } {
    const productMap = products.reduce((acc, product) => {
      acc[product.idProducto] = product.nombreProducto;
      return acc;
    }, {} as { [key: number]: string });

    // Agrupar ventas por producto
    const productSales = details.reduce((acc, detail) => {
      acc[detail.idProducto] = (acc[detail.idProducto] || 0) + detail.cantidadProducto;
      return acc;
    }, {} as { [key: number]: number });

    const sortedProducts = Object.entries(productSales).map(([id, cantidad]) => ({
      id: +id,
      nombre: productMap[+id] || `Producto ${id}`,
      cantidad: cantidad as number,
    })).sort((a, b) => b.cantidad - a.cantidad);

    const labels = sortedProducts.map(item => item.nombre);
    const data = sortedProducts.map(item => item.cantidad);

    return { labels, data };
  }

  loadInventoryCriticalStock(): void {
    this.dashboardService.getProducts().subscribe(products => {
      this.productosEnStockCritico = products.filter(product => product.stock < 55);
    });
  }

}
