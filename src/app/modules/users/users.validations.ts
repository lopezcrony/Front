import { FieldValidation } from '../../shared/validators/validations.interface';

export const usersValidationConfig: FieldValidation[] = [
  {
    name: 'idRol',
    rules: [
      { type: 'required', message: 'El rol es obligatorio.' },
    ],
  },
  {
    name: 'cedulaUsuario',
    rules: [
      { type: 'required', message: 'La cédula es obligatoria.' },
      { type: 'pattern', value: 'cedula', message: 'Ingrese una cédula válida. (5-10 dígitos)' },
    ],
  },
  {
    name: 'nombreUsuario',
    rules: [
      { type: 'required', message: 'El nombre es obligatorio.' },
      { type: 'pattern', value: 'onlyLetters', message: 'Ingrese un nombre válido.' },
    ],
  },
  {
    name: 'apellidoUsuario',
    rules: [
      { type: 'required', message: 'El apellido es obligatorio.' },
      { type: 'pattern', value: 'onlyLetters', message: 'Ingrese un apellido válido.' },
    ],
  },
  {
    name: 'telefonoUsuario',
    rules: [
      { type: 'required', message: 'El teléfono es obligatorio.' },
      { type: 'pattern', value: 'phone', message: 'Ingrese un número de teléfono válido. (7-10 dígitos)' },
    ],
  },
  {
    name: 'correoUsuario',
    rules: [
      { type: 'required', message: 'El correo es obligatorio.' },
      { type: 'pattern', value: 'email', message: 'Ingrese un correo válido.' },
    ],

  },
  {
    name: 'claveUsuario',
    rules: [
      { type: 'required', message: 'La contraseña es obligatoria.' },
    ],
  },


];
