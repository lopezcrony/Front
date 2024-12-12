import { FieldValidation } from "../../shared/validators/validations.interface";

export const loginValidation: FieldValidation[] = [
  {
    name: 'correoUsuario',
    rules: [
      { type: 'required', message: 'El correo es obligatorio.' },
      { type: 'pattern', value: 'email', message: 'Ingrese un correo válido. Por ejemplo: prueba@prueba.com' },
    ],
  },
  {
    name: 'claveUsuario',
    rules: [
      { type: 'required', message: 'La contraseña es obligatoria.' },
      { type: 'minLength', value: 8, message: 'La contraseña debe tener mínimo 8 carácteres.' },
      { type: 'maxLength', value: 16, message: 'La contraseña debe tener máximo 16 carácteres.' },
    ],
  }
];
