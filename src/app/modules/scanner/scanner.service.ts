import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../Auth/auth.service'; // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class ScannerSocketService {
  private socket: Socket;
  private barcodeSubject = new BehaviorSubject<any>(null);
  private currentUser: any;

  constructor(private authService: AuthService) {
    this.socket = io(environment.apiUrl);

    // Obtener datos del usuario logueado
    this.authService.getUserData().subscribe(user => {
      if (user) {
        this.currentUser = user;
        console.log(`Usuario logueado: ${user.idUsuario}`); // Log para verificar
      }
    });

    // Suscribirse al evento 'newBarcode' para recibir datos en tiempo real
    this.socket.on('newBarcode', (data: any) => {
      console.log('Evento newBarcode recibido:', data); // Log para verificar
      this.processBarcodeData(data);
    });

    // Suscribirse solo a los eventos específicos del usuario
    this.authService.getUserData().subscribe(user => {
      if (user) {
        // Convertir user.idUsuario a cadena
        this.socket.on(user.idUsuario.toString(), (data: any) => {
          console.log(`Evento recibido para el usuario ${user.idUsuario}:`, data); // Log para verificar
          this.processBarcodeData(data);
        });
      }
    });
  }

  private processBarcodeData(data: any) {
    if (data && data.idUsuario === this.currentUser.idUsuario) {
      console.log('El código de barras coincide con el usuario logueado:', data); // Log para verificar
      this.barcodeSubject.next(data);
    } else {
      console.log('El código de barras NO coincide con el usuario logueado.'); // Log para verificar
    }
  }

  getLatestBarcode(): Observable<any> {
    return this.barcodeSubject.asObservable();
  }

  listenClearBarcode() {
    // Usar 'on()' en lugar de 'fromEvent()'
    return new Observable((observer) => {
      this.socket.on('clearBarcode', (data) => {
        observer.next(data);
      });
    });
  }
}
