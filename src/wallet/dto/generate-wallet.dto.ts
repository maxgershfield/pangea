import { IsBoolean, IsEnum, IsOptional } from "class-validator";

export enum WalletProviderType {
	SOLANA = "SolanaOASIS",
	ETHEREUM = "EthereumOASIS",
}

export class GenerateWalletDto {
	@IsEnum(WalletProviderType)
	providerType: WalletProviderType;

	@IsOptional()
	@IsBoolean()
	setAsDefault?: boolean = true;
}
