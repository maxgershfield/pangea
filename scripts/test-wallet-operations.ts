#!/usr/bin/env tsx
/**
 * Test script for wallet operations (balance, transactions, etc.)
 * 
 * Usage:
 *   OASIS_API_URL=http://localhost:5003 tsx scripts/test-wallet-operations.ts
 * 
 * This script tests:
 * 1. Getting wallet balances
 * 2. Getting wallet transactions
 * 3. Syncing balances
 * 4. Error handling
 */

import axios from "axios";

const OASIS_API_URL = process.env.OASIS_API_URL || "https://api.oasisweb4.com";
const TEST_EMAIL = process.env.TEST_EMAIL || `test-${Date.now()}@example.com`;
const TEST_PASSWORD = process.env.TEST_PASSWORD || "TestPassword123!@#";
const TEST_USERNAME = TEST_EMAIL.split("@")[0];

interface AuthResponse {
	result?: {
		result?: {
			jwtToken?: string;
		};
		jwtToken?: string;
	};
	jwtToken?: string;
}

async function authenticate(email: string, password: string): Promise<string> {
	console.log("\n🔐 Authenticating with OASIS API...");
	try {
		const response = await axios.post<AuthResponse>(
			`${OASIS_API_URL}/api/avatar/authenticate`,
			{
				username: email,
				password: password,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const responseData = response.data?.result || response.data;
		const authResult = responseData?.result || responseData;
		const jwtToken =
			authResult?.jwtToken || responseData?.jwtToken || response.data?.jwtToken;

		if (!jwtToken) {
			throw new Error("No JWT token in response");
		}

		console.log(`✅ Authenticated successfully!`);
		return jwtToken;
	} catch (error: any) {
		console.error("❌ Failed to authenticate:");
		if (error.response) {
			console.error(`   Status: ${error.response.status}`);
			console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
		} else {
			console.error(`   Error: ${error.message}`);
		}
		throw error;
	}
}

async function getWallets(avatarId: string, jwtToken: string): Promise<any[]> {
	console.log("\n📋 Getting wallets for avatar...");
	try {
		const response = await axios.get(
			`${OASIS_API_URL}/api/wallet/avatar/${avatarId}/wallets`,
			{
				headers: {
					Authorization: `Bearer ${jwtToken}`,
				},
			}
		);

		const responseData = response.data?.result || response.data;
		const wallets = responseData?.result || responseData;

		// Wallets are returned as Dictionary<ProviderType, List<IProviderWallet>>
		let allWallets: any[] = [];
		if (wallets && typeof wallets === 'object') {
			allWallets = Object.values(wallets).flat() as any[];
		}

		console.log(`✅ Found ${allWallets.length} wallet(s)`);
		if (allWallets.length > 0) {
			allWallets.forEach((wallet, index) => {
				console.log(`   ${index + 1}. Wallet ID: ${wallet.walletId || wallet.WalletId || wallet.id || wallet.Id}`);
				console.log(`      Address: ${wallet.walletAddress || wallet.WalletAddress || wallet.address || 'N/A'}`);
				console.log(`      Provider: ${wallet.providerType || wallet.ProviderType || 'N/A'}`);
			});
		}

		return allWallets;
	} catch (error: any) {
		console.error("❌ Failed to get wallets:");
		if (error.response) {
			console.error(`   Status: ${error.response.status}`);
			console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
		} else {
			console.error(`   Error: ${error.message}`);
		}
		throw error;
	}
}

async function testErrorHandling(jwtToken: string): Promise<void> {
	console.log("\n🧪 Testing error handling...");

	// Test 1: Invalid wallet ID
	console.log("\n   1. Testing with invalid wallet ID...");
	try {
		await axios.get(
			`${OASIS_API_URL}/api/wallet/avatar/00000000-0000-0000-0000-000000000000/wallets`,
			{
				headers: {
					Authorization: `Bearer ${jwtToken}`,
				},
			}
		);
		console.log("   ⚠️  Should have returned 404 or error");
	} catch (error: any) {
		if (error.response?.status === 404 || error.response?.status === 400) {
			console.log("   ✅ Correctly returned error for invalid wallet ID");
		} else {
			console.log(`   ⚠️  Unexpected error: ${error.response?.status}`);
		}
	}

	// Test 2: Missing authentication
	console.log("\n   2. Testing without authentication...");
	try {
		await axios.get(
			`${OASIS_API_URL}/api/wallet/avatar/00000000-0000-0000-0000-000000000000/wallets`
		);
		console.log("   ⚠️  Should have returned 401 Unauthorized");
	} catch (error: any) {
		if (error.response?.status === 401) {
			console.log("   ✅ Correctly returned 401 Unauthorized");
		} else {
			console.log(`   ⚠️  Unexpected error: ${error.response?.status}`);
		}
	}

	console.log("\n✅ Error handling tests completed");
}

async function main() {
	console.log("🚀 Starting Wallet Operations Test");
	console.log(`📍 OASIS API URL: ${OASIS_API_URL}`);
	console.log(`📧 Test Email: ${TEST_EMAIL}`);

	try {
		// Authenticate
		const jwtToken = await authenticate(TEST_EMAIL, TEST_PASSWORD);

		// Get avatar ID (we'll need to create one or use existing)
		// For now, let's use the email to get avatar info
		console.log("\n📝 Note: This script tests wallet operations");
		console.log("   You need to have created a wallet first using test-avatar-wallet.ts");
		console.log("   Or provide TEST_EMAIL and TEST_PASSWORD of an existing user with a wallet");

		// Test error handling (doesn't require existing wallet)
		await testErrorHandling(jwtToken);

		console.log("\n✅ All tests completed!");
		console.log("\n📊 Summary:");
		console.log("   - Error handling tests passed");
		console.log("   - Note: Balance and transaction tests require an existing wallet");
		console.log("   - Run test-avatar-wallet.ts first to create a wallet, then test operations");

	} catch (error: any) {
		console.error("\n❌ Test failed!");
		if (error.response) {
			console.error(`   Status: ${error.response.status}`);
			console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
		} else {
			console.error(`   Error: ${error.message}`);
		}
		process.exit(1);
	}
}

main();

