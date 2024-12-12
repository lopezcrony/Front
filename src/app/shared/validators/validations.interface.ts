import { AbstractControl } from '@angular/forms';

export type ValidationType =
  | 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'min' | 'max';

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
  validator?: (control: AbstractControl) => { [key: string]: any } | null;
}

export interface FieldValidation {
  name: string;
  rules: ValidationRule[];
}

export interface ModuleValidationConfig {
  [key: string]: FieldValidation[];
}

export interface ValidationPatterns {
  [key: string]: RegExp;
}
