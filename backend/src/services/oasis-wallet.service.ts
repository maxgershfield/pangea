import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface GenerateWalletRequest {
  avatarId: string;
  providerType: 'SolanaOASIS' | 'EthereumOASIS';
  setAsDefault?: boolean;
}

export interface Wallet {
  walletId: string;
  avatarId: string;
  publicKey: string;
  walletAddress: string;
  providerType: string;
  isDefaultWallet: boolean;
  balance?: number;
  createdAt?: string;
}

export interface WalletBalance {
  walletId: string;
  balance: number;
  tokenSymbol?: string;
  providerType: string;
}

export interface SendTokenRequest {
  fromAvatarId: string;
  toAvatarId: string;
  amount: number;
  tokenSymbol: string;
  providerType: string;
  walletId: string;
}

export interface Transaction {
  transactionId: string;
  walletId: string;
  transactionHash: string;
  type: string;
  amount: number;
  status: string;
  timestamp: string;
}

@Injectable()
export class OasisWalletService {
  private readonly logger = new Logger(OasisWalletService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('OASIS_API_URL') || 'https://api.oasisplatform.world';
    this.apiKey = this.configService.get<string>('OASIS_API_KEY') || '';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`OASIS API Error: ${error.message}`, error.response?.data);
        throw new HttpException(
          error.response?.data?.message || 'OASIS Wallet API error',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      },
    );
  }

  /**
   * Generate a new wallet for an avatar
   */
  async generateWallet(avatarId: string, providerType: 'SolanaOASIS' | 'EthereumOASIS', setAsDefault: boolean = true): Promise<Wallet> {
    try {
      this.logger.log(`Generating wallet for avatar ${avatarId}, provider: ${providerType}`);

      const response = await this.axiosInstance.post(
        `/api/wallet/avatar/${avatarId}/generate`,
        {
          providerType,
          setAsDefault,
        },
      );

      const result = response.data?.result || response.data;
      
      return {
        walletId: result.walletId || result.id,
        avatarId: result.avatarId || avatarId,
        publicKey: result.publicKey,
        walletAddress: result.walletAddress || result.address,
        providerType: result.providerType || providerType,
        isDefaultWallet: result.isDefaultWallet ?? setAsDefault,
        balance: result.balance,
        createdAt: result.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to generate wallet: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all wallets for an avatar
   */
  async getWallets(avatarId: string, providerType?: string): Promise<Wallet[]> {
    try {
      let url = `/api/wallet/avatar/${avatarId}/wallets`;
      if (providerType) {
        url += `?providerType=${providerType}`;
      }

      const response = await this.axiosInstance.get(url);
      const wallets = response.data?.result || response.data || [];

      return Array.isArray(wallets)
        ? wallets.map((w: any) => this.mapWalletResponse(w, avatarId))
        : [this.mapWalletResponse(wallets, avatarId)];
    } catch (error) {
      this.logger.error(`Failed to get wallets: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get default wallet for an avatar
   */
  async getDefaultWallet(avatarId: string): Promise<Wallet | null> {
    try {
      const response = await this.axiosInstance.get(
        `/api/wallet/avatar/${avatarId}/default-wallet`,
      );

      const result = response.data?.result || response.data;
      if (!result) {
        return null;
      }

      return this.mapWalletResponse(result, avatarId);
    } catch (error) {
      this.logger.error(`Failed to get default wallet: ${error.message}`, error.stack);
      // Return null if wallet not found (404)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Set default wallet for an avatar
   */
  async setDefaultWallet(avatarId: string, walletId: string): Promise<void> {
    try {
      await this.axiosInstance.post('/api/wallet/set_default_wallet', {
        avatarId,
        walletId,
      });

      this.logger.log(`Set default wallet ${walletId} for avatar ${avatarId}`);
    } catch (error) {
      this.logger.error(`Failed to set default wallet: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get balance for a wallet
   */
  async getBalance(walletId: string, providerType: string): Promise<WalletBalance> {
    try {
      const response = await this.axiosInstance.get(
        `/api/wallet/balance/${walletId}?providerType=${providerType}`,
      );

      const result = response.data?.result || response.data;
      
      return {
        walletId,
        balance: parseFloat(result.balance || result.amount || '0'),
        tokenSymbol: result.tokenSymbol || result.symbol,
        providerType: result.providerType || providerType,
      };
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Refresh balance for a wallet
   */
  async refreshBalance(walletId: string, providerType: string): Promise<WalletBalance> {
    try {
      const response = await this.axiosInstance.post('/api/wallet/refresh_balance', {
        walletId,
        providerType,
      });

      const result = response.data?.result || response.data;
      
      return {
        walletId,
        balance: parseFloat(result.balance || result.amount || '0'),
        tokenSymbol: result.tokenSymbol || result.symbol,
        providerType: result.providerType || providerType,
      };
    } catch (error) {
      this.logger.error(`Failed to refresh balance: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send tokens between avatars
   */
  async sendToken(request: SendTokenRequest): Promise<{ transactionHash: string; success: boolean }> {
    try {
      this.logger.log(`Sending tokens: ${request.amount} ${request.tokenSymbol} from ${request.fromAvatarId} to ${request.toAvatarId}`);

      const response = await this.axiosInstance.post('/api/wallet/send_token', request);

      const result = response.data?.result || response.data;
      
      return {
        transactionHash: result.transactionHash || result.txHash || result.hash,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to send token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get transaction history for a wallet
   */
  async getTransactions(walletId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    try {
      const response = await this.axiosInstance.get(
        `/api/wallet/transactions/${walletId}?limit=${limit}&offset=${offset}`,
      );

      const transactions = response.data?.result || response.data || [];
      
      return Array.isArray(transactions)
        ? transactions.map((tx: any) => this.mapTransactionResponse(tx))
        : [];
    } catch (error) {
      this.logger.error(`Failed to get transactions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get wallet by public key
   */
  async getWalletByPublicKey(publicKey: string): Promise<Wallet | null> {
    try {
      const response = await this.axiosInstance.get(
        `/api/wallet/wallet_by_public_key/${publicKey}`,
      );

      const result = response.data?.result || response.data;
      if (!result) {
        return null;
      }

      return this.mapWalletResponse(result, result.avatarId);
    } catch (error) {
      this.logger.error(`Failed to get wallet by public key: ${error.message}`, error.stack);
      // Return null if wallet not found (404)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Map wallet API response to Wallet interface
   */
  private mapWalletResponse(data: any, avatarId: string): Wallet {
    return {
      walletId: data.walletId || data.id,
      avatarId: data.avatarId || avatarId,
      publicKey: data.publicKey,
      walletAddress: data.walletAddress || data.address || data.publicKey,
      providerType: data.providerType,
      isDefaultWallet: data.isDefaultWallet ?? false,
      balance: data.balance ? parseFloat(data.balance) : undefined,
      createdAt: data.createdAt || data.created_at,
    };
  }

  /**
   * Map transaction API response to Transaction interface
   */
  private mapTransactionResponse(data: any): Transaction {
    return {
      transactionId: data.transactionId || data.id,
      walletId: data.walletId,
      transactionHash: data.transactionHash || data.hash || data.txHash,
      type: data.type || data.transactionType,
      amount: parseFloat(data.amount || '0'),
      status: data.status,
      timestamp: data.timestamp || data.createdAt || data.created_at,
    };
  }
}


