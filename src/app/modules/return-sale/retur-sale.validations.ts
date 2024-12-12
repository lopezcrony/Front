import { FieldValidation } from '../../shared/validators/validations.interface';

export const returnSaleValidationConfig: FieldValidation[] = [
  {
    name: 'idDetalleVenta',
    rules: [
      { type: 'required', message: 'Ingrese la factura.' },
      { type: 'pattern', value: 'onlyNumbers', message: 'La cantidad solo debe contener números.' },
    ],
  }, 
  {
    name: 'cantidad',
    rules: [
      { type: 'required', message: 'Ingrese la cantidad.' },
      { type: 'pattern', value: 'onlyNumbers', message: 'La cantidad solo debe contener números.' },
      { type: 'min', value: 1 , message: 'Debe ser mayor a 0.' },
    ],
  },  
  {
    name: 'motivoDevolucion',
    rules: [
      { type: 'required', message: 'Ingrese el motivo de la devolución.' },
      { type: 'pattern', value: 'onlyLetters', message: 'El motivo solo debe contener letras.' },
    ],
  },
  {
    name: 'tipoReembolso',
    rules: [
      { type: 'required', message: 'Ingrese el tipo de la devolución.' },
      { type: 'pattern', value: 'onlyLetters', message: 'El motivo solo debe contener letras.' },
    ],
  },
  {
    name: 'CodigoProducto',
    rules: [
      { type: 'required', message: 'El código de barras es obligatorio.' },
      { type: 'pattern', value: 'alfanumeric', message: 'El código de barras solo debe contener números.' },
    ],
  },
];