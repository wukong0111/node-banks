import type { Hono } from "hono";
import type { GetBanksRequest } from "../application/dto/GetBanksRequest.js";
import type { GetBankDetailsRequest } from "../application/dto/GetBankDetailsRequest.js";
import type { UpdateBankRequestWithId } from "../application/dto/UpdateBankRequest.js";
import type { CreateBankRequest } from "../application/dto/CreateBankRequest.js";
import type { DeleteBankRequest } from "../application/dto/DeleteBankRequest.js";
import type { Environment } from "../domain/Bank.js";
import { jwtMiddleware } from "../../../shared/infrastructure/auth/JWTMiddleware.js";
import { requirePermission } from "../../../shared/infrastructure/auth/PermissionMiddleware.js";
import { Permission } from "../../../shared/domain/auth/Permission.js";
import * as deps from "./dependencies.js";

export default function registerBankRoutes(app: Hono) {
	app.get(
		"/api/banks",
		jwtMiddleware(),
		requirePermission(Permission.BANKS_READ),
		async (c) => {
			// Extract query parameters
			const request: GetBanksRequest = {
				env: c.req.query("env"),
				name: c.req.query("name"),
				api: c.req.query("api"),
				country: c.req.query("country"),
				page: c.req.query("page"),
				limit: c.req.query("limit"),
			};

			// Execute use case
			const result = await deps.getBanksUseCase.execute(request);

			// Map result to HTTP response
			if (!result.success) {
				return c.json(result, 400);
			}

			return c.json(result.data, 200);
		},
	);

	app.post(
		"/api/banks",
		jwtMiddleware(),
		requirePermission(Permission.BANKS_WRITE),
		async (c) => {
			try {
				// Extract request body
				const requestBody = await c.req.json();

				const request: CreateBankRequest = requestBody;

				// Execute use case
				const result = await deps.createBankUseCase.execute(request);

				// Map result to HTTP response
				if (!result.success) {
					const statusCode = result.error.includes("already exists")
						? 409
						: 400;
					return c.json(
						{
							success: false,
							error: result.error,
							timestamp: new Date().toISOString(),
						},
						statusCode,
					);
				}

				return c.json(result.data, 201);
			} catch (error) {
				deps.logger.error("Error creating bank", {
					error: error instanceof Error ? error.message : String(error),
				});
				return c.json(
					{
						success: false,
						error: "Internal server error",
						timestamp: new Date().toISOString(),
					},
					500,
				);
			}
		},
	);

	app.get(
		"/api/banks/:bankId/details",
		jwtMiddleware(),
		requirePermission(Permission.BANKS_READ),
		async (c) => {
			// Extract path and query parameters
			const bankId = c.req.param("bankId");
			const env = c.req.query("env") as Environment | undefined;

			const request: GetBankDetailsRequest = {
				bankId,
				env,
			};

			// Execute use case
			const result = await deps.getBankDetailsUseCase.execute(request);

			// Map result to HTTP response
			if (!result.success) {
				const statusCode = result.error.includes("not found") ? 404 : 400;
				return c.json(
					{
						success: false,
						error: result.error,
						timestamp: new Date().toISOString(),
					},
					statusCode,
				);
			}

			return c.json(result.data, 200);
		},
	);

	app.put(
		"/api/banks/:bankId",
		jwtMiddleware(),
		requirePermission(Permission.BANKS_WRITE),
		async (c) => {
			try {
				// Extract path parameter and request body
				const bankId = c.req.param("bankId");
				const requestBody = await c.req.json();

				const request: UpdateBankRequestWithId = {
					bankId,
					request: requestBody,
				};

				// Execute use case
				const result = await deps.updateBankUseCase.execute(request);

				// Map result to HTTP response
				if (!result.success) {
					const statusCode = result.error.includes("not found") ? 404 : 400;
					return c.json(
						{
							success: false,
							error: result.error,
							timestamp: new Date().toISOString(),
						},
						statusCode,
					);
				}

				return c.json(result.data, 200);
			} catch (error) {
				deps.logger.error("Error updating bank", {
					error: error instanceof Error ? error.message : String(error),
				});
				return c.json(
					{
						success: false,
						error: "Internal server error",
						timestamp: new Date().toISOString(),
					},
					500,
				);
			}
		},
	);

	app.delete(
		"/api/banks/:bankId",
		jwtMiddleware(),
		requirePermission(Permission.BANKS_WRITE),
		async (c) => {
			try {
				// Extract path parameter
				const bankId = c.req.param("bankId");

				const request: DeleteBankRequest = {
					bankId,
				};

				// Execute use case
				const result = await deps.deleteBankUseCase.execute(request);

				// Map result to HTTP response
				if (!result.success) {
					const statusCode = result.error.includes("not found") ? 404 : 400;
					return c.json(
						{
							success: false,
							error: result.error,
							timestamp: new Date().toISOString(),
						},
						statusCode,
					);
				}

				return c.json(result.data, 200);
			} catch (error) {
				deps.logger.error("Error deleting bank", {
					error: error instanceof Error ? error.message : String(error),
				});
				return c.json(
					{
						success: false,
						error: "Internal server error",
						timestamp: new Date().toISOString(),
					},
					500,
				);
			}
		},
	);
}
