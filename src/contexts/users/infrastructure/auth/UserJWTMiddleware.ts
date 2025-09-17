import type { Context, Next } from "hono";
import { jwtVerify } from "jose";
import { getJWTConfig } from "../../../../shared/infrastructure/config/JWTConfig.js";

// Extend Hono's context type to include user auth context
declare module "hono" {
	interface ContextVariableMap {
		userAuthContext: {
			userId: string;
			email: string;
		};
	}
}

export const userJWTMiddleware = () => {
	const config = getJWTConfig();
	const secretKey = new TextEncoder().encode(config.secret);

	return async (c: Context, next: Next) => {
		try {
			// Extract token from Authorization header
			const authHeader = c.req.header("Authorization");
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return c.json(
					{
						success: false,
						error: "Authentication required",
						timestamp: new Date().toISOString(),
					},
					401,
				);
			}

			const token = authHeader.substring(7); // Remove 'Bearer ' prefix

			// Verify and parse the token
			const { payload } = await jwtVerify(token, secretKey, {
				issuer: config.issuer,
				algorithms: [config.algorithm],
			});

			// Validate required claims for user tokens
			if (!payload.userId || !payload.email) {
				throw new Error("Invalid user JWT claims structure");
			}

			// Create user auth context
			const userAuthContext = {
				userId: payload.userId as string,
				email: payload.email as string,
			};

			// Store auth context in Hono's context
			c.set("userAuthContext", userAuthContext);

			await next();
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Authentication failed";

			return c.json(
				{
					success: false,
					error: errorMessage,
					timestamp: new Date().toISOString(),
				},
				401,
			);
		}
	};
};
