import { LitElement } from "lit";

export class DurationComponent extends LitElement {
  static formAssociated: true;

  name: string;
  value: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  placeholder: string;
  min: string;
  max: string;

  // Form validation methods
  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(message: string): void;
  get validity(): ValidityState;
  get validationMessage(): string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "duration-component": {
        name?: string;
        value?: string;
        required?: boolean;
        disabled?: boolean;
        readonly?: boolean;
        placeholder?: string;
        min?: string;
        max?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
