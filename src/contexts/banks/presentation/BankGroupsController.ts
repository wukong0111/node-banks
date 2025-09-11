import { Hono } from "hono";
import { GetBankGroupsUseCase } from "../application/GetBankGroupsUseCase.js";
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

export { bankGroupsController };
