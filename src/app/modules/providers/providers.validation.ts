import { FieldValidation } from "../../shared/validators/validations.interface";

export const providersValidationConfig: FieldValidation[] = [
  {
    name: 'nitProveedor',
    rules: [
      { type: 'required', message: 'El NIT es obligatorio.' },
      { type: 'pattern', value: 'nit', message: 'Solo puede ingresar números, puntos y guiones' },
    ],
  },
  {
    name: 'nombreProveedor',
    rules: [
      { type: 'required', message: 'El nombre de la empresa es obligatorio.' },
      { type: 'pattern', value: 'nameProvider', message: 'Ingrese un nombre válido.' },
    ],
  },
  {
    name: 'direccionProveedor',
    rules: [{ type: 'required', message: 'La dirección es obligatoria.' }],
  },
  {
    name: 'telefonoProveedor',
    rules: [
      { type: 'required', message: 'El teléfono es obligatorio.' },
      { type: 'pattern', value: 'phoneProvider', message: 'Ingrese un número de teléfono válido. (7-12 dígitos)' },
    ],
  },
];
