import { Component, OnInit } from '@angular/core';
import {BarcodesService } from '../barcodes/barcodes.service';
import { Barcode } from './barcode.model';

@Component({
  selector: 'app-barcodes',
  standalone: true,
  imports: [],
  templateUrl: './barcodes.component.html',
  styleUrl: './barcodes.component.css'
})
export class BarcodesComponent implements OnInit {
  barcode: Barcode[] = [];
  filteredBarcode: Barcode[] = [];
  constructor(
    private barcodeservice:BarcodesService,
  ){}

  loadBarcode() {
    this.barcodeservice.getAllBarcodes().subscribe(data => {
      this.barcode = data;
      this.filteredBarcode = data;
    });
  }


  ngOnInit() {
    this.loadBarcode();
  }

}
