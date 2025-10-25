import { LitElement, html, css } from 'lit';

export class DurationComponent extends LitElement {
  static formAssociated = true;
  
  static properties = {
    // Form input properties
    value: { type: String, reflect: true },
    name: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    placeholder: { type: String, reflect: true },
    min: { type: String, reflect: true },
    max: { type: String, reflect: true },
    
    // Internal state
    hours: { type: Number },
    minutes: { type: Number },
    seconds: { type: Number },
    _isValid: { type: Boolean, state: true }
  };

  static styles = css`
    :host {
      display: inline-block;
    }

    .duration-input {
      display: flex;
      flex-direction: row;
      gap: 5px;
    }
  `;

  constructor() {
    super();
    this.value = '';
    this.name = '';
    this.required = false;
    this.disabled = false;
    this.readonly = false;
    this.placeholder = '';
    this.min = '00:00:00';
    this.max = '23:59:59';
    
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this._isValid = true;
    
    // Get ElementInternals for form association
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this._parseValue();
    this._validate();
    // Set initial form value
    this._internals.setFormValue(this.value);
  }

  render() {
    return html`
      <div class="duration-input" 
           ?disabled=${this.disabled}
           ?readonly=${this.readonly}>
          <input 
            type="number" 
            .value=${this.hours}
            min="0" 
            max="23"
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @input=${this._onHoursChange}
            @blur=${this._onBlur}
            @focus=${this._onFocus}>
        
        
        <span class="separator">:</span>
        

          <input 
            type="number" 
            .value=${this.minutes}
            min="0" 
            max="59"
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @input=${this._onMinutesChange}
            @blur=${this._onBlur}
            @focus=${this._onFocus}>
        
        <span class="separator">:</span>
        
          <input 
            type="number" 
            .value=${this.seconds}
            min="0" 
            max="59"
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @input=${this._onSecondsChange}
            @blur=${this._onBlur}
            @focus=${this._onFocus}>
        
      </div>
    `;
  }

  _parseValue() {
    if (this.value) {
      const parts = this.value.split(':');
      if (parts.length === 3) {
        this.hours = parseInt(parts[0]) || 0;
        this.minutes = parseInt(parts[1]) || 0;
        this.seconds = parseInt(parts[2]) || 0;
      }
    }
  }

  _updateValue() {
    const newValue = `${this._pad(this.hours)}:${this._pad(this.minutes)}:${this._pad(this.seconds)}`;
    if (newValue !== this.value) {
      this.value = newValue;
      this._dispatchChangeEvent();
      // Update form value for FormData
      this._internals.setFormValue(this.value);
    }
  }

  _pad(num) {
    return num.toString().padStart(2, '0');
  }

  _onHoursChange(e) {
    this.hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
    this._updateValue();
    this._validate();
  }

  _onMinutesChange(e) {
    this.minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    this._updateValue();
    this._validate();
  }

  _onSecondsChange(e) {
    this.seconds = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    this._updateValue();
    this._validate();
  }

  _validate() {
    const currentValue = `${this._pad(this.hours)}:${this._pad(this.minutes)}:${this._pad(this.seconds)}`;
    
    let isValid = true;
    let validityMessage = '';
    
    if (this.required && currentValue === '00:00:00') {
      isValid = false;
      validityMessage = 'Duration is required';
    }
    
    if (this.min && currentValue < this.min) {
      isValid = false;
      validityMessage = `Duration must be at least ${this.min}`;
    }
    
    if (this.max && currentValue > this.max) {
      isValid = false;
      validityMessage = `Duration must be at most ${this.max}`;
    }
    
    this._isValid = isValid;
    this._internals.setValidity({ 
      valueMissing: this.required && currentValue === '00:00:00',
      rangeUnderflow: this.min && currentValue < this.min,
      rangeOverflow: this.max && currentValue > this.max
    }, validityMessage);
  }

  _onFocus() {
    this.dispatchEvent(new CustomEvent('focus', { bubbles: true }));
  }

  _onBlur() {
    this._validate();
    this.dispatchEvent(new CustomEvent('blur', { bubbles: true }));
  }

  _dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('change', { 
      bubbles: true, 
      detail: { value: this.value }
    }));
    this.dispatchEvent(new CustomEvent('input', { 
      bubbles: true, 
      detail: { value: this.value }
    }));
  }

  // Form validation methods
  checkValidity() {
    this._validate();
    return this._internals.checkValidity();
  }

  reportValidity() {
    this._validate();
    return this._internals.reportValidity();
  }

  setCustomValidity(message) {
    this._internals.setValidity({ customError: !!message }, message);
  }

  get validity() {
    return this._internals.validity;
  }

  get validationMessage() {
    return this._internals.validationMessage;
  }

  // Form reset support
  formResetCallback() {
    this.value = '';
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this._isValid = true;
    this._internals.setFormValue('');
  }
}

customElements.define('duration-component', DurationComponent);
