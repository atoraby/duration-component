import { LitElement, html, css } from 'lit';

export class DurationComponent extends LitElement {
  static properties = {
    name: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      padding: 20px;
      border: 2px solid #007acc;
      border-radius: 8px;
      background-color: #f8f9fa;
      margin: 10px 0;
    }

    h2 {
      color: #007acc;
      margin: 0 0 10px 0;
    }

    p {
      margin: 0;
      color: #666;
    }

    button {
      background-color: #007acc;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }

    button:hover {
      background-color: #005a9e;
    }
  `;

  constructor() {
    super();
    this.name = 'World';
    this.count = 0;
  }

  render() {
    return html`
      <h2>Hello, ${this.name}!</h2>
      <p>This is a duration web component.</p>
      <p>Count: ${this.count}</p>
      <button @click=${this._increment}>Increment</button>
    `;
  }

  _increment() {
    this.count++;
    this.requestUpdate();
  }
}

customElements.define('duration-component', DurationComponent);
