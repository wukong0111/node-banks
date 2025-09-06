import type { Context, Next } from "hono";
import { JWTService } from "./JWTService.js";

// Extend Hono's context type to include our auth context
declare module "hono" {
	interface ContextVariableMap {
		authContext: import("../../domain/auth/JWTClaims.js").AuthContext;
	}
}

export const jwtMiddleware = () => {
	const jwtService = JWTService.getInstance();

	return async (c: Context, next: Next) => {
		try {
			// Extract token from Authorization header
			const authHeader = c.req.header("Authorization");
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return c.json({
					success: false,
					error: "Authentication required",
					timestamp: new Date().toISOString()
				}, 401);
			}

			const token = authHeader.substring(7); // Remove 'Bearer ' prefix

			// Verify and parse the token
			const claims = await jwtService.verifyToken(token);
			
			// Create auth context
			const authContext = jwtService.createAuthContext(claims);
			
			// Store auth context in Hono's context
			c.set("authContext", authContext);

			await next();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Authentication failed";
			
			return c.json({
				success: false,
				error: errorMessage,
				timestamp: new Date().toISOString()
			}, 401);
		}
	};
};