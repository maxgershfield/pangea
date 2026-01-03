import * as http from "node:http";
import * as https from "node:https";
import { URL } from "node:url";

/**
 * Helper function to make HTTP requests using Node's native http/https modules
 * This bypasses axios stream issues with large responses
 */
export async function makeNativeHttpRequest(
	url: string,
	method: string,
	data?: any,
	headers: Record<string, string> = {}
): Promise<{ statusCode: number; data: string; headers: http.IncomingHttpHeaders }> {
	return new Promise((resolve, reject) => {
		const urlObj = new URL(url);
		const isHttps = urlObj.protocol === "https:";
		const client = isHttps ? https : http;

		const postData = data ? JSON.stringify(data) : "";

		// Handle port correctly - if port is in URL, use it; otherwise use default
		let port: number | undefined;
		if (urlObj.port) {
			port = Number.parseInt(urlObj.port, 10);
		} else {
			port = isHttps ? 443 : 80;
		}

		const options: http.RequestOptions = {
			hostname: urlObj.hostname,
			port,
			path: urlObj.pathname + urlObj.search,
			method,
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(postData),
				...headers,
			},
			timeout: 300_000, // 5 minutes timeout
		};

		const req = client.request(options, (res) => {
			let responseData = "";

			// Handle data chunks
			res.on("data", (chunk) => {
				responseData += chunk.toString();
			});

			// Handle end of response
			res.on("end", () => {
				resolve({
					statusCode: res.statusCode || 200,
					data: responseData,
					headers: res.headers,
				});
			});
		});

		// Handle errors
		req.on("error", (error: any) => {
			const errorMsg = `Request to ${url} failed: ${error.message || error}`;
			reject(new Error(errorMsg));
		});

		// Handle timeout
		req.on("timeout", () => {
			req.destroy();
			reject(new Error("Request timeout"));
		});

		// Write request data
		if (postData) {
			req.write(postData);
		}

		req.end();
	});
}
