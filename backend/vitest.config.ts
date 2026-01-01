import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		// Use SWC for TypeScript transformation
		swc.vite({
			jsc: {
				parser: {
					syntax: "typescript",
					decorators: true,
				},
				transform: {
					legacyDecorator: true,
					decoratorMetadata: true,
				},
				target: "es2022",
			},
		}),
	],
	test: {
		// Test globals
		globals: true,
		environment: "node",

		// Test file patterns
		include: ["src/**/*.spec.ts", "test/**/*.spec.ts"],

		// Setup file - must load before tests for reflect-metadata
		setupFiles: ["./vitest.setup.ts"],

		// Isolate each test file for clean state
		isolate: true,

		// Increase timeouts for async NestJS operations
		testTimeout: 30000,
		hookTimeout: 30000,

		// Coverage configuration
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			exclude: ["node_modules", "dist", "**/*.spec.ts", "test/**"],
		},
	},
});
