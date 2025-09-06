import type { BankRepository } from "../domain/BankRepository.js";
import type { GetBankDetailsRequest } from "./dto/GetBankDetailsRequest.js";
import type { GetBankDetailsResponse } from "./dto/GetBankDetailsResponse.js";
import type { BankWithEnvironment } from "../domain/Bank.js";
import type { Result } from "../domain/Result.js";
import { createSuccess, createFailure } from "../domain/Result.js";
import type { LoggerService } from '../../../shared/application/services/LoggerService.js';

export class GetBankDetailsUseCase {
	constructor(
		private readonly bankRepository: BankRepository,
		private readonly logger: LoggerService
	) {}

	async execute(request: GetBankDetailsRequest): Promise<Result<GetBankDetailsResponse>> {
		this.logger.debug('Getting bank details', { bankId: request.bankId, env: request.env });
		
		try {
			const bankWithEnvironments = await this.bankRepository.findById(request.bankId);
			
			if (!bankWithEnvironments) {
				this.logger.warn('Bank not found', { bankId: request.bankId });
				return createFailure("Bank not found");
			}

			// If environment is specified, return only that environment config
			if (request.env) {
				const environmentConfig = bankWithEnvironments.environment_configs[request.env];
				
				if (!environmentConfig) {
					this.logger.warn('Environment not found for bank', { 
						bankId: request.bankId, 
						env: request.env,
						availableEnvironments: Object.keys(bankWithEnvironments.environment_configs)
					});
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

				this.logger.info('Bank details retrieved for specific environment', {
					bankId: request.bankId,
					env: request.env
				});

				return createSuccess(response);
			}

			// Return all environment configurations
			const response: GetBankDetailsResponse = {
				success: true,
				data: bankWithEnvironments
			};

			this.logger.info('Bank details retrieved with all environments', {
				bankId: request.bankId,
				environmentCount: Object.keys(bankWithEnvironments.environment_configs).length
			});

			return createSuccess(response);

		} catch (error) {
			this.logger.error('Failed to get bank details', {
				bankId: request.bankId,
				env: request.env,
				error: error instanceof Error ? error.message : String(error)
			});
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			return createFailure(`Failed to get bank details: ${errorMessage}`);
		}
	}
}