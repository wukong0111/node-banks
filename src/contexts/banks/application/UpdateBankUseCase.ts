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
			const existingBank = await this.validateBankExists(request.bankId);
			if (!existingBank) {
				return createFailure("Bank not found");
			}

			const updateData = this.prepareUpdateData(request.request, existingBank);
			const updatedBank = await this.bankRepository.update(
				request.bankId,
				updateData,
			);

			if (!updatedBank) {
				this.logger.error("Failed to update bank", { bankId: request.bankId });
				return createFailure("Failed to update bank");
			}

			const response = this.mapToResponse(updatedBank);
			this.logger.info("Bank updated successfully", {
				bankId: request.bankId,
				environmentsUpdated: response.data.environment_configs.length,
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

	private async validateBankExists(
		bankId: string,
	): Promise<BankWithEnvironments | null> {
		const existingBank = await this.bankRepository.findById(bankId);

		if (!existingBank) {
			this.logger.warn("Bank not found for update", { bankId });
		}

		return existingBank;
	}

	private mapToResponse(updatedBank: BankWithEnvironments): UpdateBankResponse {
		const environmentConfigs = Object.values(
			updatedBank.environment_configs,
		) as BankEnvironmentConfig[];

		return {
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
	}

	private prepareUpdateData(
		updateRequest: UpdateBankRequest,
		existingBank: BankWithEnvironments,
	): {
		bankData: Partial<BankWithEnvironments>;
		environmentConfigs: Record<Environment, BankEnvironmentConfig>;
	} {
		const bankData = this.prepareBankData(updateRequest);
		const environmentConfigs = this.prepareEnvironmentConfigs(
			updateRequest,
			existingBank,
		);

		return { bankData, environmentConfigs };
	}

	private prepareBankData(
		updateRequest: UpdateBankRequest,
	): Partial<BankWithEnvironments> {
		const bankData: Partial<BankWithEnvironments> = {};

		Object.assign(
			bankData,
			Object.fromEntries(
				Object.entries(updateRequest).filter(
					([_, value]) => value !== undefined,
				),
			),
		);

		return bankData;
	}

	private prepareEnvironmentConfigs(
		updateRequest: UpdateBankRequest,
		existingBank: BankWithEnvironments,
	): Record<Environment, BankEnvironmentConfig> {
		const environmentConfigs: Record<Environment, BankEnvironmentConfig> = {
			...existingBank.environment_configs,
		};

		if ("environments" in updateRequest && "configuration" in updateRequest) {
			this.updateEnvironmentsWithConfig(
				updateRequest.environments,
				updateRequest.configuration,
				environmentConfigs,
			);
		} else if ("configurations" in updateRequest) {
			this.updateEnvironmentsWithConfigs(
				updateRequest.configurations,
				environmentConfigs,
			);
		}

		return environmentConfigs;
	}

	private updateEnvironmentsWithConfig(
		environments: Environment[],
		configuration: BankEnvironmentConfigRequest,
		environmentConfigs: Record<Environment, BankEnvironmentConfig>,
	): void {
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
						configuration.blocked_text ?? environmentConfigs[env].blocked_text,
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
	}

	private updateEnvironmentsWithConfigs(
		configurations: Record<string, BankEnvironmentConfigRequest>,
		environmentConfigs: Record<Environment, BankEnvironmentConfig>,
	): void {
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
}
