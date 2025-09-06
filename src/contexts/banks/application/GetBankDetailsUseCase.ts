import type { BankRepository } from "../domain/BankRepository.js";
import type { GetBankDetailsRequest } from "./dto/GetBankDetailsRequest.js";
import type { GetBankDetailsResponse } from "./dto/GetBankDetailsResponse.js";
import type { BankWithEnvironment } from "../domain/Bank.js";
import type { Result } from "../domain/Result.js";
import { createSuccess, createFailure } from "../domain/Result.js";

export class GetBankDetailsUseCase {
	constructor(private readonly bankRepository: BankRepository) {}

	async execute(request: GetBankDetailsRequest): Promise<Result<GetBankDetailsResponse>> {
		try {
			const bankWithEnvironments = await this.bankRepository.findById(request.bankId);
			
			if (!bankWithEnvironments) {
				return createFailure("Bank not found");
			}

			// If environment is specified, return only that environment config
			if (request.env) {
				const environmentConfig = bankWithEnvironments.environment_configs[request.env];
				
				if (!environmentConfig) {
					return createFailure(`Environment '${request.env}' not found for bank '${request.bankId}'`);
				}

				// Create BankWithEnvironment by removing environment_configs and adding environment_config
				const { environment_configs: _environment_configs, ...bankData } = bankWithEnvironments;
				const bankWithEnvironment: BankWithEnvironment = {
					...bankData,
					environment_config: environmentConfig
				};

				const response: GetBankDetailsResponse = {
					success: true,
					data: bankWithEnvironment
				};

				return createSuccess(response);
			}

			// Return all environment configurations
			const response: GetBankDetailsResponse = {
				success: true,
				data: bankWithEnvironments
			};

			return createSuccess(response);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			return createFailure(`Failed to get bank details: ${errorMessage}`);
		}
	}
}