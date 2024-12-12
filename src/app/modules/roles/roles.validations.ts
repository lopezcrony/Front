import { FieldValidation } from "../../shared/validators/validations.interface";

export const rolesValidationConfig: FieldValidation[] = [
  {
    name: 'nombreRol',
    rules: [
      { type: 'required', message: 'El nombre del rol es obligatorio.' },
      { type: 'pattern', value: 'onlyLetters', message: 'El nombre solo debe contener letras.' },
    ],
  },
 
];
