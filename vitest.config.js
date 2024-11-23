import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true, // Use globals like `describe` and `it` without imports
    environment: "node", // Set the test environment
    include: ["**/__tests__/**/*.js"], // Match test files
    coverage: {
      reporter: ["text", "html"], // Enable coverage reports
    },
  },
});
