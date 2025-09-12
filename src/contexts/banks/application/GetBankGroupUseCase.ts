import type { GetBankGroupRequest } from "./dto/GetBankGroupRequest.js";
import type { GetBankGroupResponse } from "./dto/GetBankGroupResponse.js";
import type { BankGroupRepository } from "../domain/BankGroupRepository.js";
import type { LoggerService } from "@shared/application/services/LoggerService.js";
import { validateCreateBankGroupRequest } from "../domain/services/BankRequestValidator.js";
import { type Result, createSuccess, createFailure } from "../domain/Result.js";

export class GetBankGroupUseCase {
	constructor(
		private readonly bankGroupRepository: BankGroupRepository,
		private readonly logger: LoggerService,
	) {}

	async execute(
		request: GetBankGroupRequest,
	): Promise<Result<GetBankGroupResponse>> {
		this.logger.info("Getting bank group", { group_id: request.group_id });

		// Validate request (reuse validation for UUID format)
		const validationResult = validateCreateBankGroupRequest({
			group_id: request.group_id,
			name: "temp", // Temporary name for validation
		});
		if (!validationResult.success) {
			this.logger.warn("Invalid bank group get request", {
				error: validationResult.error,
			});
			return createFailure(validationResult.error);
		}

		try {
			// Find bank group by ID
			const bankGroup = await this.bankGroupRepository.findById(
				request.group_id,
			);

			if (!bankGroup) {
				this.logger.warn("Bank group not found", {
					group_id: request.group_id,
				});
				return createFailure("Bank group not found");
			}

			this.logger.info("Bank group retrieved successfully", {
				group_id: request.group_id,
			});

			const response: GetBankGroupResponse = {
				success: true,
				data: bankGroup,
			};

			return createSuccess(response);
		} catch (error) {
			this.logger.error("Failed to get bank group", {
				error,
				group_id: request.group_id,
			});
			return createFailure("Failed to get bank group");
		}
	}
}
