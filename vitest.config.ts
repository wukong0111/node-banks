import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules", "dist"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"test/",
				"dist/",
				"**/*.config.{ts,js}",
				"**/*.d.ts",
			],
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@contexts": resolve(__dirname, "./src/contexts"),
			"@shared": resolve(__dirname, "./src/shared"),
			"@test": resolve(__dirname, "./test"),
		},
	},
});