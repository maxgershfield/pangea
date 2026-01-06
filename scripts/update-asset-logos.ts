import "reflect-metadata";
import { config } from "dotenv";
import { AppDataSource } from "../src/config/data-source.js";
import { TokenizedAsset } from "../src/assets/entities/tokenized-asset.entity.js";

// Load environment variables
config();

/**
 * Update asset logos with Brandfetch URLs
 * 
 * Usage:
 *   BRANDFETCH_CLIENT_ID=your-client-id tsx scripts/update-asset-logos.ts
 */

// Note: Using local logo paths instead of Brandfetch due to 400 errors
// Local paths match the frontend /brands/ directory

// Map of asset IDs to their local logo paths (matching frontend /brands/ directory)
const assetLogos: Record<string, string> = {
	"RWA-COIN-001": "/brands/coinbase.png",
	"RWA-SPCX-001": "/brands/spacex.jpeg",
	"RWA-DBKS-001": "/brands/databricks.jpg",
	"RWA-X-001": "/brands/X.png",
	"RWA-STRIP-001": "/brands/stripe.jpeg",
	"RWA-PLAID-001": "/brands/plaid.jpg",
	"RWA-KRKN-001": "/brands/kraken.jpeg",
	"RWA-ANTH-001": "/brands/anthropic.avif",
};

async function updateLogos() {
	console.log("🎨 Updating asset logos with local logo paths...");
	console.log("   Using local /brands/ directory paths (matching frontend)\n");

	try {
		// Initialize database connection
		if (!AppDataSource.isInitialized) {
			await AppDataSource.initialize();
			console.log("✅ Database connection initialized\n");
		}

		const assetRepository = AppDataSource.getRepository(TokenizedAsset);

		// Update each asset
		for (const [assetId, logoPath] of Object.entries(assetLogos)) {
			const asset = await assetRepository.findOne({
				where: { assetId },
			});

			if (asset) {
				asset.imageUri = logoPath;
				await assetRepository.save(asset);
				console.log(`   ✅ Updated ${asset.name} (${assetId})`);
				console.log(`      Logo path: ${logoPath}`);
			} else {
				console.log(`   ⚠️  Asset not found: ${assetId}`);
			}
		}

		console.log("\n🎉 Successfully updated all asset logos!");
	} catch (error) {
		console.error("❌ Error updating logos:", error);
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
	updateLogos()
		.then(() => {
			console.log("\n✨ Update complete!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("\n💥 Update failed:", error);
			process.exit(1);
		});
}

export { updateLogos };

