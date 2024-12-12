import { FieldValidation } from "../../shared/validators/validations.interface";

export const clientsValidationConfig: FieldValidation[] = [
  {
    name: 'cedulaCliente',
    rules: [
      { type: 'required', message: 'La cédula es obligatoria.' },
      { type: 'pattern', value: 'cedula', message: 'Ingrese una cédula válida. (5-10 dígitos)' },
    ],
  },
  {
    name: 'nombreCliente',
    rules: [
      { type: 'required', message: 'El nombre es obligatorio.' },
      { type: 'pattern', value: 'onlyLetters', message: 'Ingrese un nombre válido.' },
    ],
  },
  {
    name: 'apellidoCliente',
    rules: [
      { type: 'required', message: 'El apellido es obligatorio.' },
      { type: 'pattern', value: 'onlyLetters', message: 'Ingrese un apellido válido.' },
    ],
  },
  {
    name: 'direccionCliente',
    rules: [{ type: 'required', message: 'La dirección es obligatoria.' }],
  },
  {
    name: 'telefonoCliente',
    rules: [
      { type: 'required', message: 'El teléfono es obligatorio.' },
      { type: 'pattern', value: 'phone', message: 'Ingrese un número de teléfono válido. (7-10 dígitos)' },
    ],
  },
];
