import { describe, it, expect, beforeEach } from "vitest";
import { GetBankDetailsUseCase } from "@contexts/banks/application/GetBankDetailsUseCase.js";
import { MockBankRepository } from "@test/contexts/banks/infrastructure/MockBankRepository.js";
import { createSantanderBank, createBankWithId } from "@test/contexts/banks/domain/BankMother.js";
import type { BankWithEnvironments, BankWithEnvironment, Environment, BankEnvironmentConfig } from "@contexts/banks/domain/Bank.js";

describe("GetBankDetailsUseCase", () => {
	let mockRepository: MockBankRepository;
	let useCase: GetBankDetailsUseCase;

	beforeEach(() => {
		mockRepository = new MockBankRepository();
		useCase = new GetBankDetailsUseCase(mockRepository);
	});

	describe("when bank exists", () => {
		it("should return bank with all environment configurations when no env parameter provided", async () => {
			const bank = createSantanderBank();
			const environmentConfigs: Record<Environment, BankEnvironmentConfig> = {
				production: {
					environment: 'production',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: true
				},
				test: {
					environment: 'test',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				},
				sandbox: {
					environment: 'sandbox',
					enabled: 1,
					blocked: false,
					risky: true,
					app_auth_setup_required: false
				},
				development: {
					environment: 'development',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				}
			};

			const bankWithEnvironments: BankWithEnvironments = {
				...bank,
				environment_configs: environmentConfigs
			};

			mockRepository.setBankWithEnvironments(bank.bank_id, bankWithEnvironments);

			const result = await useCase.execute({ bankId: bank.bank_id });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				const data = result.data.data as BankWithEnvironments;
				expect(data.bank_id).toBe(bank.bank_id);
				expect(data.name).toBe(bank.name);
				expect(data.environment_configs).toEqual(environmentConfigs);
				expect(Object.keys(data.environment_configs)).toHaveLength(4);
			}
		});

		it("should return bank with specific environment configuration when env parameter provided", async () => {
			const bank = createSantanderBank();
			const environmentConfigs: Record<Environment, BankEnvironmentConfig> = {
				production: {
					environment: 'production',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: true
				},
				test: {
					environment: 'test',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				},
				sandbox: {
					environment: 'sandbox',
					enabled: 0,
					blocked: true,
					risky: false,
					app_auth_setup_required: false,
					blocked_text: "Under maintenance"
				},
				development: {
					environment: 'development',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				}
			};

			const bankWithEnvironments: BankWithEnvironments = {
				...bank,
				environment_configs: environmentConfigs
			};

			mockRepository.setBankWithEnvironments(bank.bank_id, bankWithEnvironments);

			const result = await useCase.execute({ bankId: bank.bank_id, env: 'production' });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				const data = result.data.data as BankWithEnvironment;
				expect(data.bank_id).toBe(bank.bank_id);
				expect(data.name).toBe(bank.name);
				expect(data.environment_config).toEqual(environmentConfigs.production);
				expect(data.environment_config.environment).toBe('production');
				expect(data.environment_config.app_auth_setup_required).toBe(true);
			}
		});

		it("should return sandbox environment configuration with blocked status", async () => {
			const bank = createBankWithId("test_bank");
			const environmentConfigs: Record<Environment, BankEnvironmentConfig> = {
				production: {
					environment: 'production',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				},
				test: {
					environment: 'test',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				},
				sandbox: {
					environment: 'sandbox',
					enabled: 0,
					blocked: true,
					risky: false,
					app_auth_setup_required: false,
					blocked_text: "Sandbox temporarily unavailable"
				},
				development: {
					environment: 'development',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				}
			};

			const bankWithEnvironments: BankWithEnvironments = {
				...bank,
				environment_configs: environmentConfigs
			};

			mockRepository.setBankWithEnvironments(bank.bank_id, bankWithEnvironments);

			const result = await useCase.execute({ bankId: bank.bank_id, env: 'sandbox' });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				const data = result.data.data as BankWithEnvironment;
				expect(data.environment_config.blocked).toBe(true);
				expect(data.environment_config.enabled).toBe(0);
				expect(data.environment_config.blocked_text).toBe("Sandbox temporarily unavailable");
			}
		});

		it("should return test environment configuration with risky flag", async () => {
			const bank = createBankWithId("risky_bank");
			const environmentConfigs: Record<Environment, BankEnvironmentConfig> = {
				production: {
					environment: 'production',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				},
				test: {
					environment: 'test',
					enabled: 1,
					blocked: false,
					risky: true,
					app_auth_setup_required: false,
					risky_message: "This is a test environment with simulated risks"
				},
				sandbox: {
					environment: 'sandbox',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				},
				development: {
					environment: 'development',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				}
			};

			const bankWithEnvironments: BankWithEnvironments = {
				...bank,
				environment_configs: environmentConfigs
			};

			mockRepository.setBankWithEnvironments(bank.bank_id, bankWithEnvironments);

			const result = await useCase.execute({ bankId: bank.bank_id, env: 'test' });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				const data = result.data.data as BankWithEnvironment;
				expect(data.environment_config.risky).toBe(true);
				expect(data.environment_config.risky_message).toBe("This is a test environment with simulated risks");
			}
		});
	});

	describe("when bank does not exist", () => {
		it("should return bank not found error", async () => {
			const result = await useCase.execute({ bankId: "non_existent_bank" });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Bank not found");
			}
		});

		it("should return bank not found error when requesting specific environment", async () => {
			const result = await useCase.execute({ bankId: "non_existent_bank", env: "production" });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Bank not found");
			}
		});
	});

	describe("when environment does not exist", () => {
		it("should return environment not found error", async () => {
			const bank = createSantanderBank();
			const environmentConfigs: Record<Environment, BankEnvironmentConfig> = {
				production: {
					environment: 'production',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: true
				},
				test: {
					environment: 'test',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				},
				sandbox: {
					environment: 'sandbox',
					enabled: 1,
					blocked: false,
					risky: true,
					app_auth_setup_required: false
				},
				development: {
					environment: 'development',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				}
			};

			// Create incomplete environment configs (missing one environment)
			const { development: _development, ...incompleteConfigs } = environmentConfigs;
			
			const bankWithEnvironments: BankWithEnvironments = {
				...bank,
				environment_configs: incompleteConfigs as Record<Environment, BankEnvironmentConfig>
			};

			mockRepository.setBankWithEnvironments(bank.bank_id, bankWithEnvironments);

			const result = await useCase.execute({ bankId: bank.bank_id, env: 'development' });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Environment 'development' not found for bank 'santander_es'");
			}
		});
	});

	describe("when repository fails", () => {
		it("should return repository error", async () => {
			mockRepository.shouldFailOnFindById(true, "Database connection failed");

			const result = await useCase.execute({ bankId: "santander_es" });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("Failed to get bank details");
				expect(result.error).toContain("Database connection failed");
			}
		});
	});

	describe("edge cases", () => {
		it("should handle bank with empty environment configurations gracefully", async () => {
			const bank = createSantanderBank();
			const bankWithEnvironments: BankWithEnvironments = {
				...bank,
				environment_configs: {} as Record<Environment, BankEnvironmentConfig>
			};

			mockRepository.setBankWithEnvironments(bank.bank_id, bankWithEnvironments);

			const result = await useCase.execute({ bankId: bank.bank_id });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				const data = result.data.data as BankWithEnvironments;
				expect(data.environment_configs).toEqual({});
			}
		});

		it("should handle partial environment configurations", async () => {
			const bank = createBankWithId("partial_bank");
			const partialConfigs: Partial<Record<Environment, BankEnvironmentConfig>> = {
				production: {
					environment: 'production',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: true
				},
				test: {
					environment: 'test',
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false
				}
			};

			const bankWithEnvironments: BankWithEnvironments = {
				...bank,
				environment_configs: partialConfigs as Record<Environment, BankEnvironmentConfig>
			};

			mockRepository.setBankWithEnvironments(bank.bank_id, bankWithEnvironments);

			const result = await useCase.execute({ bankId: bank.bank_id });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				const data = result.data.data as BankWithEnvironments;
				expect(Object.keys(data.environment_configs)).toHaveLength(2);
				expect(data.environment_configs.production).toBeDefined();
				expect(data.environment_configs.test).toBeDefined();
			}
		});
	});
});