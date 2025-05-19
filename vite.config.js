import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
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
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.jsx"),
      name: "MyAppWebComponent",
      fileName: (format) => `my-app-web-component.${format}.js`,
      formats: ["es", "umd"],
    },
    // lib: {
    //   entry: path.resolve(__dirname, "src/main.jsx"),
    //   name: "MyApp",
    //   fileName: () => "myApp.js",
    //   formats: ["umd"],
    // },
  },
  server: {
    cors: true,
  },
});
