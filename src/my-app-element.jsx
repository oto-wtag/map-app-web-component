import React from "react";
import ReactDOM from "react-dom"; // use render (compatible with React 16+)
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

import globalStyles from "./index.css?inline";
import appStyles from "./App.css?inline";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css?inline";

class MyAppElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._mountPoint = document.createElement("div");
    this._mountPoint.id = "react-app-root";
    this.shadowRoot.appendChild(this._mountPoint);

    this._styleElement = document.createElement("style");
    this._styleElement.textContent = `
      ${globalStyles}
      ${appStyles}
      ${mapboxStyles}
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      #react-app-root {
        width: 100%;
        height: 100%;
      }
    `;
    this.shadowRoot.appendChild(this._styleElement);

    this._rendered = false;
  }

  static get observedAttributes() {
    return ["mapbox-access-token", "initial-path"];
  }

  connectedCallback() {
    this.renderApp(); // render once when added to DOM
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this._rendered) {
      this.renderApp(); // re-render only if already mounted
    }
  }

  disconnectedCallback() {
    if (this._mountPoint) {
      ReactDOM.unmountComponentAtNode(this._mountPoint);
    }
  }

  renderApp() {
    const mapboxAccessToken = this.getAttribute("mapbox-access-token");
    const initialPath = this.getAttribute("initial-path") || "/";

    if (!mapboxAccessToken) {
      this._mountPoint.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%; background:#f0f0f0; color:red; font-weight:bold; padding: 20px;">
          Error: 'mapbox-access-token' attribute is missing on &lt;my-app-element&gt;
        </div>
      `;
      return;
    }

    ReactDOM.render(
      <MemoryRouter initialEntries={[initialPath]}>
        <App mapboxAccessToken={mapboxAccessToken} />
      </MemoryRouter>,
      this._mountPoint
    );

    this._rendered = true;
  }
}

customElements.define("my-app-element", MyAppElement);
