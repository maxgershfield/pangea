import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { webcrypto } from "node:crypto";
import { AppModule } from "./app.module.js";

// Polyfill Web Crypto API for Better-Auth (ES module compatibility)
// Better-Auth expects `crypto` to be available globally
if (typeof globalThis.crypto === "undefined") {
	globalThis.crypto = webcrypto as any;
}
// Also make it available as a global variable for ES modules
if (typeof (global as any).crypto === "undefined") {
	(global as any).crypto = webcrypto;
}

async function bootstrap() {
	// Create app with JSON body parser enabled
	// Better-Auth will handle its own routes, but we need body parser for other routes
	const app = await NestFactory.create(AppModule);

	// Enable CORS
	const corsOrigins = process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3001"];
	app.enableCors({
		origin: corsOrigins,
		credentials: true,
	});

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		})
	);

	// Global prefix for all routes
	app.setGlobalPrefix("api");

	// Swagger/OpenAPI documentation
	const config = new DocumentBuilder()
		.setTitle("Pangea Markets API")
		.setDescription(
			"RWA Trading Platform Backend API - Real-world asset (RWA) trading platform for tokenized assets on Solana and Ethereum blockchains"
		)
		.setVersion("1.0")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				name: "JWT",
				description: "Enter JWT token",
				in: "header",
			},
			"JWT-auth" // This name here is important for matching up with @ApiBearerAuth() in your controller!
		)
		.addServer("http://localhost:3000/api", "Local development server")
		.addServer("https://api.pangeamarkets.com/api", "Production server")
		.addTag("Auth", "Authentication and user management endpoints")
		.addTag("Orders", "Order creation, management, and order book operations")
		.addTag("Trades", "Trade execution and trade history endpoints")
		.addTag("Transactions", "Deposit and withdrawal transaction endpoints")
		.addTag("Wallet", "Wallet management and balance queries via OASIS API")
		.addTag("Assets", "Asset management and asset information endpoints")
		.addTag("Smart Contracts", "Smart contract interaction endpoints")
		.setContact("Pangea Markets", "https://pangeamarkets.com", "support@pangeamarkets.com")
		.setLicense("MIT", "https://opensource.org/licenses/MIT")
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, document, {
		swaggerOptions: {
			persistAuthorization: true,
			tagsSorter: "alpha",
			operationsSorter: "alpha",
		},
		customSiteTitle: "Pangea Markets API Documentation",
		customCss: ".swagger-ui .topbar { display: none }",
	});

	app.enableShutdownHooks();

	const port = process.env.PORT || 3000;
	// Bind to 0.0.0.0 to accept connections from Railway/external hosts
	await app.listen(port, "0.0.0.0");

	console.log(`Pangea Markets Backend is running on: http://0.0.0.0:${port}/api`);

	// Handle graceful shutdown
	process.on("SIGTERM", async () => {
		console.log("SIGTERM received, shutting down gracefully...");
		await app.close();
		process.exit(0);
	});

	process.on("SIGINT", async () => {
		console.log("SIGINT received, shutting down gracefully...");
		await app.close();
		process.exit(0);
	});
}

bootstrap();
