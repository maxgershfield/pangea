import "reflect-metadata";
import { config } from "dotenv";
import { AppDataSource } from "../src/config/data-source.js";
import { TokenizedAsset } from "../src/assets/entities/tokenized-asset.entity.js";
import { User } from "../src/users/entities/user.entity.js";

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

const seedAssetsData: SeedAssetData[] = [
	// Real Estate - Commercial
	{
		assetId: "RWA-RE-001",
		name: "Manhattan Office Tower",
		symbol: "MOT",
		description:
			"Premium commercial office building located in Midtown Manhattan. 45-story tower with 500,000 sq ft of leasable space. Fully occupied with long-term tenants including Fortune 500 companies.",
		assetClass: "real_estate",
		assetType: "commercial",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens with 18 decimals
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0x1234567890123456789012345678901234567890",
		mintAddress: null,
		totalValueUsd: 250_000_000,
		pricePerTokenUsd: 0.25,
		metadataUri: "https://ipfs.io/ipfs/QmRealEstate1",
		imageUri: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalDocs1",
		status: "trading",
		metadata: {
			location: "New York, NY, USA",
			squareFeet: 500_000,
			floors: 45,
			yearBuilt: 2015,
			occupancyRate: 0.95,
			annualRevenue: 15_000_000,
			propertyTax: 2_500_000,
			maintenanceCost: 1_200_000,
		},
	},
	// Real Estate - Residential
	{
		assetId: "RWA-RE-002",
		name: "Luxury Apartment Complex - Miami Beach",
		symbol: "MBC",
		description:
			"Modern luxury apartment complex with 200 units, ocean views, and premium amenities. Located in prime Miami Beach location with high rental demand.",
		assetClass: "real_estate",
		assetType: "residential",
		totalSupply: BigInt("500000000000000000"), // 500 million tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0x2345678901234567890123456789012345678901",
		mintAddress: null,
		totalValueUsd: 85_000_000,
		pricePerTokenUsd: 0.17,
		metadataUri: "https://ipfs.io/ipfs/QmRealEstate2",
		imageUri: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalDocs2",
		status: "trading",
		metadata: {
			location: "Miami Beach, FL, USA",
			units: 200,
			yearBuilt: 2020,
			averageRent: 3500,
			occupancyRate: 0.92,
			amenities: ["Pool", "Gym", "Beach Access", "Concierge"],
		},
	},
	// Art - Fine Art
	{
		assetId: "RWA-ART-001",
		name: "Contemporary Art Collection - Banksy Series",
		symbol: "BKSY",
		description:
			"Curated collection of authenticated Banksy artworks. Includes 5 original pieces with verified provenance. Stored in climate-controlled facilities with full insurance coverage.",
		assetClass: "art",
		assetType: "fine_art",
		totalSupply: BigInt("100000000000000000"), // 100 million tokens
		decimals: 18,
		tokenStandard: "ERC-1155",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0x3456789012345678901234567890123456789012",
		mintAddress: null,
		totalValueUsd: 12_500_000,
		pricePerTokenUsd: 0.125,
		metadataUri: "https://ipfs.io/ipfs/QmArtCollection1",
		imageUri: "https://images.unsplash.com/photo-1541961017774-22349e4a1262",
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalDocs3",
		status: "trading",
		metadata: {
			artist: "Banksy",
			pieces: 5,
			appraisalDate: "2024-01-15",
			storageLocation: "Switzerland",
			insuranceValue: 15_000_000,
			provenance: "Verified",
		},
	},
	// Commodities - Precious Metals
	{
		assetId: "RWA-COM-001",
		name: "Gold Bullion Reserve",
		symbol: "GLDR",
		description:
			"Physical gold bullion reserves stored in secure vaults. 10,000 oz of 99.99% pure gold bars. Fully insured and audited quarterly. Each token represents 0.01 oz of gold.",
		assetClass: "commodities",
		assetType: "precious_metals",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens (10,000 oz * 100)
		decimals: 18,
		tokenStandard: "SPL",
		blockchain: "solana",
		network: "mainnet",
		contractAddress: null,
		mintAddress: "So11111111111111111111111111111111111111112",
		totalValueUsd: 20_000_000, // ~$2,000/oz * 10,000 oz
		pricePerTokenUsd: 0.02,
		metadataUri: "https://ipfs.io/ipfs/QmCommodity1",
		imageUri: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalDocs4",
		status: "trading",
		metadata: {
			commodityType: "Gold",
			totalOunces: 10_000,
			purity: "99.99%",
			vaultLocation: "London, UK",
			lastAudit: "2024-12-01",
			spotPrice: 2000,
		},
	},
	// Commodities - Energy
	{
		assetId: "RWA-COM-002",
		name: "Solar Farm Portfolio - California",
		symbol: "SOLR",
		description:
			"Portfolio of 3 solar farms in California generating 50 MW of renewable energy. Long-term power purchase agreements with utilities. Expected annual revenue of $8M.",
		assetClass: "commodities",
		assetType: "energy",
		totalSupply: BigInt("2000000000000000000"), // 2 billion tokens
		decimals: 18,
		tokenStandard: "SPL",
		blockchain: "solana",
		network: "mainnet",
		contractAddress: null,
		mintAddress: "So22222222222222222222222222222222222222223",
		totalValueUsd: 120_000_000,
		pricePerTokenUsd: 0.06,
		metadataUri: "https://ipfs.io/ipfs/QmEnergy1",
		imageUri: "https://images.unsplash.com/photo-1509391366360-2e959784a276",
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalDocs5",
		status: "trading",
		metadata: {
			energyType: "Solar",
			capacityMW: 50,
			location: "California, USA",
			annualGeneration: 100_000_000, // kWh
			annualRevenue: 8_000_000,
			farms: 3,
			ppaTerm: 20, // years
		},
	},
	// Infrastructure
	{
		assetId: "RWA-INF-001",
		name: "Toll Road - Highway 101 Extension",
		symbol: "HWY101",
		description:
			"25-mile toll road extension with 30-year concession. Average daily traffic of 45,000 vehicles. Revenue-sharing agreement with state transportation authority.",
		assetClass: "infrastructure",
		assetType: "transportation",
		totalSupply: BigInt("1500000000000000000"), // 1.5 billion tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0x4567890123456789012345678901234567890123",
		mintAddress: null,
		totalValueUsd: 180_000_000,
		pricePerTokenUsd: 0.12,
		metadataUri: "https://ipfs.io/ipfs/QmInfrastructure1",
		imageUri: "https://images.unsplash.com/photo-1449824913935-9a10bd0e0871",
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalDocs6",
		status: "trading",
		metadata: {
			infrastructureType: "Toll Road",
			length: 25, // miles
			dailyTraffic: 45_000,
			averageToll: 3.5,
			concessionTerm: 30, // years
			annualRevenue: 12_000_000,
		},
	},
	// Private Equity / Business
	{
		assetId: "RWA-PE-001",
		name: "Tech Startup Equity - AI SaaS Platform",
		symbol: "AISAS",
		description:
			"Equity stake in Series B AI SaaS startup. 15% ownership with board representation. Company valued at $150M with strong growth trajectory and enterprise customers.",
		assetClass: "private_equity",
		assetType: "tech",
		totalSupply: BigInt("300000000000000000"), // 300 million tokens
		decimals: 18,
		tokenStandard: "ERC-20",
		blockchain: "ethereum",
		network: "mainnet",
		contractAddress: "0x5678901234567890123456789012345678901234",
		mintAddress: null,
		totalValueUsd: 22_500_000, // 15% of $150M
		pricePerTokenUsd: 0.075,
		metadataUri: "https://ipfs.io/ipfs/QmPrivateEquity1",
		imageUri: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalDocs7",
		status: "listed",
		metadata: {
			companyName: "AI Solutions Inc",
			ownership: 0.15,
			valuation: 150_000_000,
			revenue: 25_000_000,
			growthRate: 0.4, // 40% YoY
			employees: 120,
			fundingRound: "Series B",
		},
	},
	// Agriculture
	{
		assetId: "RWA-AGR-001",
		name: "Organic Farm Portfolio - Midwest",
		symbol: "ORGF",
		description:
			"Portfolio of 5 organic farms totaling 2,500 acres. Producing corn, soybeans, and wheat. Certified organic with long-term supply contracts.",
		assetClass: "agriculture",
		assetType: "farmland",
		totalSupply: BigInt("1000000000000000000"), // 1 billion tokens
		decimals: 18,
		tokenStandard: "SPL",
		blockchain: "solana",
		network: "mainnet",
		contractAddress: null,
		mintAddress: "So33333333333333333333333333333333333333334",
		totalValueUsd: 35_000_000,
		pricePerTokenUsd: 0.035,
		metadataUri: "https://ipfs.io/ipfs/QmAgriculture1",
		imageUri: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
		legalDocumentsUri: "https://ipfs.io/ipfs/QmLegalDocs8",
		status: "trading",
		metadata: {
			acres: 2500,
			farms: 5,
			crops: ["Corn", "Soybeans", "Wheat"],
			certification: "USDA Organic",
			annualYield: 150_000, // bushels
			location: "Iowa, USA",
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
		const userRepository = AppDataSource.getRepository(User);
		let issuer = await userRepository.findOne({
			where: {},
			order: { createdAt: "ASC" },
		});

		if (issuer) {
			console.log(`✅ Using existing issuer: ${issuer.email} (${issuer.id})`);
		} else {
			console.log("⚠️  No users found in database. Creating a system issuer...");
			// Create a system issuer user (you may need to adjust this based on your better-auth setup)
			issuer = userRepository.create({
				email: "system@pangeamarkets.com",
				username: "system",
				role: "admin",
				kycStatus: "approved",
			});
			issuer = await userRepository.save(issuer);
			console.log(`✅ Created system issuer: ${issuer.id}`);
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
		console.log(`   - Real Estate: ${seedAssetsData.filter((a) => a.assetClass === "real_estate").length}`);
		console.log(`   - Art: ${seedAssetsData.filter((a) => a.assetClass === "art").length}`);
		console.log(`   - Commodities: ${seedAssetsData.filter((a) => a.assetClass === "commodities").length}`);
		console.log(`   - Infrastructure: ${seedAssetsData.filter((a) => a.assetClass === "infrastructure").length}`);
		console.log(`   - Private Equity: ${seedAssetsData.filter((a) => a.assetClass === "private_equity").length}`);
		console.log(`   - Agriculture: ${seedAssetsData.filter((a) => a.assetClass === "agriculture").length}`);
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

