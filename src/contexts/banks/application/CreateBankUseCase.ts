import type { BankRepository } from "../domain/BankRepository.js";
import type { CreateBankRequest } from "./dto/CreateBankRequest.js";
import type { CreateBankResponse } from "./dto/CreateBankResponse.js";
import type {
	BankWithEnvironments,
	BankEnvironmentConfig,
	BankEnvironmentConfigRequest,
	Environment,
} from "../domain/Bank.js";
import type { Result } from "../domain/Result.js";
import { createSuccess, createFailure } from "../domain/Result.js";
import { validateCreateBankRequest } from "../domain/services/BankRequestValidator.js";
import type { LoggerService } from "../../../shared/application/services/LoggerService.js";

export class CreateBankUseCase {
	constructor(
		private readonly bankRepository: BankRepository,
		private readonly logger: LoggerService,
	) {}

	async execute(
		request: CreateBankRequest,
	): Promise<Result<CreateBankResponse>> {
		this.logger.debug("Creating bank", { bankId: request.bank_id });

		try {
			// Validate request
			const validationResult = validateCreateBankRequest(request);
			if (!validationResult.success) {
				this.logger.warn("Invalid create bank request", {
					error: validationResult.error,
				});
				return createFailure(validationResult.error);
			}

			// Check if bank already exists
			const existingBank = await this.bankRepository.findById(request.bank_id);
			if (existingBank) {
				this.logger.warn("Bank already exists", { bankId: request.bank_id });
				return createFailure(
					`Bank with ID '${request.bank_id}' already exists`,
				);
			}

			// Prepare bank data
			const bankData = this.prepareBankData(request);

			// Prepare environment configurations
			const environmentConfigs = this.prepareEnvironmentConfigs(request);

			// Create bank
			const createdBank = await this.bankRepository.insertBank({
				bankData,
				environmentConfigs,
			});

			if (!createdBank) {
				this.logger.error("Failed to create bank", { bankId: request.bank_id });
				return createFailure("Failed to create bank");
			}

			// Prepare response
			const configsArray = Object.values(
				createdBank.environment_configs,
			) as BankEnvironmentConfig[];
			const response: CreateBankResponse = {
				success: true,
				data: {
					bank: {
						bank_id: createdBank.bank_id,
						name: createdBank.name,
						bank_codes: createdBank.bank_codes,
						api: createdBank.api,
						api_version: createdBank.api_version,
						aspsp: createdBank.aspsp,
						country: createdBank.country,
						auth_type_choice_required: createdBank.auth_type_choice_required,
						bic: createdBank.bic,
						real_name: createdBank.real_name,
						product_code: createdBank.product_code,
						bank_group_id: createdBank.bank_group_id,
						logo_url: createdBank.logo_url,
						documentation: createdBank.documentation,
						keywords: createdBank.keywords,
						attribute: createdBank.attribute,
					},
					environment_configs: configsArray,
				},
				message: "Bank created successfully",
			};

			this.logger.info("Bank created successfully", {
				bankId: request.bank_id,
				environmentsCreated: configsArray.length,
			});

			return createSuccess(response);
		} catch (error) {
			this.logger.error("Failed to create bank", {
				bankId: request.bank_id,
				error: error instanceof Error ? error.message : String(error),
			});
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createFailure(`Failed to create bank: ${errorMessage}`);
		}
	}

	private prepareBankData(request: CreateBankRequest): BankWithEnvironments {
		return {
			bank_id: request.bank_id,
			name: request.name,
			bank_codes: request.bank_codes,
			api: request.api,
			api_version: request.api_version,
			aspsp: request.aspsp,
			country: request.country,
			auth_type_choice_required: request.auth_type_choice_required,
			bic: request.bic,
			real_name: request.real_name,
			product_code: request.product_code,
			bank_group_id: request.bank_group_id,
			logo_url: request.logo_url,
			documentation: request.documentation,
			keywords: request.keywords,
			attribute: request.attribute,
			environment_configs: {} as Record<Environment, BankEnvironmentConfig>, // Will be filled later
		};
	}

	private prepareEnvironmentConfigs(
		request: CreateBankRequest,
	): Record<Environment, BankEnvironmentConfig> {
		const configs: Record<Environment, BankEnvironmentConfig> = {} as Record<
			Environment,
			BankEnvironmentConfig
		>;

		if ("environments" in request && "configuration" in request) {
			// Create configs for each environment with the same configuration
			const { environments, configuration } = request;
			for (const env of environments) {
				configs[env] = this.buildConfigFromRequest(env, configuration);
			}
		} else if ("configurations" in request) {
			// Create configs from specific configurations per environment
			const { configurations } = request;
			for (const [env, config] of Object.entries(configurations)) {
				configs[env as Environment] = this.buildConfigFromRequest(
					env as Environment,
					config,
				);
			}
		}

		return configs;
	}

	private buildConfigFromRequest(
		environment: Environment,
		config: BankEnvironmentConfigRequest,
	): BankEnvironmentConfig {
		return {
			environment,
			enabled: config.enabled ?? 1, // Default to enabled
			blocked: config.blocked ?? false,
			risky: config.risky ?? false,
			app_auth_setup_required: config.app_auth_setup_required ?? false,
			blocked_text: config.blocked_text ?? null,
			risky_message: config.risky_message ?? null,
			supports_instant_payments: config.supports_instant_payments ?? null,
			instant_payments_activated: config.instant_payments_activated ?? null,
			instant_payments_limit: config.instant_payments_limit ?? null,
			ok_status_codes_simple_payment:
				config.ok_status_codes_simple_payment ?? null,
			ok_status_codes_instant_payment:
				config.ok_status_codes_instant_payment ?? null,
			ok_status_codes_periodic_payment:
				config.ok_status_codes_periodic_payment ?? null,
			enabled_periodic_payment: config.enabled_periodic_payment ?? null,
			frequency_periodic_payment: config.frequency_periodic_payment ?? null,
			config_periodic_payment: config.config_periodic_payment ?? null,
		};
	}
}
