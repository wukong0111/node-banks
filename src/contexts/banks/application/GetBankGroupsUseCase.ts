import type { BankGroupRepository } from "../domain/BankGroupRepository.js";
import type { BankGroup } from "../domain/BankGroup.js";
import { type Result, createSuccess, createFailure } from "../domain/Result.js";
import type { LoggerService } from "../../../shared/application/services/LoggerService.js";

export class GetBankGroupsUseCase {
	constructor(
		private readonly bankGroupRepository: BankGroupRepository,
		private readonly logger: LoggerService,
	) {}

	async execute(): Promise<Result<BankGroup[]>> {
		try {
			const bankGroups = await this.bankGroupRepository.findAll();
			this.logger.info("Bank groups retrieved successfully", {
				count: bankGroups.length,
			});
			return createSuccess(bankGroups);
		} catch (error) {
			this.logger.error("Failed to retrieve bank groups", {
				error: error instanceof Error ? error.message : String(error),
			});
			return createFailure("Internal server error");
		}
	}
}
