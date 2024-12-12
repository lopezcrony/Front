import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';

import { SHARED_IMPORTS } from '../shared-imports';
import { AlertsService } from '../alerts/alerts.service';
import { ProductsService } from '../../modules/products/products.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-crud',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    ...SHARED_IMPORTS,
    
  ],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.css'
})
export class CRUDComponent{

  // Configuraciones de la tabla y permisos
  @Input() canSeeDetail: boolean = true;
  @Input() canCreate: boolean = true;
  @Input() canDelete: boolean = true;
  @Input() canCancel: boolean = false;

  @Input() canExport: boolean = true;
  @Input() canEdit: boolean = true;
  @Input() canChangeStatus: boolean = false;
  @Input() canStatus: boolean = false;
  @Input() PDF: boolean = false;


  @Input() img: boolean = false;
  @Input() canInstallment: boolean = false;
  @Input() showStateColumn: boolean = false;
  @Input() creditColumn: boolean = false;
  @Input() actions: boolean = true;
  @Input() SelectChangeStatus: boolean = false;
  @Input() calendar: boolean = false;

  // Datos de entrada para la tabla
  @Input() Module: string = '';
  @Input() items: any[] = [];
  @Input() columns: { field: string, header: string, type: string }[] = [];
  @Input() statusField: string = 'estado';

  // Funciones del CRUD
  @Output() create = new EventEmitter<void>();
  @Output() deleteAll = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() detail = new EventEmitter<any>();
  @Output() installment = new EventEmitter<any>();
  @Output() statusChange = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<any>();
  @Output() changeStatusProvider = new EventEmitter<any>();
  @Output() calendarField1 = new EventEmitter<Date>();
  @Output() calendarField2 = new EventEmitter<Date>();
  // Parámetro de búsqueda
  searchQuery = '';

  calendarField1Value: Date = new Date(); // Inicializando aquí 
  calendarField2Value: Date = new Date();  
  displayModal = false;

  constructor(
    private alertsService: AlertsService,
    private productService: ProductsService,
    private toastr: ToastrService,
  ) { }

  showModal() { this.displayModal = true; }

  
  onCreate() {
    this.create.emit();
  }

  onExport() {
    this.export.emit();
  }

  onExportDate() {
    if (!this.calendarField1Value || !this.calendarField2Value) {
      this.toastr.error('Por favor selecciona ambas fechas.');
      return;
    }
    this.export.emit();
    this.displayModal = false;
  }

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

  onCancel(item: any) {
    this.cancel.emit(item);
  }

  onStatusProvider(item: any) {
    this.changeStatusProvider.emit(item);
  }

  onDetail(item: any) {
    this.detail.emit(item);
  }

  onInstallment(item: any) {
    this.installment.emit(item);
  }

  onSearch() {
    this.search.emit(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.onSearch();
  }

  getStatus(item: any): boolean {
    return item[this.statusField];
  }

  getSelectStatus(item: any): string {
    return item[this.statusField];
  }

  getDateStart(event: any) { 
    if (this.calendarField1Value) {
      this.calendarField1.emit(this.calendarField1Value);
    }
  }
  
  getDateEnd(event: any) { 
    if (this.calendarField2Value) {
      this.calendarField2.emit(this.calendarField2Value);
    }
  }
  
  confirmChangeStatus(item: any) {
    this.alertsService.confirm(
      `¿Estás seguro de cambiar el estado?`,
      () => {
        this.changeStatus(item);
      }
    );
  }

  confirmChangeStatusProvider(item: any) {
    this.alertsService.confirm(
      `¿Estás seguro de cambiar el estado?`,
      () => {
        this.onStatusProvider(item);
      }
    );
  }

  changeStatus(item: any) {
    const updatedItem = { ...item, [this.statusField]: !item[this.statusField] };
    this.statusChange.emit(updatedItem);
  }

  getImageUrl(productId: any): string {
    return this.productService.getImageUrl(productId);
  }

}
