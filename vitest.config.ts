import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "./test-report/coverage",
      include: [
        "lib/utils.ts",
        "lib/identity-format.ts",
        "lib/csr-helpers.ts",
        "lib/validations/**/*.ts",
        "components/transactions/transaction-log.tsx",
      ],
      exclude: ["**/*.d.ts", "lib/seed*.ts", "lib/mongodb.ts"],
    },
    reporters: ["verbose"],
    outputFile: {
      json: "./test-report/results.json",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
