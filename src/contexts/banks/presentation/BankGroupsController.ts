import type { Hono } from "hono";
import { jwtMiddleware } from "../../../shared/infrastructure/auth/JWTMiddleware.js";
import { requirePermission } from "../../../shared/infrastructure/auth/PermissionMiddleware.js";
import { Permission } from "../../../shared/domain/auth/Permission.js";
import * as deps from "./dependencies.js";

export default function registerBankGroupRoutes(app: Hono) {
	app.get(
		"/api/bank-groups",
		jwtMiddleware(),
		requirePermission(Permission.BANKS_READ),
		async (c) => {
			// Execute use case
			const result = await deps.getBankGroupsUseCase.execute();

			// Map result to HTTP response
			if (!result.success) {
				return c.json(
					{
						success: false,
						error: result.error,
						timestamp: new Date().toISOString(),
					},
					400,
				);
			}

			return c.json(
				{
					success: true,
					data: result.data,
				},
				200,
			);
		},
	);

	app.post(
		"/api/bank-groups",
		jwtMiddleware(),
		requirePermission(Permission.BANKS_WRITE),
		async (c) => {
			// Parse and validate request body
			const body = await c.req.json();

			// Execute use case
			const result = await deps.createBankGroupUseCase.execute(body);

			// Map result to HTTP response
			if (!result.success) {
				return c.json(
					{
						success: false,
						error: result.error,
						timestamp: new Date().toISOString(),
					},
					400,
				);
			}

			return c.json(
				{
					success: true,
					data: result.data.data,
					message: result.data.message,
				},
				201,
			);
		},
	);

	app.get(
		"/api/bank-groups/:groupId",
		jwtMiddleware(),
		requirePermission(Permission.BANKS_READ),
		async (c) => {
			// Extract groupId from path parameters
			const groupId = c.req.param("groupId");

			// Execute use case
			const result = await deps.getBankGroupUseCase.execute({
				group_id: groupId,
			});

			// Map result to HTTP response
			if (!result.success) {
				if (result.error === "Bank group not found") {
					return c.json(
						{
							success: false,
							error: result.error,
							timestamp: new Date().toISOString(),
						},
						404,
					);
				}

				return c.json(
					{
						success: false,
						error: result.error,
						timestamp: new Date().toISOString(),
					},
					400,
				);
			}

			return c.json(
				{
					success: true,
					data: result.data.data,
				},
				200,
			);
		},
	);

	app.put(
		"/api/bank-groups/:groupId",
		jwtMiddleware(),
		requirePermission(Permission.BANKS_WRITE),
		async (c) => {
			// Extract groupId from path parameters
			const groupId = c.req.param("groupId");

			// Parse and validate request body
			const body = await c.req.json();

			// Execute use case
			const result = await deps.updateBankGroupUseCase.execute(groupId, body);

			// Map result to HTTP response
			if (!result.success) {
				if (result.error === "Bank group not found") {
					return c.json(
						{
							success: false,
							error: result.error,
							timestamp: new Date().toISOString(),
						},
						404,
					);
				}

				return c.json(
					{
						success: false,
						error: result.error,
						timestamp: new Date().toISOString(),
					},
					400,
				);
			}

			return c.json(
				{
					success: true,
					data: result.data.data,
					message: result.data.message,
				},
				200,
			);
		},
	);
}
