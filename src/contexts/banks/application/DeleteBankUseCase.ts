import type { BankRepository } from "../domain/BankRepository.js";
import type { DeleteBankRequest } from "./dto/DeleteBankRequest.js";
import type { DeleteBankResponse } from "./dto/DeleteBankResponse.js";
import { validateDeleteBankRequest } from "../domain/services/BankRequestValidator.js";
import { type Result, createSuccess, createFailure } from "../domain/Result.js";

export class DeleteBankUseCase {
	constructor(private readonly bankRepository: BankRepository) {}

	public async execute(
		request: DeleteBankRequest,
	): Promise<Result<DeleteBankResponse>> {
		// Validate request
		const validation = validateDeleteBankRequest(request);
		if (!validation.success) {
			return createFailure(validation.error);
		}

		const validatedRequest = validation.data;

		// Delete bank from repository
		const deleteResult = await this.bankRepository.deleteBank(
			validatedRequest.bankId,
		);
		if (!deleteResult.success) {
			return createFailure(deleteResult.error);
		}

		// Return success response
		const response: DeleteBankResponse = {
			success: true,
			message: "Bank deleted successfully",
			timestamp: new Date().toISOString(),
		};

		return createSuccess(response);
	}
}
