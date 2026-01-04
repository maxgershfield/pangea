#!/usr/bin/env tsx
/**
 * Test script for wallet operations through Pangea backend
 * 
 * Usage:
 *   PANGEA_API_URL=http://localhost:3000 OASIS_API_URL=http://localhost:5003 tsx scripts/test-wallet-via-pangea.ts
 * 
 * This script tests wallet operations via Pangea backend API:
 * 1. Generate wallet (using test endpoint)
 * 2. Get balances
 * 3. Sync balances
 */

import axios from "axios";
import { randomUUID } from "crypto";

const PANGEA_API_URL = process.env.PANGEA_API_URL || "http://localhost:3000";
const OASIS_API_URL = process.env.OASIS_API_URL || "http://localhost:5003";
const TEST_EMAIL = `test-pangea-${Date.now()}@example.com`;
const TEST_USER_ID = randomUUID(); // userId must be a valid UUID

interface TestGenerateWalletResponse {
	success?: boolean;
	message?: string;
	wallet?: {
		walletId: string;
		walletAddress: string;
		providerType: string;
		isDefaultWallet: boolean;
		balance?: number;
	};
}

async function checkBackendHealth(): Promise<boolean> {
	console.log("\n🔍 Checking Pangea backend health...");
	try {
		const response = await axios.get(`${PANGEA_API_URL}/api/health`, {
			timeout: 5000,
		});
		console.log(`✅ Backend is running!`);
		console.log(`   Health: ${JSON.stringify(response.data)}`);
		return true;
	} catch (error: any) {
		console.error(`❌ Backend not responding:`);
		console.error(`   Error: ${error.message}`);
		return false;
	}
}

async function testGenerateWallet(): Promise<TestGenerateWalletResponse | null> {
	console.log("\n📝 Step 1: Testing wallet generation via Pangea backend...");
	console.log(`   Email: ${TEST_EMAIL}`);
	console.log(`   Provider: SolanaOASIS`);

	try {
		const response = await axios.post<TestGenerateWalletResponse>(
			`${PANGEA_API_URL}/api/wallet/test/generate`,
			{
				userId: TEST_USER_ID,
				email: TEST_EMAIL,
				name: "Test User",
				providerType: "SolanaOASIS",
				setAsDefault: true,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
				timeout: 30000,
			}
		);

		console.log(`✅ Wallet generated successfully!`);
		console.log(`   Response:`, JSON.stringify(response.data, null, 2));

		return response.data;
	} catch (error: any) {
		console.error(`❌ Failed to generate wallet:`);
		if (error.response) {
			console.error(`   Status: ${error.response.status}`);
			console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
		} else {
			console.error(`   Error: ${error.message}`);
		}
		return null;
	}
}

async function main() {
	console.log("🚀 Testing Wallet Operations via Pangea Backend");
	console.log(`📍 Pangea API URL: ${PANGEA_API_URL}`);
	console.log(`📍 OASIS API URL: ${OASIS_API_URL}`);
	console.log(`📧 Test Email: ${TEST_EMAIL}`);

	try {
		// Check backend health
		const isHealthy = await checkBackendHealth();
		if (!isHealthy) {
			console.error("\n❌ Pangea backend is not running!");
			console.error("   Please start it with: npm run start:dev");
			process.exit(1);
		}

		// Test wallet generation
		const walletResult = await testGenerateWallet();

		if (walletResult && walletResult.wallet) {
			console.log("\n✅ Wallet Generation Test Passed!");
			console.log(`\n📊 Summary:`);
			console.log(`   Wallet ID: ${walletResult.wallet.walletId}`);
			console.log(`   Wallet Address: ${walletResult.wallet.walletAddress}`);
			console.log(`   Provider: ${walletResult.wallet.providerType}`);
			console.log(`   Default: ${walletResult.wallet.isDefaultWallet}`);
			console.log(`   Balance: ${walletResult.wallet.balance || 0}`);

			console.log("\n📝 Next Steps:");
			console.log("   - To test balance operations, you'll need a Better Auth JWT token");
			console.log("   - Use the frontend or Better Auth to authenticate");
			console.log("   - Then test: GET /api/wallet/balance");
			console.log("   - Test: POST /api/wallet/sync");
		} else {
			console.error("\n❌ Wallet generation test failed!");
			process.exit(1);
		}

		console.log("\n✅ Tests completed!");
	} catch (error: any) {
		console.error("\n❌ Test failed!");
		console.error(`   Error: ${error.message}`);
		if (error.response) {
			console.error(`   Status: ${error.response.status}`);
			console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
		}
		process.exit(1);
	}
}

main();

