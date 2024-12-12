import { AbstractControl } from "@angular/forms";
import { FieldValidation } from "../../shared/validators/validations.interface";

export const creditsValidationConfig: FieldValidation[] = [
  {
    name: 'montoAbonado',
    rules: [
      { type: 'required', message: 'El monto es obligatorio.' },
      { type: 'pattern', value: 'price', message: 'Ingrese un valor válido.' },
      {
        type: 'custom',
        message: 'El monto abonado no puede ser mayor que la deuda actual.',
        validator: (control: AbstractControl) => {
          const formGroup = control.parent;
          if (formGroup) {
            const totalCredito = formGroup.get('totalCredito')?.value;
            return control.value && control.value > totalCredito 
              ? { exceedsMaxCredit: true } 
              : null;
          }
          return null;
        }
      }
    ],
  },
];