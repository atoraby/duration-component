import { LitElement, html, css } from "lit";

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
    _isValid: { type: Boolean, state: true },
    _formDisabled: { type: Boolean, state: true },
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
    this.value = "";
    this.name = "";
    this.required = false;
    this.disabled = false;
    this.readonly = false;
    this.placeholder = "";
    this.min = "00:00:00";
    this.max = "23:59:59";

    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this._isValid = true;
    this._customValidityMessage = "";
    this._skipNextValueSync = false;
    this._defaultValue = undefined;
    this._valueOnFocus = "";
    this._hasFocus = false;
    this._formDisabled = false;

    // Get ElementInternals for form association
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute("tabindex")) {
      this.tabIndex = -1;
    }
    if (this._defaultValue === undefined) {
      this._defaultValue = this.getAttribute("value") ?? "";
    }
    this._parseValue();
    this._validate();
    // Set initial form value
    this._internals.setFormValue(this.value);
  }

  updated(changedProperties) {
    if (changedProperties.has("value")) {
      if (this._skipNextValueSync) {
        this._skipNextValueSync = false;
      } else {
        this._parseValue();
        this._internals.setFormValue(this.value);
      }
    }

    if (
      changedProperties.has("value") ||
      changedProperties.has("required") ||
      changedProperties.has("min") ||
      changedProperties.has("max")
    ) {
      this._validate();
    }
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
  }

  get _isInputDisabled() {
    return this.disabled || this._formDisabled;
  }

  _placeholderParts() {
    if (!this.placeholder) {
      return { hours: "", minutes: "", seconds: "" };
    }
    const parts = this.placeholder.split(":");
    if (parts.length === 3) {
      return {
        hours: parts[0],
        minutes: parts[1],
        seconds: parts[2],
      };
    }
    return { hours: this.placeholder, minutes: "", seconds: "" };
  }

  focus(options) {
    this._focusFirstInput(options);
  }

  _focusFirstInput(options) {
    const input = this.renderRoot?.querySelector(
      "input:not([disabled]):not([readonly])"
    );
    input?.focus(options);
  }

  render() {
    const placeholders = this._placeholderParts();
    return html`
      <div
        class="duration-input"
        ?disabled=${this._isInputDisabled}
        ?readonly=${this.readonly}
        @focusin=${this._onContainerFocus}
        @focusout=${this._onContainerBlur}
      >
        <input
          part="hours-input"
          type="number"
          aria-label="Hours"
          .value=${this.hours}
          placeholder=${placeholders.hours}
          min="0"
          max="23"
          ?disabled=${this._isInputDisabled}
          ?readonly=${this.readonly}
          @input=${this._onHoursChange}
        />

        <span class="separator">:</span>

        <input
          part="minutes-input"
          type="number"
          aria-label="Minutes"
          .value=${this.minutes}
          placeholder=${placeholders.minutes}
          min="0"
          max="59"
          ?disabled=${this._isInputDisabled}
          ?readonly=${this.readonly}
          @input=${this._onMinutesChange}
        />

        <span class="separator">:</span>

        <input
          part="seconds-input"
          type="number"
          aria-label="Seconds"
          .value=${this.seconds}
          placeholder=${placeholders.seconds}
          min="0"
          max="59"
          ?disabled=${this._isInputDisabled}
          ?readonly=${this.readonly}
          @input=${this._onSecondsChange}
        />
      </div>
    `;
  }

  _parseValue() {
    if (!this.value) {
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      return;
    }

    const parts = this.value.split(":");
    if (parts.length === 3) {
      this.hours = Math.max(0, Math.min(23, parseInt(parts[0], 10) || 0));
      this.minutes = Math.max(0, Math.min(59, parseInt(parts[1], 10) || 0));
      this.seconds = Math.max(0, Math.min(59, parseInt(parts[2], 10) || 0));
    } else {
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
    }

    const normalized = this._formatDuration(
      this.hours,
      this.minutes,
      this.seconds
    );
    if (normalized !== this.value) {
      this._skipNextValueSync = true;
      this.value = normalized;
    }
  }

  _formatDuration(hours, minutes, seconds) {
    return `${this._pad(hours)}:${this._pad(minutes)}:${this._pad(seconds)}`;
  }

  _parseDurationToSeconds(durationStr) {
    if (!durationStr) {
      return null;
    }
    const parts = durationStr.split(":");
    if (parts.length !== 3) {
      return null;
    }
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }
    return hours * 3600 + minutes * 60 + seconds;
  }

  _updateValue() {
    const newValue = this._formatDuration(
      this.hours,
      this.minutes,
      this.seconds
    );
    if (newValue !== this.value) {
      this._skipNextValueSync = true;
      this.value = newValue;
      this._dispatchInputEvent();
      this._internals.setFormValue(this.value);
    }
  }

  _pad(num) {
    return num.toString().padStart(2, "0");
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
    const currentValue = this._formatDuration(
      this.hours,
      this.minutes,
      this.seconds
    );
    const currentSeconds = this._parseDurationToSeconds(currentValue);
    const minSeconds = this._parseDurationToSeconds(this.min);
    const maxSeconds = this._parseDurationToSeconds(this.max);

    const valueMissing = this.required && currentValue === "00:00:00";
    const rangeUnderflow =
      minSeconds !== null &&
      currentSeconds !== null &&
      currentSeconds < minSeconds;
    const rangeOverflow =
      maxSeconds !== null &&
      currentSeconds !== null &&
      currentSeconds > maxSeconds;
    const customError = !!this._customValidityMessage;

    let validityMessage = "";
    if (customError) {
      validityMessage = this._customValidityMessage;
    } else if (valueMissing) {
      validityMessage = "Duration is required";
    } else if (rangeUnderflow) {
      validityMessage = `Duration must be at least ${this.min}`;
    } else if (rangeOverflow) {
      validityMessage = `Duration must be at most ${this.max}`;
    }

    this._isValid =
      !valueMissing && !rangeUnderflow && !rangeOverflow && !customError;
    this._internals.setValidity(
      {
        valueMissing,
        rangeUnderflow,
        rangeOverflow,
        customError,
      },
      validityMessage
    );
  }

  _onContainerFocus() {
    if (this._hasFocus) {
      return;
    }
    this._hasFocus = true;
    this._valueOnFocus = this.value;
    this.dispatchEvent(new CustomEvent("focus", { bubbles: true }));
  }

  _onContainerBlur(e) {
    const next = e.relatedTarget;
    if (next && this.renderRoot.contains(next)) {
      return;
    }
    this._hasFocus = false;
    this._validate();
    if (this.value !== this._valueOnFocus) {
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          detail: { value: this.value },
        })
      );
    }
    this.dispatchEvent(new CustomEvent("blur", { bubbles: true }));
  }

  _dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        detail: { value: this.value },
      })
    );
  }

  // Form validation methods
  checkValidity() {
    this._validate();
    return this._internals.checkValidity();
  }

  reportValidity() {
    this._validate();
    const valid = this._internals.checkValidity();
    if (!valid) {
      this._internals.reportValidity();
      this._focusFirstInput();
    }
    return valid;
  }

  setCustomValidity(message) {
    this._customValidityMessage = message;
    this._validate();
  }

  get validity() {
    return this._internals.validity;
  }

  get validationMessage() {
    return this._internals.validationMessage;
  }

  // Form reset support
  formResetCallback() {
    this._skipNextValueSync = true;
    this.value = this._defaultValue ?? "";
    this._parseValue();
    this._validate();
    this._internals.setFormValue(this.value);
  }
}

customElements.define("duration-component", DurationComponent);
