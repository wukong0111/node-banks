import { Hono } from "hono";
import { GetBanksUseCase } from "../application/GetBanksUseCase.js";
import { GetBankDetailsUseCase } from "../application/GetBankDetailsUseCase.js";
import { UpdateBankUseCase } from "../application/UpdateBankUseCase.js";
import { CreateBankUseCase } from "../application/CreateBankUseCase.js";
import { PostgresBankRepository } from "../infrastructure/PostgresBankRepository.js";
import type { GetBanksRequest } from "../application/dto/GetBanksRequest.js";
import type { GetBankDetailsRequest } from "../application/dto/GetBankDetailsRequest.js";
import type { UpdateBankRequestWithId } from "../application/dto/UpdateBankRequest.js";
import type { CreateBankRequest } from "../application/dto/CreateBankRequest.js";
import type { Environment } from "../domain/Bank.js";
import { jwtMiddleware } from "../../../shared/infrastructure/auth/JWTMiddleware.js";
import { requirePermission } from "../../../shared/infrastructure/auth/PermissionMiddleware.js";
import { Permission } from "../../../shared/domain/auth/Permission.js";
import { createLogger } from "../../../shared/infrastructure/logging/LoggerFactory.js";

const banksController = new Hono();

// Initialize dependencies
const logger = createLogger().withContext({ service: "BanksController" });
const bankRepository = new PostgresBankRepository();
const getBanksUseCase = new GetBanksUseCase(bankRepository, logger);
const getBankDetailsUseCase = new GetBankDetailsUseCase(bankRepository, logger);
const updateBankUseCase = new UpdateBankUseCase(bankRepository, logger);
const createBankUseCase = new CreateBankUseCase(bankRepository, logger);

banksController.get(
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
		const result = await getBanksUseCase.execute(request);

		// Map result to HTTP response
		if (!result.success) {
			return c.json(result, 400);
		}

		return c.json(result.data, 200);
	},
);

banksController.post(
	"/api/banks",
	jwtMiddleware(),
	requirePermission(Permission.BANKS_WRITE),
	async (c) => {
		try {
			// Extract request body
			const requestBody = await c.req.json();

			const request: CreateBankRequest = requestBody;

			// Execute use case
			const result = await createBankUseCase.execute(request);

			// Map result to HTTP response
			if (!result.success) {
				const statusCode = result.error.includes("already exists") ? 409 : 400;
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
			logger.error("Error creating bank", {
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

banksController.get(
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
		const result = await getBankDetailsUseCase.execute(request);

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

banksController.put(
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
			const result = await updateBankUseCase.execute(request);

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
			logger.error("Error updating bank", {
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

export { banksController };
