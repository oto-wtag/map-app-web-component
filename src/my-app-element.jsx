import React from "react";
import { MemoryRouter } from "react-router-dom";
import r2wc from "@r2wc/react-to-webcomponent"; // Import r2wc

import App from "./App.jsx";

// Import styles as strings to be injected into the Shadow DOM
import globalStyles from "./index.css?inline";
import appStyles from "./App.css?inline";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css?inline";

// This is the React component that r2wc will wrap.
// It's responsible for rendering the main application and injecting styles into the shadow DOM.
const R2WCAppWrapper = ({ mapboxAccessToken, initialPath }) => {
  // Handle missing required attributes
  if (!mapboxAccessToken) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          backgroundColor: "#f0f0f0",
          color: "red",
          fontWeight: "bold",
          padding: "20px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        Error: The 'mapbox-access-token' attribute is missing.
      </div>
    );
  }

  // The root div of our React app within the shadow DOM.
  // We ensure this div and its contents can fill the space provided by the custom element.
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <style>
        {`
          /* Inject all necessary styles directly into the shadow DOM */
          ${globalStyles}
          ${appStyles}
          ${mapboxStyles}

          /* Styles for the custom element host itself (e.g., <my-app-element>)
            should ideally be set by the consumer of the web component.
            For example:
            my-app-element {
              display: block;
              width: 500px;
              height: 300px;
            }
            The div wrapper with 100% width/height above ensures the React content
            fills the space allocated to the custom element by its consumer.
          */
        `}
      </style>
      <MemoryRouter initialEntries={[initialPath || "/"]}>
        <App mapboxAccessToken={mapboxAccessToken} />
      </MemoryRouter>
    </div>
  );
};

// Convert the R2WCAppWrapper React component to a Web Component using r2wc
// @r2wc/react-to-webcomponent handles:
// - Creating the Shadow DOM (if `shadow: "open"` or `shadow: "closed"` is specified).
// - Mapping attributes (kebab-case) to React props (camelCase).
// - Managing the React component's lifecycle (mounting, unmounting, updates).
const MyAppWebComponent = r2wc(R2WCAppWrapper, {
  props: {
    // Define how HTML attributes map to React props and their expected types.
    // 'mapbox-access-token' attribute will map to 'mapboxAccessToken' prop.
    mapboxAccessToken: "string",
    // 'initial-path' attribute will map to 'initialPath' prop.
    initialPath: "string",
  },
  shadow: "open", // Use Shadow DOM for style encapsulation. 'open' allows external inspection.
});

// Define the custom element in the browser's registry.
// This makes <my-app-element> usable in any HTML page once this script is loaded.
if (!customElements.get("my-app-element")) {
  customElements.define("my-app-element", MyAppWebComponent);
} else {
  // This warning might appear during development with Hot Module Replacement (HMR)
  // if the script is re-executed. It's generally harmless in that context.
  console.warn(
    "<my-app-element> is already defined. This can happen during HMR."
  );
}
