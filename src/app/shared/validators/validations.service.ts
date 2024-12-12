import { Injectable } from '@angular/core';
import { ValidatorFn, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { validationsConfig } from './validations.config';
import { validationPatterns } from './validation.patterns';
import {
  ModuleValidationConfig,
  ValidationPatterns,
  ValidationRule,
  FieldValidation,
} from './validations.interface';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private validationConfig: ModuleValidationConfig = validationsConfig;
  private patterns: ValidationPatterns = validationPatterns;

  constructor() { }

  getValidatorsForField(module: string, fieldName: string): ValidatorFn[] {
    const fieldConfig = this.getFieldConfig(module, fieldName);
    if (!fieldConfig) return [];

    return fieldConfig.rules.map((rule) => this.createValidator(rule));
  }

  getErrorMessage(module: string, fieldName: string, errorKey: string): string {
    const fieldConfig = this.getFieldConfig(module, fieldName);
    if (!fieldConfig) return '';

    const rule = fieldConfig.rules.find(
      (r) => r.type === errorKey ||
        (r.type === 'pattern' && errorKey === 'pattern') ||
        (r.type === 'custom' && errorKey === 'exceedsMaxCredit')
    );

    return rule ? rule.message : '';
  }

  private getFieldConfig(module: string, fieldName: string): FieldValidation | undefined {
    return this.validationConfig[module]?.find((field) => field.name === fieldName);
  }

  private createValidator(rule: ValidationRule): ValidatorFn {
    switch (rule.type) {
      case 'required':
        return Validators.required;
      case 'minLength':
        return Validators.minLength(rule.value);
      case 'maxLength':
        return Validators.maxLength(rule.value);
      case 'pattern':
        const pattern = this.patterns[rule.value] || rule.value;
        return Validators.pattern(pattern);
      case 'min':
        return Validators.min(rule.value);
      case 'max':
        return Validators.max(rule.value);
      case 'custom':
        return (control: AbstractControl): ValidationErrors | null => {
          return rule.validator ? rule.validator(control) : null;
        };
      default:
        return () => null;
    }
  }
}
