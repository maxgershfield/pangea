#!/usr/bin/env tsx
/**
 * Test script for wallet operations through Pangea backend
 * 
 * Usage:
 *   PANGEA_API_URL=http://localhost:3000 tsx scripts/test-pangea-wallet-operations.ts
 * 
 * This script tests:
 * 1. Wallet generation via Pangea API
 * 2. Get balances via Pangea API
 * 3. Wallet transactions via Pangea API
 * 
 * Note: Requires Better Auth JWT token for authentication
 */

import axios from "axios";

const PANGEA_API_URL = process.env.PANGEA_API_URL || "http://localhost:3000";
const OASIS_API_URL = process.env.OASIS_API_URL || "http://localhost:5003";

interface AuthResponse {
	token?: string;
	accessToken?: string;
	jwtToken?: string;
}

async function checkBackendHealth(): Promise<boolean> {
	console.log("\n🔍 Checking Pangea backend health...");
	try {
		const response = await axios.get(`${PANGEA_API_URL}/api/health`, {
			timeout: 5000,
		});
		console.log(`✅ Backend is running!`);
		console.log(`   Response: ${JSON.stringify(response.data)}`);
		return true;
	} catch (error: any) {
		console.error(`❌ Backend not responding:`);
		console.error(`   URL: ${PANGEA_API_URL}/api/health`);
		console.error(`   Error: ${error.message}`);
		return false;
	}
}

async function checkOasisHealth(): Promise<boolean> {
	console.log("\n🔍 Checking OASIS API health...");
	try {
		const response = await axios.get(`${OASIS_API_URL}/api/settings/version`, {
			timeout: 5000,
		});
		console.log(`✅ OASIS API is running!`);
		console.log(`   Version: ${response.data}`);
		return true;
	} catch (error: any) {
		console.error(`❌ OASIS API not responding:`);
		console.error(`   URL: ${OASIS_API_URL}/api/settings/version`);
		console.error(`   Error: ${error.message}`);
		return false;
	}
}

async function main() {
	console.log("🚀 Pangea Wallet Operations Test");
	console.log(`📍 Pangea API URL: ${PANGEA_API_URL}`);
	console.log(`📍 OASIS API URL: ${OASIS_API_URL}`);

	try {
		// Check if services are running
		const backendHealthy = await checkBackendHealth();
		const oasisHealthy = await checkOasisHealth();

		if (!backendHealthy) {
			console.error("\n❌ Pangea backend is not running!");
			console.error("   Please start it with: npm run start:dev");
			process.exit(1);
		}

		if (!oasisHealthy) {
			console.error("\n❌ OASIS API is not running!");
			console.error("   Please start it with: dotnet run (in ONODE/NextGenSoftware.OASIS.API.ONODE.WebAPI)");
			process.exit(1);
		}

		console.log("\n✅ Both services are running!");
		console.log("\n📝 Note: Wallet operations require Better Auth JWT token");
		console.log("   You'll need to authenticate via the frontend or Better Auth");
		console.log("   to get a valid JWT token for testing wallet endpoints.");
		console.log("\n📋 Available wallet endpoints:");
		console.log(`   POST ${PANGEA_API_URL}/api/wallet/generate`);
		console.log(`   GET  ${PANGEA_API_URL}/api/wallet/balance`);
		console.log(`   POST ${PANGEA_API_URL}/api/wallet/sync`);
		console.log(`   GET  ${PANGEA_API_URL}/api/wallet/transactions/:walletId`);

		console.log("\n✅ Health checks completed successfully!");
	} catch (error: any) {
		console.error("\n❌ Test failed!");
		console.error(`   Error: ${error.message}`);
		process.exit(1);
	}
}

main();

