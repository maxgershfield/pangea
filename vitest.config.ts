import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		// swc for typescript transformation
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
		// test globals
		globals: true,
		environment: "node",

		// test file patterns
		include: ["src/**/*.spec.ts", "test/**/*.spec.ts"],

		// setup file
		setupFiles: ["./vitest.setup.ts"],

		// isolate each test file for clean state
		isolate: true,

		// increase timeouts for async NestJS operations
		testTimeout: 30_000,
		hookTimeout: 30_000,

		// coverage configuration
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			exclude: ["node_modules", "dist", "**/*.spec.ts", "test/**"],
		},
	},
});
