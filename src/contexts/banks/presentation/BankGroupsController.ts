import { Hono } from "hono";
import { GetBankGroupsUseCase } from "../application/GetBankGroupsUseCase.js";
import { CreateBankGroupUseCase } from "../application/CreateBankGroupUseCase.js";
import { PostgresBankGroupRepository } from "../infrastructure/PostgresBankGroupRepository.js";
import { jwtMiddleware } from "../../../shared/infrastructure/auth/JWTMiddleware.js";
import { requirePermission } from "../../../shared/infrastructure/auth/PermissionMiddleware.js";
import { Permission } from "../../../shared/domain/auth/Permission.js";
import { createLogger } from "../../../shared/infrastructure/logging/LoggerFactory.js";

const bankGroupsController = new Hono();

// Initialize dependencies
const logger = createLogger().withContext({ service: "BankGroupsController" });
const bankGroupRepository = new PostgresBankGroupRepository();
const getBankGroupsUseCase = new GetBankGroupsUseCase(
	bankGroupRepository,
	logger,
);
const createBankGroupUseCase = new CreateBankGroupUseCase(
	bankGroupRepository,
	logger,
);

bankGroupsController.get(
	"/api/bank-groups",
	jwtMiddleware(),
	requirePermission(Permission.BANKS_READ),
	async (c) => {
		// Execute use case
		const result = await getBankGroupsUseCase.execute();

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

bankGroupsController.post(
	"/api/bank-groups",
	jwtMiddleware(),
	requirePermission(Permission.BANKS_WRITE),
	async (c) => {
		// Parse and validate request body
		const body = await c.req.json();

		// Execute use case
		const result = await createBankGroupUseCase.execute(body);

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

export { bankGroupsController };
