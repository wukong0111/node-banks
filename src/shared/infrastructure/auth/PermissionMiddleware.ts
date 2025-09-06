import type { Context, Next } from "hono";
import type { Permission } from "../../domain/auth/Permission.js";
import { JWTService } from "./JWTService.js";

export const requirePermission = (requiredPermission: Permission) => {
	const jwtService = JWTService.getInstance();

	return async (c: Context, next: Next) => {
		try {
			// Get auth context from previous JWT middleware
			const authContext = c.get("authContext");
			
			if (!authContext) {
				return c.json({
					success: false,
					error: "Authentication context not found",
					timestamp: new Date().toISOString()
				}, 401);
			}

			// Check if user has required permission
			if (!jwtService.hasPermission(authContext, requiredPermission)) {
				return c.json({
					success: false,
					error: `Insufficient permissions. Required: ${requiredPermission}`,
					timestamp: new Date().toISOString()
				}, 403);
			}

			await next();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Permission check failed";
			
			return c.json({
				success: false,
				error: errorMessage,
				timestamp: new Date().toISOString()
			}, 403);
		}
	};
};

export const requireAnyPermission = (requiredPermissions: Permission[]) => {
	const jwtService = JWTService.getInstance();

	return async (c: Context, next: Next) => {
		try {
			const authContext = c.get("authContext");
			
			if (!authContext) {
				return c.json({
					success: false,
					error: "Authentication context not found",
					timestamp: new Date().toISOString()
				}, 401);
			}

			if (!jwtService.hasAnyPermission(authContext, requiredPermissions)) {
				return c.json({
					success: false,
					error: `Insufficient permissions. Required any of: ${requiredPermissions.join(", ")}`,
					timestamp: new Date().toISOString()
				}, 403);
			}

			await next();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Permission check failed";
			
			return c.json({
				success: false,
				error: errorMessage,
				timestamp: new Date().toISOString()
			}, 403);
		}
	};
};

export const requireAllPermissions = (requiredPermissions: Permission[]) => {
	const jwtService = JWTService.getInstance();

	return async (c: Context, next: Next) => {
		try {
			const authContext = c.get("authContext");
			
			if (!authContext) {
				return c.json({
					success: false,
					error: "Authentication context not found",
					timestamp: new Date().toISOString()
				}, 401);
			}

			if (!jwtService.hasAllPermissions(authContext, requiredPermissions)) {
				return c.json({
					success: false,
					error: `Insufficient permissions. Required all of: ${requiredPermissions.join(", ")}`,
					timestamp: new Date().toISOString()
				}, 403);
			}

			await next();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Permission check failed";
			
			return c.json({
				success: false,
				error: errorMessage,
				timestamp: new Date().toISOString()
			}, 403);
		}
	};
};