import { LitElement } from "lit";

export class DurationComponent extends LitElement {
  name: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "duration-component": {
        name?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
