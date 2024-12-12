import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ScannerSocketService } from './scanner.service';

@Component({
  selector: 'app-barcode',
  standalone: true,
  template: `
    <div class="container">
      <h2>Código escaneado en tiempo real</h2>
      <div *ngIf="latestBarcode">
        <div class="barcode-info">
          <p>Código: {{latestBarcode.barcode}}</p>
          <p>Escaneado: {{latestBarcode.timestamp}}</p>
        </div>
      </div>
    </div>
  `,
  imports: [CommonModule]
})
export class ScannerComponent implements OnInit, OnDestroy {
  latestBarcode: any;
  private subscription!: Subscription;

  constructor(private scannerSocketService: ScannerSocketService) {}

  ngOnInit() {
    this.subscription = this.scannerSocketService.getLatestBarcode().subscribe(barcode => {
      if (barcode) {
        console.log('Código de barras recibido en el componente:', barcode); // Log para verificar
        this.latestBarcode = barcode;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
