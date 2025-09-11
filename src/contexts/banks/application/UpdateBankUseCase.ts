import type { BankRepository } from "../domain/BankRepository.js";
import type {
	UpdateBankRequestWithId,
	UpdateBankRequest,
} from "./dto/UpdateBankRequest.js";
import type { UpdateBankResponse } from "./dto/UpdateBankResponse.js";
import type {
	BankWithEnvironments,
	BankEnvironmentConfig,
	BankEnvironmentConfigRequest,
	Environment,
} from "../domain/Bank.js";
import type { Result } from "../domain/Result.js";
import { createSuccess, createFailure } from "../domain/Result.js";
import type { LoggerService } from "../../../shared/application/services/LoggerService.js";

export class UpdateBankUseCase {
	constructor(
		private readonly bankRepository: BankRepository,
		private readonly logger: LoggerService,
	) {}

	async execute(
		request: UpdateBankRequestWithId,
	): Promise<Result<UpdateBankResponse>> {
		this.logger.debug("Updating bank", { bankId: request.bankId });

		try {
			// Check if bank exists
			const existingBank = await this.bankRepository.findById(request.bankId);

			if (!existingBank) {
				this.logger.warn("Bank not found for update", {
					bankId: request.bankId,
				});
				return createFailure("Bank not found");
			}

			// Prepare update data
			const updateData = this.prepareUpdateData(request.request, existingBank);

			// Update bank
			const updatedBank = await this.bankRepository.update(
				request.bankId,
				updateData,
			);

			if (!updatedBank) {
				this.logger.error("Failed to update bank", { bankId: request.bankId });
				return createFailure("Failed to update bank");
			}

			// Prepare response
			const environmentConfigs = Object.values(
				updatedBank.environment_configs,
			) as BankEnvironmentConfig[];
			const response: UpdateBankResponse = {
				success: true,
				data: {
					bank: {
						bank_id: updatedBank.bank_id,
						name: updatedBank.name,
						bank_codes: updatedBank.bank_codes,
						api: updatedBank.api,
						api_version: updatedBank.api_version,
						aspsp: updatedBank.aspsp,
						country: updatedBank.country,
						auth_type_choice_required: updatedBank.auth_type_choice_required,
						bic: updatedBank.bic,
						real_name: updatedBank.real_name,
						product_code: updatedBank.product_code,
						bank_group_id: updatedBank.bank_group_id,
						logo_url: updatedBank.logo_url,
						documentation: updatedBank.documentation,
						keywords: updatedBank.keywords,
						attribute: updatedBank.attribute,
					},
					environment_configs: environmentConfigs,
				},
				message: "Bank updated successfully",
			};

			this.logger.info("Bank updated successfully", {
				bankId: request.bankId,
				environmentsUpdated: environmentConfigs.length,
			});

			return createSuccess(response);
		} catch (error) {
			this.logger.error("Failed to update bank", {
				bankId: request.bankId,
				error: error instanceof Error ? error.message : String(error),
			});
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createFailure(`Failed to update bank: ${errorMessage}`);
		}
	}

	private prepareUpdateData(
		updateRequest: UpdateBankRequest,
		existingBank: BankWithEnvironments,
	): {
		bankData: Partial<BankWithEnvironments>;
		environmentConfigs: Record<Environment, BankEnvironmentConfig>;
	} {
		// Prepare bank data updates
		const bankData: Partial<BankWithEnvironments> = {};

		// Copy all optional fields from request to bankData
		if (updateRequest.bank_id !== undefined)
			bankData.bank_id = updateRequest.bank_id;
		if (updateRequest.name !== undefined) bankData.name = updateRequest.name;
		if (updateRequest.bank_codes !== undefined)
			bankData.bank_codes = updateRequest.bank_codes;
		if (updateRequest.api !== undefined) bankData.api = updateRequest.api;
		if (updateRequest.api_version !== undefined)
			bankData.api_version = updateRequest.api_version;
		if (updateRequest.aspsp !== undefined) bankData.aspsp = updateRequest.aspsp;
		if (updateRequest.country !== undefined)
			bankData.country = updateRequest.country;
		if (updateRequest.auth_type_choice_required !== undefined)
			bankData.auth_type_choice_required =
				updateRequest.auth_type_choice_required;
		if (updateRequest.bic !== undefined) bankData.bic = updateRequest.bic;
		if (updateRequest.real_name !== undefined)
			bankData.real_name = updateRequest.real_name;
		if (updateRequest.product_code !== undefined)
			bankData.product_code = updateRequest.product_code;
		if (updateRequest.bank_group_id !== undefined)
			bankData.bank_group_id = updateRequest.bank_group_id;
		if (updateRequest.logo_url !== undefined)
			bankData.logo_url = updateRequest.logo_url;
		if (updateRequest.documentation !== undefined)
			bankData.documentation = updateRequest.documentation;
		if (updateRequest.keywords !== undefined)
			bankData.keywords = updateRequest.keywords;
		if (updateRequest.attribute !== undefined)
			bankData.attribute = updateRequest.attribute;

		// Prepare environment configurations
		const environmentConfigs: Record<Environment, BankEnvironmentConfig> = {
			...existingBank.environment_configs,
		};

		if ("environments" in updateRequest && "configuration" in updateRequest) {
			// Update with environments array and single configuration
			const req = updateRequest as {
				environments: Environment[];
				configuration: BankEnvironmentConfigRequest;
			};
			const { environments, configuration } = req;

			for (const env of environments) {
				if (environmentConfigs[env]) {
					environmentConfigs[env] = {
						...environmentConfigs[env],
						enabled: configuration.enabled ?? environmentConfigs[env].enabled,
						blocked: configuration.blocked ?? environmentConfigs[env].blocked,
						risky: configuration.risky ?? environmentConfigs[env].risky,
						app_auth_setup_required:
							configuration.app_auth_setup_required ??
							environmentConfigs[env].app_auth_setup_required,
						blocked_text:
							configuration.blocked_text ??
							environmentConfigs[env].blocked_text,
						risky_message:
							configuration.risky_message ??
							environmentConfigs[env].risky_message,
						supports_instant_payments:
							configuration.supports_instant_payments ??
							environmentConfigs[env].supports_instant_payments,
						instant_payments_activated:
							configuration.instant_payments_activated ??
							environmentConfigs[env].instant_payments_activated,
						instant_payments_limit:
							configuration.instant_payments_limit ??
							environmentConfigs[env].instant_payments_limit,
						ok_status_codes_simple_payment:
							configuration.ok_status_codes_simple_payment ??
							environmentConfigs[env].ok_status_codes_simple_payment,
						ok_status_codes_instant_payment:
							configuration.ok_status_codes_instant_payment ??
							environmentConfigs[env].ok_status_codes_instant_payment,
						ok_status_codes_periodic_payment:
							configuration.ok_status_codes_periodic_payment ??
							environmentConfigs[env].ok_status_codes_periodic_payment,
						enabled_periodic_payment:
							configuration.enabled_periodic_payment ??
							environmentConfigs[env].enabled_periodic_payment,
						frequency_periodic_payment:
							configuration.frequency_periodic_payment ??
							environmentConfigs[env].frequency_periodic_payment,
						config_periodic_payment:
							configuration.config_periodic_payment ??
							environmentConfigs[env].config_periodic_payment,
					};
				}
			}
		} else if ("configurations" in updateRequest) {
			// Update with specific configurations per environment
			const req = updateRequest as {
				configurations: Record<string, BankEnvironmentConfigRequest>;
			};
			const { configurations } = req;

			for (const [env, config] of Object.entries(configurations)) {
				const environment = env as Environment;
				if (environmentConfigs[environment]) {
					environmentConfigs[environment] = {
						...environmentConfigs[environment],
						...config,
					};
				}
			}
		}

		return { bankData, environmentConfigs };
	}
}
