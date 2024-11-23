import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/__tests__/**/*.js"],
    coverage: {
      reporter: ["text", "html"],
    },
    exclude: "**/__mocks__/**",
  },
});
