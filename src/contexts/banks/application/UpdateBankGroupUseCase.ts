import type { UpdateBankGroupRequest } from "./dto/UpdateBankGroupRequest.js";
import type { UpdateBankGroupResponse } from "./dto/UpdateBankGroupResponse.js";
import type { BankGroupRepository } from "../domain/BankGroupRepository.js";
import type { LoggerService } from "@shared/application/services/LoggerService.js";
import { validateUpdateBankGroupRequest } from "../domain/services/BankRequestValidator.js";
import { type Result, createSuccess, createFailure } from "../domain/Result.js";

export class UpdateBankGroupUseCase {
	constructor(
		private readonly bankGroupRepository: BankGroupRepository,
		private readonly logger: LoggerService,
	) {}

	async execute(
		groupId: string,
		request: UpdateBankGroupRequest,
	): Promise<Result<UpdateBankGroupResponse>> {
		this.logger.info("Updating bank group", { groupId });

		// Validate request
		const validationResult = validateUpdateBankGroupRequest(request);
		if (!validationResult.success) {
			this.logger.warn("Invalid bank group update request", {
				error: validationResult.error,
			});
			return createFailure(validationResult.error);
		}

		// Check if bank group exists
		const existingGroup = await this.bankGroupRepository.findById(groupId);
		if (!existingGroup) {
			this.logger.warn("Bank group not found", {
				groupId,
			});
			return createFailure("Bank group not found");
		}

		// Build updates object
		const updates: Partial<{
			name: string;
			description: string | null;
			logo_url: string | null;
			website: string | null;
		}> = {};
		if (request.name !== undefined) updates.name = request.name;
		if (request.description !== undefined)
			updates.description = request.description;
		if (request.logo_url !== undefined) updates.logo_url = request.logo_url;
		if (request.website !== undefined) updates.website = request.website;

		try {
			const updatedBankGroup = await this.bankGroupRepository.update(
				groupId,
				updates,
			);
			this.logger.info("Bank group updated successfully", {
				groupId,
			});

			const response: UpdateBankGroupResponse = {
				success: true,
				data: updatedBankGroup,
				message: "Bank group updated successfully",
			};

			return createSuccess(response);
		} catch (error) {
			this.logger.error("Failed to update bank group", {
				error,
				groupId,
			});
			return createFailure("Failed to update bank group");
		}
	}
}
