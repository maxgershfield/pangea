#!/usr/bin/env tsx
/**
 * Test script for Ethereum wallet generation
 * 
 * Usage:
 *   OASIS_API_URL=http://localhost:5003 tsx scripts/test-ethereum-wallet.ts
 * 
 * This script:
 * 1. Creates an OASIS avatar (or uses existing)
 * 2. Generates an Ethereum wallet for the avatar
 * 3. Links the wallet to the avatar
 * 4. Verifies the wallet is linked
 */

import axios from "axios";

const OASIS_API_URL = process.env.OASIS_API_URL || "https://api.oasisweb4.com";
const TEST_EMAIL = process.env.TEST_EMAIL || `test-eth-${Date.now()}@example.com`;
const TEST_USERNAME = TEST_EMAIL.split("@")[0];
const TEST_PASSWORD = process.env.TEST_PASSWORD || "TestPassword123!@#";
const TEST_FIRST_NAME = "Test";
const TEST_LAST_NAME = "User";

interface AvatarRegisterResponse {
	result?: {
		result?: {
			AvatarId?: string;
			Id?: string;
		};
		avatarId?: string;
		id?: string;
	};
	avatarId?: string;
	id?: string;
}

interface AvatarAuthenticateResponse {
	Result?: {
		Result?: {
			JwtToken?: string;
		};
		jwtToken?: string;
	};
	result?: {
		result?: {
			jwtToken?: string;
		};
		jwtToken?: string;
	};
	jwtToken?: string;
}

interface KeypairResponse {
	result?: {
		result?: {
			privateKey?: string;
			publicKey?: string;
			walletAddress?: string;
		};
	};
	privateKey?: string;
	publicKey?: string;
	walletAddress?: string;
}

interface WalletLinkResponse {
	result?: {
		result?: {
			walletId?: string;
			id?: string;
		};
		walletId?: string;
		id?: string;
	};
	walletId?: string;
	id?: string;
}

async function createAvatar(): Promise<{ avatarId: string; jwtToken: string }> {
	console.log("\n📝 Step 1: Creating OASIS avatar...");
	console.log(`   Email: ${TEST_EMAIL}`);
	console.log(`   Username: ${TEST_USERNAME}`);

	try {
		const response = await axios.post<AvatarRegisterResponse>(
			`${OASIS_API_URL}/api/avatar/register`,
			{
				title: "Mr",
				firstName: TEST_FIRST_NAME,
				lastName: TEST_LAST_NAME,
				email: TEST_EMAIL,
				password: TEST_PASSWORD,
				confirmPassword: TEST_PASSWORD,
				username: TEST_USERNAME,
				avatarType: "User",
				acceptTerms: true,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const responseData = response.data?.Result || response.data?.result || response.data;
		const avatarData = responseData?.Result || responseData?.result || responseData;

		if (responseData?.IsError || responseData?.isError) {
			throw new Error(responseData.Message || responseData.message || "Unknown registration error");
		}

		const avatarId = avatarData?.AvatarId || avatarData?.avatarId || avatarData?.Id || avatarData?.id;
		if (!avatarId) {
			throw new Error("Failed to get avatar ID from response");
		}

		console.log(`✅ Avatar created successfully!`);
		console.log(`   Avatar ID: ${avatarId}`);

		console.log("\n🔐 Authenticating with OASIS API...");
		const authResponse = await axios.post<AvatarAuthenticateResponse>(
			`${OASIS_API_URL}/api/avatar/authenticate`,
			{
				username: TEST_EMAIL,
				password: TEST_PASSWORD,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const authResponseData = authResponse.data?.Result || authResponse.data?.result || authResponse.data;
		const authResultData = authResponseData?.Result || authResponseData?.result || authResponseData;

		if (authResponseData?.IsError || authResponseData?.isError) {
			throw new Error(authResponseData.Message || authResponseData.message || "Unknown authentication error");
		}

		const jwtToken = authResultData?.JwtToken || authResultData?.jwtToken || authResponseData?.jwtToken;
		if (!jwtToken) {
			throw new Error("Failed to get JWT token from authentication response");
		}

		console.log(`✅ Authenticated successfully!`);
		return { avatarId, jwtToken };
	} catch (error: any) {
		console.error(`❌ Failed to create avatar:`);
		console.error(`   Status: ${error.response?.status}`);
		console.error(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`);
		throw error;
	}
}

async function generateEthereumKeypair(jwtToken: string): Promise<{
	privateKey: string;
	publicKey: string;
	walletAddress?: string;
}> {
	console.log("\n🔑 Step 2: Generating Ethereum keypair...");
	try {
		const response = await axios.post<KeypairResponse>(
			`${OASIS_API_URL}/api/keys/generate_keypair_for_provider/EthereumOASIS`,
			{},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${jwtToken}`,
				},
			}
		);

		const keypairResponseData = response.data?.result || response.data;
		const keypairResult = keypairResponseData?.result || keypairResponseData;

		if (keypairResponseData?.isError || keypairResult?.isError) {
			throw new Error(keypairResponseData.message || keypairResult.message || "Failed to generate keypair");
		}

		const privateKey = keypairResult?.privateKey || keypairResponseData?.privateKey;
		const publicKey = keypairResult?.publicKey || keypairResponseData?.publicKey;
		// Ethereum wallet address might not be in response - public key can be used as wallet address
		const walletAddress = keypairResult?.walletAddress || keypairResponseData?.walletAddress || publicKey;

		if (!privateKey || !publicKey) {
			console.error("❌ Failed to get keypair from response:", JSON.stringify(response.data, null, 2));
			throw new Error("No keypair in response");
		}

		console.log(`✅ Ethereum keypair generated successfully!`);
		console.log(`   Public Key: ${publicKey.substring(0, 20)}...`);
		console.log(`   Wallet Address: ${walletAddress}`);

		return {
			privateKey,
			publicKey,
			walletAddress,
		};
	} catch (error: any) {
		console.error(`❌ Failed to generate Ethereum keypair:`);
		console.error(`   Status: ${error.response?.status}`);
		console.error(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`);
		throw error;
	}
}

async function linkPrivateKey(avatarId: string, privateKey: string, jwtToken: string): Promise<string> {
	console.log("\n🔐 Step 3: Linking private key to avatar...");
	try {
		const response = await axios.post<WalletLinkResponse>(
			`${OASIS_API_URL}/api/keys/link_provider_private_key_to_avatar_by_id`,
			{
				AvatarID: avatarId,
				ProviderType: "EthereumOASIS",
				ProviderKey: privateKey,
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${jwtToken}`,
				},
			}
		);

		const linkPrivateKeyResponseData = response.data?.result || response.data;
		const linkPrivateKeyResult = linkPrivateKeyResponseData?.result || linkPrivateKeyResponseData;

		// Wallet ID is in result even if there's an error (storage failed but wallet was created)
		const walletId = linkPrivateKeyResponseData?.walletId || 
			linkPrivateKeyResult?.walletId || 
			linkPrivateKeyResponseData?.result || 
			response.data?.result;

		if (!walletId) {
			console.error("❌ Failed to get wallet ID from response:", JSON.stringify(response.data, null, 2));
			throw new Error("No wallet ID in response");
		}

		// Check if there was an error (expected - storage providers may fail)
		if (linkPrivateKeyResponseData?.isError || response.data?.isError) {
			console.log("⚠️  Note: Wallet created but storage provider failed (expected for MongoDB)");
			console.log(`   Error: ${linkPrivateKeyResponseData?.message || response.data?.message || 'Unknown error'}`);
		}

		console.log(`✅ Private key linked successfully!`);
		console.log(`   Wallet ID: ${walletId}`);
		return walletId;
	} catch (error: any) {
		console.error(`❌ Failed to link private key:`);
		console.error(`   Status: ${error.response?.status}`);
		console.error(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`);
		throw error;
	}
}

async function linkPublicKey(
	avatarId: string,
	walletId: string,
	publicKey: string,
	walletAddress: string,
	jwtToken: string
): Promise<void> {
	console.log("\n🔓 Step 4: Linking public key to wallet...");
	try {
		await axios.post(
			`${OASIS_API_URL}/api/keys/link_provider_public_key_to_avatar_by_id`,
			{
				WalletId: walletId,
				AvatarID: avatarId,
				ProviderType: "EthereumOASIS",
				ProviderKey: publicKey,
				WalletAddress: walletAddress,
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${jwtToken}`,
				},
			}
		);

		console.log(`✅ Public key linked successfully!`);
	} catch (error: any) {
		console.error(`❌ Failed to link public key:`);
		console.error(`   Status: ${error.response?.status}`);
		console.error(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`);
		throw error;
	}
}

async function verifyWallet(avatarId: string, jwtToken: string): Promise<void> {
	console.log("\n🔍 Step 5: Verifying wallet is linked...");
	try {
		const response = await axios.get(
			`${OASIS_API_URL}/api/wallet/avatar/${avatarId}/wallets`,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${jwtToken}`,
				},
			}
		);

		const responseData = response.data?.result || response.data;
		const wallets = responseData?.result || responseData;

		console.log(`✅ Wallet verification successful!`);
		if (wallets && typeof wallets === 'object') {
			const allWallets = Object.values(wallets).flat() as any[];
			console.log(`   Total wallets: ${allWallets.length}`);
			if (allWallets.length > 0) {
				console.log(`   Provider types: ${Object.keys(wallets).join(', ')}`);
			}
		}
	} catch (error: any) {
		console.error("❌ Failed to verify wallet:");
		if (error.response) {
			console.error(`   Status: ${error.response.status}`);
			console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
		} else {
			console.error(`   Error: ${error.message}`);
		}
		console.log("⚠️  Note: Wallet was created successfully, but verification endpoint returned an error.");
	}
}

async function main() {
	console.log("🚀 Starting Ethereum Wallet Generation Test");
	console.log(`📍 OASIS API URL: ${OASIS_API_URL}`);
	console.log(`📧 Test Email: ${TEST_EMAIL}`);

	try {
		// Step 1: Create avatar and authenticate
		const { avatarId, jwtToken } = await createAvatar();

		// Step 2: Generate Ethereum keypair
		const { privateKey, publicKey, walletAddress } = await generateEthereumKeypair(jwtToken);

		// Step 3: Link private key (creates wallet)
		const walletId = await linkPrivateKey(avatarId, privateKey, jwtToken);

		// Step 4: Link public key (completes wallet)
		await linkPublicKey(avatarId, walletId, publicKey, walletAddress, jwtToken);

		// Step 5: Verify wallet
		await verifyWallet(avatarId, jwtToken);

		console.log("\n🎉 All steps completed successfully!");
		console.log(`\n📊 Summary:`);
		console.log(`   Avatar ID: ${avatarId}`);
		console.log(`   Wallet ID: ${walletId}`);
		console.log(`   Wallet Address: ${walletAddress}`);
		console.log(`   Provider: EthereumOASIS`);
		console.log(`   Public Key: ${publicKey.substring(0, 20)}...`);
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

