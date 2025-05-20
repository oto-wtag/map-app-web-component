import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production"
    ),
    "process.env": {}, // Add this line
    process: { env: {} }, // Add this line too
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.jsx"), // Your web component entry
      name: "MyAppWebComponent", // Global UMD var name
      fileName: (format) => `my-app-web-component.${format}.js`, // Output file names
      formats: ["es", "umd"], // ES module + UMD build
    },
    rollupOptions: {
      // Externalize react & react-dom to avoid bundling them in UMD format
      // (optional: do this if your consumers will provide React)
      // external: ["react", "react-dom"],
      // output: {
      //   globals: {
      //     react: "React",
      //     "react-dom": "ReactDOM",
      //   },
      // },
      // If you want a fully self-contained bundle (including React),
      // don't externalize react/react-dom (default behavior).
    },
    minify: "esbuild", // fast minification
    sourcemap: true, // good for debugging
  },
  server: {
    cors: true,
  },
});
