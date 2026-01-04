import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

export enum WalletProviderType {
	SOLANA = "SolanaOASIS",
	ETHEREUM = "EthereumOASIS",
}

/**
 * DTO for generating a new wallet
 * 
 * This endpoint integrates with the OASIS API to generate a new blockchain wallet
 * for the authenticated user's OASIS avatar. The wallet generation process:
 * 
 * 1. Ensures an OASIS avatar exists for the user (creates one if needed)
 * 2. Generates a new keypair for the specified blockchain provider
 * 3. Links the private and public keys to the OASIS avatar
 * 4. Returns the wallet ID, address, and provider information
 * 
 * @see https://docs.nestjs.com/openapi/introduction for OpenAPI documentation
 */
export class GenerateWalletDto {
	@ApiProperty({
		description: "Blockchain provider type for the wallet. Determines which blockchain network the wallet will be created on.",
		enum: WalletProviderType,
		enumName: "WalletProviderType",
		example: WalletProviderType.SOLANA,
		examples: {
			solana: {
				value: WalletProviderType.SOLANA,
				description: "Solana blockchain wallet (SOL tokens)",
			},
			ethereum: {
				value: WalletProviderType.ETHEREUM,
				description: "Ethereum blockchain wallet (ETH and ERC-20 tokens)",
			},
		},
	})
	@IsEnum(WalletProviderType)
	providerType: WalletProviderType;

	@ApiPropertyOptional({
		description: "Whether to set this wallet as the default wallet for the specified blockchain provider. If true, this wallet will be used for transactions when no specific wallet is specified.",
		example: true,
		default: true,
		type: Boolean,
	})
	@IsOptional()
	@IsBoolean()
	setAsDefault?: boolean = true;
}
