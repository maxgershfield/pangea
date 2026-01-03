import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { type AxiosInstance } from "axios";
import { makeNativeHttpRequest } from "./oasis-auth-helper.js";

/**
 * OASIS Avatar API response structure
 * OASIS API returns: OASISHttpResponseMessage<T> which contains:
 * { Result: OASISResult<T> } where T is AvatarResponseDto
 * OASISResult<T> contains: { Result: T, IsError: boolean, Message: string, ... }
 */
interface OASISAvatarResponse {
	Result?: {
		Result?: {
			Id?: string;
			AvatarId?: string;
			Username?: string;
			Email?: string;
			FirstName?: string;
			LastName?: string;
			FullName?: string;
			IsActive?: boolean;
			IsVerified?: boolean;
			CreatedDate?: string;
			ModifiedDate?: string;
		};
		IsError?: boolean;
		isError?: boolean;
		Message?: string;
		message?: string;
	};
	result?: {
		result?: {
			id?: string;
			avatarId?: string;
			username?: string;
			email?: string;
			firstName?: string;
			lastName?: string;
		};
		isError?: boolean;
		message?: string;
	};
	// Direct properties (fallback)
	jwtToken?: string;
	avatarId?: string;
	id?: string;
	username?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	isError?: boolean;
	message?: string;
}

/**
 * OASIS Avatar object extracted from response
 */
export interface OASISAvatar {
	avatarId: string;
	id: string;
	username: string;
	email: string;
	firstName?: string;
	lastName?: string;
	jwtToken?: string; // OASIS JWT token (we won't use this, but store for reference)
}

/**
 * Service for interacting with OASIS Avatar API
 * Based on Shipex Pro pattern
 */
@Injectable()
export class OasisAuthService {
	private readonly logger = new Logger(OasisAuthService.name);
	private readonly axiosInstance: AxiosInstance;
	private readonly baseUrl: string;

	constructor(private readonly configService: ConfigService) {
		this.baseUrl = this.configService.get<string>("OASIS_API_URL") || "https://api.oasisweb4.com";

		this.axiosInstance = axios.create({
			baseURL: this.baseUrl,
			timeout: 300_000, // Increased timeout to 300 seconds (5 minutes) for large OASIS API responses
			maxContentLength: Number.POSITIVE_INFINITY, // Allow unlimited content length
			maxBodyLength: Number.POSITIVE_INFINITY, // Allow unlimited body length
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});
	}

	/**
	 * Register a new user with OASIS Avatar API
	 */
	async register(data: {
		email: string;
		password: string;
		username: string;
		firstName?: string;
		lastName?: string;
	}): Promise<OASISAvatar> {
		try {
			this.logger.log(`Registering new avatar: ${data.username}`);
			this.logger.log(`OASIS API Base URL: ${this.baseUrl}`);

			// Use native HTTP module to avoid axios stream abort issues with large responses
			// OASIS API expects: Title, FirstName, LastName, Email, Username, Password, ConfirmPassword, AvatarType, AcceptTerms
			const requestData = {
				title: "", // Optional
				firstName: data.firstName || "",
				lastName: data.lastName || "",
				email: data.email,
				username: data.username,
				password: data.password,
				confirmPassword: data.password, // OASIS API requires confirmPassword to match password
				avatarType: "User", // Required, must be a valid AvatarType enum value
				acceptTerms: true, // Required, must be true
			};

			const fullUrl = `${this.baseUrl}/api/avatar/register`;
			this.logger.log(`Making request to: ${fullUrl}`);
			const response = await makeNativeHttpRequest(fullUrl, "POST", requestData);
			this.logger.log(
				`Response received: status ${response.statusCode}, data length: ${response.data.length}`
			);

			// Parse the response
			let responseData: any;
			try {
				responseData = JSON.parse(response.data);
			} catch (e) {
				this.logger.error(`Failed to parse OASIS response as JSON: ${e.message}`);
				this.logger.error(`Response data length: ${response.data?.length || 0}`);
				this.logger.error(`Response status: ${response.statusCode}`);
				throw new Error("Invalid response format from OASIS API");
			}

			this.logger.debug(
				`OASIS registration response received (size: ${JSON.stringify(responseData).length} chars)`
			);

			// Check if response indicates an error
			// OASIS API returns: { Result: { IsError: true/false, Message: "...", Result: {...} } }
			const result = responseData?.Result || responseData?.result;
			if (result?.IsError === true || result?.isError === true) {
				const errorMessage = result.Message || result.message || "Registration failed";
				this.logger.warn(`OASIS registration returned error: ${errorMessage}`);
				// If it's just a verification warning but avatar was created, try to extract avatar anyway
				if (errorMessage.includes("verification") || errorMessage.includes("email")) {
					this.logger.warn("Email verification warning - attempting to extract avatar anyway");
					try {
						return this.extractAvatarFromResponse(responseData);
					} catch (_extractError) {
						throw new Error(`Registration completed but avatar extraction failed: ${errorMessage}`);
					}
				}
				throw new Error(errorMessage);
			}

			return this.extractAvatarFromResponse(responseData);
		} catch (error: any) {
			this.logger.error(`OASIS registration failed: ${error.message}`);
			this.logger.error(`Error stack: ${error.stack}`);
			if (error.response?.data) {
				this.logger.error(
					`OASIS API error response: ${JSON.stringify(error.response.data, null, 2)}`
				);
				throw new Error(
					error.response.data.message ||
						error.response.data.Message ||
						JSON.stringify(error.response.data) ||
						"Registration failed"
				);
			}
			throw new Error(`Failed to register with OASIS API: ${error.message}`);
		}
	}

	/**
	 * Authenticate user with OASIS Avatar API
	 */
	async login(email: string, password: string): Promise<OASISAvatar> {
		try {
			this.logger.log(`Authenticating avatar: ${email}`);

			// Use native HTTP module to avoid axios stream abort issues with large responses
			// OASIS API expects: { Username: string, Password: string }
			// Username can be email or username
			const response = await makeNativeHttpRequest(
				`${this.baseUrl}/api/avatar/authenticate`,
				"POST",
				{
					username: email, // OASIS accepts email as username
					password,
				}
			);

			// Parse the response
			let responseData: any;
			try {
				responseData = JSON.parse(response.data);
			} catch (e) {
				this.logger.error(`Failed to parse OASIS response as JSON: ${e.message}`);
				this.logger.error(`Response data length: ${response.data?.length || 0}`);
				this.logger.error(`Response status: ${response.statusCode}`);
				throw new Error("Invalid response format from OASIS API");
			}

			// Check if response indicates an error
			// OASIS API returns: { Result: { IsError: true/false, Message: "...", Result: {...} } }
			const result = responseData?.Result || responseData?.result;
			if (result?.IsError === true || result?.isError === true) {
				const errorMessage = result.Message || result.message || "Authentication failed";
				this.logger.warn(`OASIS authentication returned error: ${errorMessage}`);
				// If it's just a verification warning but authentication succeeded, try to extract avatar anyway
				if (errorMessage.includes("verification") || errorMessage.includes("email")) {
					this.logger.warn("Email verification warning - attempting to extract avatar anyway");
					try {
						return this.extractAvatarFromResponse(responseData);
					} catch (_extractError) {
						throw new Error(
							`Authentication completed but avatar extraction failed: ${errorMessage}`
						);
					}
				}
				throw new Error(errorMessage);
			}

			return this.extractAvatarFromResponse(responseData);
		} catch (error: any) {
			this.logger.error(`OASIS authentication failed: ${error.message}`);
			if (error.response?.data) {
				throw new Error(
					error.response.data.message || error.response.data.Message || "Authentication failed"
				);
			}
			throw new Error("Invalid email or password");
		}
	}

	/**
	 * Get user profile from OASIS Avatar API
	 */
	async getUserProfile(avatarId: string): Promise<OASISAvatar> {
		try {
			this.logger.log(`Fetching avatar profile: ${avatarId}`);

			const response = await this.axiosInstance.get(`/api/avatar/${avatarId}`, {
				responseType: "text",
				maxContentLength: Number.POSITIVE_INFINITY,
				maxBodyLength: Number.POSITIVE_INFINITY,
			});

			const responseData =
				typeof response.data === "string" ? JSON.parse(response.data) : response.data;
			return this.extractAvatarFromResponse(responseData);
		} catch (error: any) {
			this.logger.error(`Failed to fetch avatar profile: ${error.message}`);
			throw new Error("Failed to fetch user profile from OASIS");
		}
	}

	/**
	 * Update user profile in OASIS Avatar API
	 */
	async updateUserProfile(
		avatarId: string,
		data: {
			firstName?: string;
			lastName?: string;
			email?: string;
		}
	): Promise<OASISAvatar> {
		try {
			this.logger.log(`Updating avatar profile: ${avatarId}`);

			const response = await this.axiosInstance.put(`/api/avatar/${avatarId}`, data, {
				responseType: "text",
				maxContentLength: Number.POSITIVE_INFINITY,
				maxBodyLength: Number.POSITIVE_INFINITY,
			});

			const responseData =
				typeof response.data === "string" ? JSON.parse(response.data) : response.data;
			return this.extractAvatarFromResponse(responseData);
		} catch (error: any) {
			this.logger.error(`Failed to update avatar profile: ${error.message}`);
			throw new Error("Failed to update user profile in OASIS");
		}
	}

	/**
	 * Request password reset
	 */
	async forgotPassword(email: string): Promise<void> {
		try {
			this.logger.log(`Requesting password reset for: ${email}`);

			await this.axiosInstance.post("/api/avatar/forgot-password", {
				email,
			});
		} catch (error: any) {
			this.logger.error(`Password reset request failed: ${error.message}`);
			// Don't throw error - don't reveal if email exists
		}
	}

	/**
	 * Reset password
	 */
	async resetPassword(token: string, newPassword: string): Promise<void> {
		try {
			this.logger.log("Resetting password");

			await this.axiosInstance.post("/api/avatar/reset-password", {
				token,
				newPassword,
			});
		} catch (error: any) {
			this.logger.error(`Password reset failed: ${error.message}`);
			throw new Error("Failed to reset password");
		}
	}

	/**
	 * Refresh JWT token (if OASIS supports it)
	 */
	async refreshToken(refreshToken: string): Promise<string> {
		try {
			const response = await this.axiosInstance.post<OASISAvatarResponse>(
				"/api/avatar/refresh-token",
				{
					refreshToken,
				}
			);

			const avatar = this.extractAvatarFromResponse(response.data);
			if (!avatar.jwtToken) {
				throw new Error("No token received from refresh");
			}
			return avatar.jwtToken;
		} catch (error: any) {
			this.logger.error(`Token refresh failed: ${error.message}`);
			throw new Error("Failed to refresh token");
		}
	}

	/**
	 * Extract avatar object from OASIS API response
	 * Handles nested response structures from OASIS API
	 * Response structure: { Result: { Result: { ...AvatarResponseDto... } } }
	 * or: { result: { result: { ...AvatarResponseDto... } } }
	 */
	private extractAvatarFromResponse(data: OASISAvatarResponse): OASISAvatar {
		try {
			this.logger.debug("Extracting avatar from response structure");

			// OASIS API response structure: OASISHttpResponseMessage<AvatarResponseDto>
			// Which contains: { Result: OASISResult<AvatarResponseDto> }
			// Which contains: { Result: AvatarResponseDto }
			// AvatarResponseDto has: Id, AvatarId, Username, Email, FirstName, LastName, etc.

			// Try to find the avatar data in various nested structures
			let avatar: any = null;
			const dataAny = data as any;

			// Check for Result.Result.Result (OASISHttpResponseMessage -> OASISResult -> AvatarResponseDto)
			if (dataAny.Result?.Result?.Result) {
				avatar = dataAny.Result.Result.Result;
			}
			// Check for Result.Result (OASISResult -> AvatarResponseDto)
			else if (dataAny.Result?.Result) {
				avatar = dataAny.Result.Result;
			}
			// Check for result.result (lowercase)
			else if (data.result?.result) {
				avatar = data.result.result;
			}
			// Check for Result at top level
			else if (dataAny.Result) {
				avatar = dataAny.Result;
			}
			// Check for result at top level
			else if (data.result) {
				avatar = data.result;
			}
			// Fallback to data itself
			else {
				avatar = data;
			}

			// Extract avatar ID - AvatarResponseDto has both Id and AvatarId
			const avatarId =
				avatar?.AvatarId || // AvatarResponseDto.AvatarId (Guid)
				avatar?.avatarId || // lowercase variant
				avatar?.Id || // AvatarResponseDto.Id (Guid)
				avatar?.id; // lowercase variant

			if (!avatarId) {
				this.logger.error("Invalid response structure - missing avatarId");
				this.logger.error("Full response:", JSON.stringify(data, null, 2));
				this.logger.error("Extracted avatar object:", JSON.stringify(avatar, null, 2));
				throw new Error("Invalid response structure from OASIS API: missing avatarId or Id");
			}

			// Extract other fields from AvatarResponseDto
			const extracted: OASISAvatar = {
				avatarId: avatarId.toString(),
				id: avatarId.toString(),
				username: avatar?.Username || avatar?.username || "",
				email: avatar?.Email || avatar?.email || "",
				firstName: avatar?.FirstName || avatar?.firstName,
				lastName: avatar?.LastName || avatar?.lastName,
				jwtToken: avatar?.JwtToken || avatar?.jwtToken,
			};

			// Validate required fields
			if (!extracted.email) {
				this.logger.error("Missing email in extracted avatar:", JSON.stringify(extracted, null, 2));
				throw new Error("Invalid response structure from OASIS API: missing email");
			}

			this.logger.debug(`Extracted avatar: ${JSON.stringify(extracted, null, 2)}`);
			return extracted;
		} catch (error: any) {
			this.logger.error(`Failed to extract avatar from response: ${error.message}`);
			this.logger.error(`Response data: ${JSON.stringify(data, null, 2)}`);
			throw error;
		}
	}
}
