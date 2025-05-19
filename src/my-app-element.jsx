import React from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

import globalStyles from "./index.css?inline";
import appStyles from "./App.css?inline";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css?inline";

class MyAppElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // Open mode allows external JS to access shadow DOM (e.g., for debugging)
    this._root = null; // To store the React root
  }

  static get observedAttributes() {
    // Define attributes that, when changed, should trigger attributeChangedCallback
    return ["mapbox-access-token", "initial-path"];
  }

  connectedCallback() {
    // Called when the element is added to the DOM
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Called when one of the observedAttributes changes
    if (oldValue !== newValue) {
      // Re-render if an attribute changes.
      // You might want more sophisticated logic here depending on the attribute.
      this.render();
    }
  }

  disconnectedCallback() {
    // Called when the element is removed from the DOM
    // Clean up React resources
    if (this._root) {
      this._root.unmount();
    }
  }

  render() {
    // Clear previous content in shadow DOM if any (e.g., on re-render)
    // It's generally better to let React manage the updates within its container.
    // However, if attributes cause a full re-render from scratch, ensure the shadow DOM is prepared.
    // For simplicity, we'll re-create the root container and React root on each render call.

    // Ensure shadowRoot is available
    if (!this.shadowRoot) {
      console.error("Shadow root not available for my-app-element.");
      return;
    }

    // Clear existing content in shadow DOM before re-rendering
    // This is important if attributes change and you want a "fresh" render
    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    }

    // Create a container for React app inside the shadow DOM
    const mountPoint = document.createElement("div");
    mountPoint.id = "react-app-root"; // Optional: for easier debugging
    this.shadowRoot.appendChild(mountPoint);

    // Inject CSS into the Shadow DOM
    const styleElement = document.createElement("style");
    styleElement.textContent = `
        ${globalStyles}
        ${appStyles}
        ${mapboxStyles}
        /* Add any additional styles specific to the web component wrapper if needed */
        :host { /* Styles for the custom element itself */
          display: block; /* Or inline-block, etc. */
          width: 100%;
          height: 100%; /* Ensure the host element has dimensions */
          border: none; /* Reset default border for custom elements if any */
        }
        #react-app-root {
          width: 100%;
          height: 100%;
        }
      `;
    this.shadowRoot.appendChild(styleElement);

    // Get props from attributes
    const mapboxAccessToken = this.getAttribute("mapbox-access-token");
    const initialPath = this.getAttribute("initial-path") || "/";

    if (!mapboxAccessToken) {
      const errorDiv = document.createElement("div");
      errorDiv.style.cssText =
        "display:flex; justify-content:center; align-items:center; height:100%; background-color:#f0f0f0; color:red; font-weight:bold; padding: 20px; box-sizing: border-box;";
      errorDiv.textContent =
        "Error: mapbox-access-token attribute is missing on <my-app-element>.";
      this.shadowRoot.appendChild(errorDiv);
      return;
    }

    // Create a React root and render the App
    this._root = createRoot(mountPoint);
    this._root.render(
      <React.StrictMode>
        <MemoryRouter initialEntries={[initialPath]}>
          <App mapboxAccessToken={mapboxAccessToken} />
        </MemoryRouter>
      </React.StrictMode>
    );
  }
}

customElements.define("my-app-element", MyAppElement);
