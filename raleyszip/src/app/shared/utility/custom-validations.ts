import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';

export class CustomValidation {
  static noWhitespaceValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    if (typeof control.value == 'string') {
      const isWhitespace = control.value.trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { whitespace: true };
    }
  }
}
