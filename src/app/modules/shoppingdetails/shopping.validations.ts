import { FieldValidation } from '../../shared/validators/validations.interface';

export const shoppingValidation: FieldValidation[] = [
 
  {
    name: 'idProveedor',
    rules: [
      { type: 'required', message: 'Seleccione un proveedor.' }
    ]
  },
  {
    name: 'fechaCompra',
    rules: [
      { type: 'required', message: 'Ingrese la fecha de compra.(no se permite fecha posterior a la actual)' },
    ]
  },
  {
    name: 'numeroFactura',
    rules: [
      { type: 'required', message: 'El número de la factura es obligatorio' },
      { type: 'pattern', value: 'onlyNumbers', message: 'Ingrese solo números' }

    ]
  },
  {
    name: 'idProducto',
    rules: [
      { type: 'required', message: 'Seleccione un producto' },
    ]
  },
  {
    name: 'codigoBarra',
    rules: [
      { type: 'required', message: 'Ingrese el codigo de barra' },
      { type: 'pattern', value: 'alfanumeric', message: 'Ingrese solo números' },
      { type: 'min', value: 0, message: 'Ingrese un código valido' }
    ]
  },
  {
    name: 'cantidadProducto',
    rules: [
      { type: 'required', message: 'Ingrese la cantidad de productos.' },
      { type: 'pattern', value: 'onlyNumbers', message: 'Ingrese una cantidad valida.' },
      { type: 'min', value: 1, message: 'La cantidad debe ser mayor a 0.' },
    ]
  },
  {
    name: 'precioCompraUnidad',
    rules: [
      { type: 'required', message: 'Ingrese el precio de compra.' },
      { type: 'pattern', value: 'price', message: 'Ingrese un valor valido.' },
      { type: 'min', value: 50, message: 'El precio debe ser mayor que 50 COP.' },
    ]
  },
];
