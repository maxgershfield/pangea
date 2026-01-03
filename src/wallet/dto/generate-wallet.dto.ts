import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

export enum WalletProviderType {
	SOLANA = "SolanaOASIS",
	ETHEREUM = "EthereumOASIS",
}

export class GenerateWalletDto {
	@ApiProperty({
		description: "Wallet provider type",
		enum: WalletProviderType,
		example: WalletProviderType.SOLANA,
	})
	@IsEnum(WalletProviderType)
	providerType: WalletProviderType;

	@ApiPropertyOptional({
		description: "Set as default wallet for this blockchain",
		example: true,
		default: true,
	})
	@IsOptional()
	@IsBoolean()
	setAsDefault?: boolean = true;
}
