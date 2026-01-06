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

const BRANDFETCH_CLIENT_ID = process.env.BRANDFETCH_CLIENT_ID || "1ida8ggQZDf64bgCqxt";

// Map of asset IDs to their domains
const assetDomains: Record<string, string> = {
	"RWA-COIN-001": "coinbase.com",
	"RWA-SPCX-001": "spacex.com",
	"RWA-DBKS-001": "databricks.com",
	"RWA-X-001": "x.com",
	"RWA-STRIP-001": "stripe.com",
	"RWA-PLAID-001": "plaid.com",
	"RWA-KRKN-001": "kraken.com",
	"RWA-ANTH-001": "anthropic.com",
};

function getLogoUrl(domain: string): string {
	return `https://cdn.brandfetch.io/${domain}?c=${BRANDFETCH_CLIENT_ID}`;
}

async function updateLogos() {
	console.log("🎨 Updating asset logos with Brandfetch URLs...");
	console.log(`   Using Brandfetch Client ID: ${BRANDFETCH_CLIENT_ID}\n`);

	try {
		// Initialize database connection
		if (!AppDataSource.isInitialized) {
			await AppDataSource.initialize();
			console.log("✅ Database connection initialized\n");
		}

		const assetRepository = AppDataSource.getRepository(TokenizedAsset);

		// Update each asset
		for (const [assetId, domain] of Object.entries(assetDomains)) {
			const asset = await assetRepository.findOne({
				where: { assetId },
			});

			if (asset) {
				const logoUrl = getLogoUrl(domain);
				asset.imageUri = logoUrl;
				await assetRepository.save(asset);
				console.log(`   ✅ Updated ${asset.name} (${assetId})`);
				console.log(`      Logo URL: ${logoUrl}`);
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

