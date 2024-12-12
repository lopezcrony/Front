import { FieldValidation } from '../../shared/validators/validations.interface';

export const returnProviderValidationConfig: FieldValidation[] = [
  {
    name: 'cantidad',
    rules: [
      { type: 'required', message: 'Ingrese la cantidad.' },
      { type: 'pattern', value: 'onlyNumbers', message: 'La cantidad solo debe contener números.' },
      { type: 'min', value: 1 , message: 'Debe ser mayor a 0.' },
    ],
  }, 
  {
    name: 'NombreProveedor',
    rules: [
      { type: 'required', message: 'Se necesita el nombre del proveedor.' },
      { type: 'pattern', value: 'onlyLetters', message: 'El nombre solo debe contener letras.' },
    ],
  }, 
  {
    name: 'motivoDevolucion',
    rules: [
      { type: 'required', message: 'Ingrese el motivo de la pérdida.' },
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