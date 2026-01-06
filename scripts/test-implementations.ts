#!/usr/bin/env tsx
/**
 * Integration test script for testing the implemented agent features:
 * - Agent 1: Trade Execution (BlockchainService.executeTrade)
 * - Agent 2: Withdrawals (BlockchainService.withdraw)
 * - Agent 3: Payment Token Balance (BalanceService.getPaymentTokenBalance)
 * - Agent 4: Order Validation (OrdersService.validateOrder)
 * - Agent 5: Transaction Status (BlockchainService.getTransaction)
 */

import axios from "axios";

const PANGEA_API_URL = process.env.PANGEA_API_URL || "http://localhost:3000";
const OASIS_API_URL = process.env.OASIS_API_URL || "http://localhost:5003";

console.log("🧪 Testing Implemented Features");
console.log(`📍 Pangea API: ${PANGEA_API_URL}`);
console.log(`📍 OASIS API: ${OASIS_API_URL}`);
console.log("");

// Test configuration
const TEST_USER_ID = process.env.TEST_USER_ID || "";
const TEST_JWT_TOKEN = process.env.TEST_JWT_TOKEN || "";
const TEST_ASSET_ID = process.env.TEST_ASSET_ID || "";

interface TestResult {
	name: string;
	status: "PASS" | "FAIL" | "SKIP";
	message: string;
	details?: any;
}

const results: TestResult[] = [];

function addResult(name: string, status: "PASS" | "FAIL" | "SKIP", message: string, details?: any) {
	results.push({ name, status, message, details });
	const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
	console.log(`${icon} ${name}: ${message}`);
	if (details) {
		console.log(`   Details:`, JSON.stringify(details, null, 2));
	}
	console.log("");
}

// Test 1: Check services are running
async function testServiceHealth(): Promise<void> {
	console.log("=== Test 1: Service Health ===");
	try {
		const pangeaHealth = await axios.get(`${PANGEA_API_URL}/api/health`);
		addResult(
			"Pangea Backend Health",
			pangeaHealth.status === 200 ? "PASS" : "FAIL",
			`Status: ${pangeaHealth.status}`
		);

		const oasisHealth = await axios.get(`${OASIS_API_URL}/api/settings/version`);
		addResult(
			"OASIS API Health",
			oasisHealth.status === 200 ? "PASS" : "FAIL",
			`Status: ${oasisHealth.status}`
		);
	} catch (error: any) {
		addResult("Service Health Check", "FAIL", error.message);
	}
}

// Test 2: Payment Token Balance (Agent 3)
// This is tested indirectly via order validation
async function testPaymentTokenBalance(): Promise<void> {
	console.log("=== Test 2: Payment Token Balance (Agent 3) ===");
	console.log("   ⚠️  This is an internal service method.");
	console.log("   ⚠️  Will be tested via Order Validation (Test 4).");
	addResult(
		"Payment Token Balance",
		"SKIP",
		"Tested indirectly via Order Validation (Agent 4)"
	);
}

// Test 3: Order Validation (Agent 4)
async function testOrderValidation(): Promise<void> {
	console.log("=== Test 3: Order Validation (Agent 4) ===");

	if (!TEST_JWT_TOKEN) {
		addResult(
			"Order Validation",
			"SKIP",
			"TEST_JWT_TOKEN not provided - requires authentication"
		);
		return;
	}

	if (!TEST_ASSET_ID) {
		addResult(
			"Order Validation",
			"SKIP",
			"TEST_ASSET_ID not provided - requires test asset"
		);
		return;
	}

	try {
		// Test 3a: Create buy order with validation
		// This should trigger BalanceService.getPaymentTokenBalance() and OrdersService.validateOrder()
		console.log("   Attempting to create buy order...");
		const orderResponse = await axios.post(
			`${PANGEA_API_URL}/api/orders`,
			{
				assetId: TEST_ASSET_ID,
				orderType: "buy",
				quantity: 1,
				pricePerTokenUsd: 100,
				blockchain: "solana",
			},
			{
				headers: {
					Authorization: `Bearer ${TEST_JWT_TOKEN}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (orderResponse.status === 201) {
			addResult(
				"Order Validation (Buy Order)",
				"PASS",
				"Order created successfully - validation passed"
			);
		} else {
			addResult(
				"Order Validation (Buy Order)",
				"FAIL",
				`Unexpected status: ${orderResponse.status}`
			);
		}
	} catch (error: any) {
		if (error.response?.status === 400) {
			// This could be insufficient balance (expected behavior)
			const message = error.response?.data?.message || error.message;
			if (message.includes("balance") || message.includes("Insufficient")) {
				addResult(
					"Order Validation (Buy Order - Insufficient Balance)",
					"PASS",
					`Validation working correctly: ${message}`
				);
			} else {
				addResult(
					"Order Validation (Buy Order)",
					"FAIL",
					`Validation error: ${message}`,
					error.response?.data
				);
			}
		} else {
			addResult("Order Validation (Buy Order)", "FAIL", error.message);
		}
	}
}

// Test 4: Transaction Status (Agent 5)
async function testTransactionStatus(): Promise<void> {
	console.log("=== Test 4: Transaction Status (Agent 5) ===");

	if (!TEST_JWT_TOKEN) {
		addResult(
			"Transaction Status",
			"SKIP",
			"TEST_JWT_TOKEN not provided - requires authentication"
		);
		return;
	}

	console.log("   ⚠️  Transaction status is tested via transaction confirmation endpoint.");
	console.log("   ⚠️  Requires an existing transaction with a transaction hash.");
	addResult(
		"Transaction Status",
		"SKIP",
		"Requires existing transaction with hash - test manually via POST /api/transactions/:txId/confirm"
	);
}

// Test 5: Withdrawals (Agent 2)
async function testWithdrawals(): Promise<void> {
	console.log("=== Test 5: Withdrawals (Agent 2) ===");

	if (!TEST_JWT_TOKEN) {
		addResult(
			"Withdrawals",
			"SKIP",
			"TEST_JWT_TOKEN not provided - requires authentication"
		);
		return;
	}

	if (!TEST_ASSET_ID) {
		addResult(
			"Withdrawals",
			"SKIP",
			"TEST_ASSET_ID not provided - requires test asset"
		);
		return;
	}

	console.log("   ⚠️  Withdrawal testing requires:");
	console.log("   - User with wallet and balance");
	console.log("   - External address for withdrawal");
	console.log("   - May need OASIS API support for external addresses");
	addResult(
		"Withdrawals",
		"SKIP",
		"Requires wallet with balance and external address - test manually via POST /api/transactions/withdraw"
	);
}

// Test 6: Trade Execution (Agent 1)
async function testTradeExecution(): Promise<void> {
	console.log("=== Test 6: Trade Execution (Agent 1) ===");

	if (!TEST_JWT_TOKEN) {
		addResult(
			"Trade Execution",
			"SKIP",
			"TEST_JWT_TOKEN not provided - requires authentication"
		);
		return;
	}

	if (!TEST_ASSET_ID) {
		addResult(
			"Trade Execution",
			"SKIP",
			"TEST_ASSET_ID not provided - requires test asset"
		);
		return;
	}

	console.log("   ⚠️  Trade execution is triggered by order matching.");
	console.log("   ⚠️  Requires matching buy and sell orders.");
	console.log("   ⚠️  Test manually by:");
	console.log("      1. Create buy order");
	console.log("      2. Create matching sell order");
	console.log("      3. Verify trade executes and transaction hash is returned");
	addResult(
		"Trade Execution",
		"SKIP",
		"Requires matching buy/sell orders - test manually via order matching"
	);
}

// Main test runner
async function main() {
	console.log("🚀 Starting Integration Tests for Implemented Features\n");

	// Run tests
	await testServiceHealth();
	await testPaymentTokenBalance();
	await testOrderValidation();
	await testTransactionStatus();
	await testWithdrawals();
	await testTradeExecution();

	// Summary
	console.log("=== Test Summary ===");
	const passed = results.filter((r) => r.status === "PASS").length;
	const failed = results.filter((r) => r.status === "FAIL").length;
	const skipped = results.filter((r) => r.status === "SKIP").length;

	console.log(`✅ Passed: ${passed}`);
	console.log(`❌ Failed: ${failed}`);
	console.log(`⚠️  Skipped: ${skipped}`);
	console.log(`📊 Total: ${results.length}`);
	console.log("");

	if (failed > 0) {
		console.log("Failed tests:");
		results.filter((r) => r.status === "FAIL").forEach((r) => {
			console.log(`  - ${r.name}: ${r.message}`);
		});
		console.log("");
	}

	if (skipped > 0 && !TEST_JWT_TOKEN) {
		console.log("⚠️  Note: Many tests require authentication.");
		console.log("   Set TEST_JWT_TOKEN environment variable to test authenticated endpoints.");
		console.log("   Set TEST_ASSET_ID for order/transaction tests.");
		console.log("");
	}

	console.log("💡 For full integration testing:");
	console.log("   1. Authenticate via Better Auth to get JWT token");
	console.log("   2. Create OASIS avatar (if needed)");
	console.log("   3. Generate wallet for user");
	console.log("   4. Test order creation (validates balance)");
	console.log("   5. Test order matching (executes trades)");
	console.log("   6. Test withdrawals");
	console.log("   7. Test transaction confirmation");
	console.log("");
}

main().catch((error) => {
	console.error("❌ Test suite failed:", error);
	process.exit(1);
});





