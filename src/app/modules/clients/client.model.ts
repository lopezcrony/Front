export interface Client {
  idCliente: number;
  cedulaCliente: string;
  nombreCliente: string;
  apellidoCliente: string;
  direccionCliente: string;
  telefonoCliente: string;
  estadoCliente?: boolean;
}
