import type { CreateBankGroupRequest } from "./dto/CreateBankGroupRequest.js";
import type { CreateBankGroupResponse } from "./dto/CreateBankGroupResponse.js";
import type { BankGroupRepository } from "../domain/BankGroupRepository.js";
import type { LoggerService } from "@shared/application/services/LoggerService.js";
import { validateCreateBankGroupRequest } from "../domain/services/BankRequestValidator.js";
import { type Result, createSuccess, createFailure } from "../domain/Result.js";

export class CreateBankGroupUseCase {
	constructor(
		private readonly bankGroupRepository: BankGroupRepository,
		private readonly logger: LoggerService,
	) {}

	async execute(
		request: CreateBankGroupRequest,
	): Promise<Result<CreateBankGroupResponse>> {
		this.logger.info("Creating bank group", { name: request.name });

		// Validate request
		const validationResult = validateCreateBankGroupRequest(request);
		if (!validationResult.success) {
			this.logger.warn("Invalid bank group creation request", {
				error: validationResult.error,
			});
			return createFailure(validationResult.error);
		}

		// Check if bank group already exists
		const existingGroup = await this.bankGroupRepository.findById(
			request.group_id,
		);
		if (existingGroup) {
			this.logger.warn("Bank group already exists", {
				group_id: request.group_id,
			});
			return createFailure("Bank group with this ID already exists");
		}

		// Create bank group
		const bankGroup = {
			group_id: request.group_id,
			name: request.name,
			description: request.description ?? null,
			logo_url: request.logo_url ?? null,
			website: request.website ?? null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		try {
			await this.bankGroupRepository.create(bankGroup);
			this.logger.info("Bank group created successfully", {
				group_id: request.group_id,
			});

			const response: CreateBankGroupResponse = {
				success: true,
				data: bankGroup,
				message: "Bank group created successfully",
			};

			return createSuccess(response);
		} catch (error) {
			this.logger.error("Failed to create bank group", {
				error,
				group_id: request.group_id,
			});
			return createFailure("Failed to create bank group");
		}
	}
}
