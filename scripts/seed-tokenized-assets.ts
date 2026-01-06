import "reflect-metadata";
import { config } from "dotenv";
import { AppDataSource } from "../src/config/data-source.js";
import { TokenizedAsset } from "../src/assets/entities/tokenized-asset.entity.js";
import { BetterAuthUser } from "../src/auth/entities/better-auth-user.entity.js";

// Load environment variables
config();

/**
 * Seed script for tokenized_assets table with realistic RWA (Real-World Asset) data
 * 
 * Usage:
 *   npm run seed:assets
 * 
 * Or directly:
 *   tsx scripts/seed-tokenized-assets.ts
 */

interface SeedAssetData {
	assetId: string;
	name: string;
	symbol: string;
	description: string;
	assetClass: string;
	assetType: string | null;
	totalSupply: bigint;
	decimals: number;
	tokenStandard: string;
	blockchain: string;
	network: string;
	contractAddress: string | null;
	mintAddress: string | null;
	totalValueUsd: number;
	pricePerTokenUsd: number;
	metadataUri: string | null;
	imageUri: string | null;
	legalDocumentsUri: string | null;
	status: string;
	metadata: Record<string, any>;
}

// Helper function to generate Brandfetch logo URL
// Set BRANDFETCH_CLIENT_ID environment variable to use Brandfetch API
// Format: https://cdn.brandfetch.io/{domain}?c={client-id}
function getLogoUrl(domain: string): string {
	const clientId = process.env.BRANDFETCH_CLIENT_ID || "1ida8ggQZDf64bgCqxt";
	return `https://cdn.brandfetch.io/${domain}?c=${clientId}`;
}

const seedAssetsData: SeedAssetData[] = [
	// 1. Coinbase (COIN) - $254.50
	{
		assetId: "RWA-COIN-001",
		name: "Coinbase",
		symbol: "COIN",
		description: "Leading cryptocurrency exchange platform, publicly traded on NASDAQ",
		assetClass: "private_equity",
		assetType: "fintech",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0xCc3B000000000000000000000000000000000000",
		mintAddress: null,
		totalValueUsd: 254_500_000,
		pricePerTokenUsd: 254.50,
		metadataUri: "https://ipfs.io/ipfs/QmCoinbase",
		imageUri: getLogoUrl("coinbase.com"),
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalCoinbase",
		status: "trading",
		metadata: {
			companyType: "Fintech",
			foundedYear: 2012,
			headquarters: "Wilmington, DE, USA",
			employees: 4900,
			valuation: 50_000_000_000,
		},
	},
	// 2. SpaceX (SPCX) - $97.00
	{
		assetId: "RWA-SPCX-001",
		name: "SpaceX",
		symbol: "SPCX",
		description: "Aerospace manufacturer and space transportation company",
		assetClass: "private_equity",
		assetType: "aerospace",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0xSpcX000000000000000000000000000000000000",
		mintAddress: null,
		totalValueUsd: 97_000_000,
		pricePerTokenUsd: 97.00,
		metadataUri: "https://ipfs.io/ipfs/QmSpaceX",
		imageUri: getLogoUrl("spacex.com"),
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalSpaceX",
		status: "trading",
		metadata: {
			companyType: "Aerospace",
			foundedYear: 2002,
			headquarters: "Hawthorne, CA, USA",
			employees: 13000,
			valuation: 180_000_000_000,
		},
	},
	// 3. Databricks (DBKS) - $73.50
	{
		assetId: "RWA-DBKS-001",
		name: "Databricks",
		symbol: "DBKS",
		description: "Unified analytics platform built on Apache Spark",
		assetClass: "private_equity",
		assetType: "data_tech",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0xDbks000000000000000000000000000000000000",
		mintAddress: null,
		totalValueUsd: 73_500_000,
		pricePerTokenUsd: 73.50,
		metadataUri: "https://ipfs.io/ipfs/QmDatabricks",
		imageUri: getLogoUrl("databricks.com"),
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalDatabricks",
		status: "trading",
		metadata: {
			companyType: "Data Tech",
			foundedYear: 2013,
			headquarters: "San Francisco, CA, USA",
			employees: 7000,
			valuation: 43_000_000_000,
		},
	},
	// 4. X (X) - $30.00
	{
		assetId: "RWA-X-001",
		name: "X",
		symbol: "X",
		description: "Social media platform and microblogging service (formerly Twitter)",
		assetClass: "private_equity",
		assetType: "social_media",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0xX0000000000000000000000000000000000000000",
		mintAddress: null,
		totalValueUsd: 30_000_000,
		pricePerTokenUsd: 30.00,
		metadataUri: "https://ipfs.io/ipfs/QmX",
		imageUri: getLogoUrl("x.com"),
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalX",
		status: "trading",
		metadata: {
			companyType: "Social Media",
			foundedYear: 2006,
			headquarters: "San Francisco, CA, USA",
			employees: 2000,
			valuation: 19_000_000_000,
		},
	},
	// 5. Stripe (STRIP) - $29.00
	{
		assetId: "RWA-STRIP-001",
		name: "Stripe",
		symbol: "STRIP",
		description: "Payment processing software and APIs for e-commerce",
		assetClass: "private_equity",
		assetType: "fintech",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0xStri0000000000000000000000000000000000000",
		mintAddress: null,
		totalValueUsd: 29_000_000,
		pricePerTokenUsd: 29.00,
		metadataUri: "https://ipfs.io/ipfs/QmStripe",
		imageUri: getLogoUrl("stripe.com"),
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalStripe",
		status: "trading",
		metadata: {
			companyType: "Fintech",
			foundedYear: 2010,
			headquarters: "San Francisco, CA, USA",
			employees: 8000,
			valuation: 65_000_000_000,
		},
	},
	// 6. Plaid (PLAID) - $15.50
	{
		assetId: "RWA-PLAID-001",
		name: "Plaid",
		symbol: "PLAID",
		description: "APIs for connecting bank accounts to financial applications",
		assetClass: "private_equity",
		assetType: "fintech",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0xPlai0000000000000000000000000000000000000",
		mintAddress: null,
		totalValueUsd: 15_500_000,
		pricePerTokenUsd: 15.50,
		metadataUri: "https://ipfs.io/ipfs/QmPlaid",
		imageUri: getLogoUrl("plaid.com"),
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalPlaid",
		status: "trading",
		metadata: {
			companyType: "Fintech",
			foundedYear: 2013,
			headquarters: "San Francisco, CA, USA",
			employees: 1200,
			valuation: 13_400_000_000,
		},
	},
	// 7. Kraken (KRKN) - $12.00
	{
		assetId: "RWA-KRKN-001",
		name: "Kraken",
		symbol: "KRKN",
		description: "One of the world's largest cryptocurrency exchanges",
		assetClass: "private_equity",
		assetType: "fintech",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0xKrak0000000000000000000000000000000000000",
		mintAddress: null,
		totalValueUsd: 12_000_000,
		pricePerTokenUsd: 12.00,
		metadataUri: "https://ipfs.io/ipfs/QmKraken",
		imageUri: getLogoUrl("kraken.com"),
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalKraken",
		status: "trading",
		metadata: {
			companyType: "Fintech",
			foundedYear: 2011,
			headquarters: "San Francisco, CA, USA",
			employees: 3000,
			valuation: 10_800_000_000,
		},
	},
	// 8. Anthropic (ANTH) - $1.00
	{
		assetId: "RWA-ANTH-001",
		name: "Anthropic",
		symbol: "ANTH",
		description: "AI safety company developing large language models (Claude AI)",
		assetClass: "private_equity",
		assetType: "ai_tech",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0xAnth0000000000000000000000000000000000000",
		mintAddress: null,
		totalValueUsd: 1_000_000,
		pricePerTokenUsd: 1.00,
		metadataUri: "https://ipfs.io/ipfs/QmAnthropic",
		imageUri: getLogoUrl("anthropic.com"),
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalAnthropic",
		status: "trading",
		metadata: {
			companyType: "AI Tech",
			foundedYear: 2021,
			headquarters: "San Francisco, CA, USA",
			employees: 400,
			valuation: 18_000_000_000,
		},
	},
];

async function seedAssets() {
	console.log("🌱 Starting asset seeding...");

	try {
		// Initialize database connection
		if (!AppDataSource.isInitialized) {
			await AppDataSource.initialize();
			console.log("✅ Database connection initialized");
		}

		// Get a default issuer (first user in the database, or create a system user)
		const userRepository = AppDataSource.getRepository(BetterAuthUser);
		let issuer = await userRepository.findOne({
			where: {},
			order: { createdAt: "ASC" },
		});

		if (issuer) {
			console.log(`✅ Using existing issuer: ${issuer.email} (${issuer.id})`);
		} else {
			console.log("⚠️  No users found in database. Please create a user first via Better Auth.");
			console.log("   The seed script requires at least one user to exist as an issuer.");
			throw new Error("No users found in database. Please register a user first.");
		}

		// Get asset repository
		const assetRepository = AppDataSource.getRepository(TokenizedAsset);

		// Check if assets already exist
		const existingCount = await assetRepository.count();
		if (existingCount > 0) {
			console.log(
				`⚠️  Found ${existingCount} existing assets. Use --clear flag to remove them first.`
			);
			console.log("   Skipping seed to avoid duplicates.");
			return;
		}

		// Create assets
		console.log(`\n📦 Creating ${seedAssetsData.length} tokenized assets...`);

		for (const assetData of seedAssetsData) {
			const asset = assetRepository.create({
				...assetData,
				issuerId: issuer.id,
				listedAt: assetData.status === "trading" || assetData.status === "listed" ? new Date() : null,
			});

			const saved = await assetRepository.save(asset);
			console.log(`   ✅ Created: ${saved.name} (${saved.symbol}) - ${saved.assetClass}`);
		}

		console.log(`\n🎉 Successfully seeded ${seedAssetsData.length} tokenized assets!`);
		console.log("\n📊 Summary:");
		console.log(`   - Private Equity (Tech): ${seedAssetsData.filter((a) => a.assetClass === "private_equity").length}`);
		console.log(`   - Fintech: ${seedAssetsData.filter((a) => a.assetType === "fintech").length}`);
		console.log(`   - Aerospace: ${seedAssetsData.filter((a) => a.assetType === "aerospace").length}`);
		console.log(`   - Data Tech: ${seedAssetsData.filter((a) => a.assetType === "data_tech").length}`);
		console.log(`   - Social Media: ${seedAssetsData.filter((a) => a.assetType === "social_media").length}`);
		console.log(`   - AI Tech: ${seedAssetsData.filter((a) => a.assetType === "ai_tech").length}`);
	} catch (error) {
		console.error("❌ Error seeding assets:", error);
		throw error;
	} finally {
		if (AppDataSource.isInitialized) {
			await AppDataSource.destroy();
			console.log("\n✅ Database connection closed");
		}
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedAssets()
		.then(() => {
			console.log("\n✨ Seeding complete!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("\n💥 Seeding failed:", error);
			process.exit(1);
		});
}

export { seedAssets };

