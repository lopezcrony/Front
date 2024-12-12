import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  constructor(
    private primeNgConfirmationService: ConfirmationService,
    private toastr: ToastrService
  ) { }

// ALERTA DE CONFIRMACIÓN
confirm(message: string, acceptCallback: () => void, rejectCallback?: () => void) {
  this.primeNgConfirmationService.confirm({
    message: message,
    header: 'Confirmar',
    icon: 'pi pi-info-circle',
    acceptLabel: 'Sí',
    rejectLabel: 'No',
    acceptButtonStyleClass: 'p-button-success p-button-text',
    rejectButtonStyleClass: 'p-button-text p-button-text',
    accept: () => {
      acceptCallback();
    },
    reject: () => {
      if (rejectCallback) {
        rejectCallback();
      }
      this.toastr.info('Operación cancelada.');
    }
  });
}



  menssageCancel(){
    this.toastr.info('Operación cancelada.');
  }
}