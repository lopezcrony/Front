import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ValidationService } from '../../shared/validators/validations.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { CRUDComponent } from '../../shared/crud/crud.component';
import { CrudModalDirective } from '../../shared/directives/crud-modal.directive';
import { AlertsService } from '../../shared/alerts/alerts.service';

import { Client } from './client.model';
import { ClientService } from './clients.service';
import { CreditsService } from '../credits/credits.service';
import { it } from 'node:test';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    CRUDComponent,
    CrudModalDirective,
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['../credits/credits.component.css', './clients.component.css'],

})

export class ClientsComponent implements OnInit {

  clients: Client[] = [];
  filteredClients: Client[] = [];
  historyItems: any[] = [];

  columns: { field: string, header: string, type: string }[] = [
    { field: 'cedulaCliente', header: 'Cédula', type: 'text' },
    { field: 'nombreCliente', header: 'Nombre', type: 'text' },
    { field: 'apellidoCliente', header: 'Apellido', type: 'text' },
    { field: 'telefonoCliente', header: 'Teléfono', type: 'text' },
  ];

  clientForm: FormGroup;
  showModal: boolean = false;
  showHistoryModal: boolean = false;
  isEditing: boolean = false;
  selectedClient: Client | undefined;
  currentPageIndex = 0;

  constructor(
    private clientService: ClientService,
    private creditService: CreditsService,
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private toastr: ToastrService,
    private validationService: ValidationService
  ) {
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

  loadClients() {
    this.clientService.getAllClients().subscribe(data => {
      this.clients = data;
      this.filteredClients = data;
    },
    );
  }

  loadCreditHistory(idClient: number) {
    this.creditService.getCreditHistoryByClient(idClient).subscribe({
      next: (history) => {
        this.historyItems = history.filter(a => a.estadoAbono === true || a.tipo === 'Crédito');

        // Abre la modal en la última página del historial
        const totalRecords = this.historyItems.length || 0;
        const rowsPerPage = 10;
        this.currentPageIndex = Math.floor((totalRecords - 1) / rowsPerPage) * rowsPerPage;

      },
      error: () => {
        this.toastr.error('Error al cargar el historial de crédito', 'Error');
      }
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  openCreateModal() {
    this.isEditing = false;
    this.clientForm.reset({ estadoCliente: true });
    this.showModal = true;
  }

  openEditModal(client: Client) {
    this.isEditing = true;
    this.clientForm.patchValue(client);
    this.showModal = true;
  }

  openHistoryModal(client: Client) {
    this.selectedClient = client;
    this.loadCreditHistory(client.idCliente);
    this.showHistoryModal = true;
  }

  updatePageIndex(event: any) {
    this.currentPageIndex = event.first;
  }

  cancelModalMessage() {
    this.alertsService.menssageCancel()
  }

  closeModal() {
    this.showModal = false;
    this.clientForm.reset();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.clientForm.get(fieldName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.validationService.getErrorMessage('clients', fieldName, errorKey);
    }
    return '';
  }

  private markFormFieldsAsTouched() {
    Object.values(this.clientForm.controls).forEach(control => control.markAsTouched());
  }

  saveClient() {
    if (this.clientForm.invalid) return this.markFormFieldsAsTouched();

    const clientData = this.clientForm.value;
    const request = this.isEditing
      ? this.clientService.updateClient(clientData)
      : this.clientService.createClient(clientData);

    request.subscribe({
      next: () => {
        this.toastr.success('¡Cliente guardado con éxito!', 'Éxito');
        this.loadClients();
        this.closeModal();
      },
      error: (error) => { this.toastr.error(error, 'Error'); }
    });
  };

  changeClientStatus(updatedClient: Client) {
    const estadoCliente = updatedClient.estadoCliente ?? false;

    this.clientService.updateStatusClient(updatedClient.idCliente, estadoCliente).subscribe({
      next: () => {
        [this.clients, this.filteredClients].forEach(list => {
          const index = list.findIndex(c => c.idCliente === updatedClient.idCliente);
          if (index !== -1) {
            list[index] = { ...list[index], ...updatedClient };
          }
        });
        this.toastr.success('Estado del cliente actualizado con éxito', 'Éxito');
      },
      error: () => {
        this.toastr.error('Error al actualizar el estado del cliente', 'Error');
      }
    });
  }

  searchClients(query: string) {
    this.filteredClients = this.clients.filter(client =>
      client.nombreCliente.toLowerCase().includes(query.toLowerCase()) ||
      client.apellidoCliente.toLowerCase().includes(query.toLowerCase()) ||
      client.cedulaCliente.toLowerCase().includes(query.toLowerCase()) ||
      client.telefonoCliente.toLowerCase().includes(query.toLowerCase())
    );
  }

  downloadCreditHistory() {
    const doc = new jsPDF();

    // Encabezado con fondo
    doc.setFillColor(33, 150, 243); // Azul
    doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F'); // Rectángulo lleno
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // Texto blanco
    doc.text('Historial de Crédito', doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Información del cliente
    doc.setTextColor(0, 0, 0); // Texto negro
    doc.setFontSize(12);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${currentDate}`, 14, 40);
    if (this.selectedClient) {
        const nombreCompleto = `${this.selectedClient.nombreCliente} ${this.selectedClient.apellidoCliente}`;
        doc.text(`Cliente: ${nombreCompleto}`, 14, 48);
        doc.text(`Cédula: ${this.selectedClient.cedulaCliente}`, 14, 56);
    }

    // Separador
    doc.setDrawColor(200, 200, 200); // Gris claro
    doc.line(14, 60, doc.internal.pageSize.width - 14, 60);

    // Filtrar solo los abonos activos y créditos
    const filteredItems = this.historyItems.filter(item => 
        item.tipo === 'Crédito' || (item.tipo === 'Abono' && item.estadoAbono)
    );

    // Definir las columnas y filas de la tabla
    const columns = ['Fecha', 'Tipo', 'Monto', 'Saldo'];
    const rows = filteredItems.map((item) => [
        new Date(item.fecha).toLocaleDateString(),
        item.tipo,
        `$${item.monto.toFixed(2)}`,
        `$${item.saldo.toFixed(2)}`,
    ]);

    // Agregar la tabla al PDF
    autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 65,
        styles: {
            fontSize: 10,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [33, 150, 243], // Azul
            textColor: 255, // Blanco
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245], // Gris claro
        },
        tableLineColor: [200, 200, 200], // Bordes en gris
        tableLineWidth: 0.1,
    });

    // Calcular el saldo actual (último saldo en el historial)
    const saldoActual = filteredItems.length > 0
        ? filteredItems[filteredItems.length - 1].saldo.toFixed(2)
        : '0.00';

    // Resaltar el saldo actual
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204); // Azul oscuro
    doc.text(`Saldo actual: $${saldoActual}`, 14, finalY + 15);

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150); // Gris
    doc.text(`Página 1 de 1`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    doc.text(`Generado el ${currentDate}`, 14, doc.internal.pageSize.height - 10);

    // Descargar el archivo con el nombre del cliente
    const fileName = `historial_credito_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

}