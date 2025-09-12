import { describe, it, expect, beforeEach } from "vitest";
import { CreateBankUseCase } from "@contexts/banks/application/CreateBankUseCase.js";
import { MockBankRepository } from "@test/contexts/banks/infrastructure/MockBankRepository.js";
import { createMockLogger } from "@test/shared/application/services/MockLoggerService.js";
import { createSantanderBank } from "@test/contexts/banks/domain/BankMother.js";
import type { BankWithEnvironments } from "@contexts/banks/domain/Bank.js";
import type {
	CreateBankRequest,
	CreateBankWithEnvironmentsRequest,
	CreateBankWithConfigurationsRequest,
} from "@contexts/banks/application/dto/CreateBankRequest.js";

describe("CreateBankUseCase", () => {
	let useCase: CreateBankUseCase;
	let repository: MockBankRepository;

	beforeEach(() => {
		repository = new MockBankRepository();
		const mockLogger = createMockLogger();
		useCase = new CreateBankUseCase(repository, mockLogger);
	});

	const createBankWithEnvironments = (bankId: string): BankWithEnvironments => {
		const bank = createSantanderBank();
		return {
			...bank,
			bank_id: bankId,
			environment_configs: {
				production: {
					environment: "production",
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: true,
				},
				test: {
					environment: "test",
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false,
				},
				sandbox: {
					environment: "sandbox",
					enabled: 1,
					blocked: false,
					risky: true,
					app_auth_setup_required: false,
				},
				development: {
					environment: "development",
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false,
				},
			},
		};
	};

	describe("when creating bank with environments", () => {
		it("should create bank successfully", async () => {
			// Arrange
			const request: CreateBankWithEnvironmentsRequest = {
				bank_id: "new_bank_es",
				name: "Nuevo Banco España",
				bank_codes: ["1234"],
				api: "berlin_group",
				api_version: "1.3.6",
				aspsp: "newbank",
				country: "ES",
				auth_type_choice_required: true,
				environments: ["production", "test"],
				configuration: {
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false,
				},
			};

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				expect(result.data.data.bank.bank_id).toBe("new_bank_es");
				expect(result.data.data.bank.name).toBe("Nuevo Banco España");
				expect(result.data.data.environment_configs).toHaveLength(2);
				expect(result.data.message).toBe("Bank created successfully");
			}
		});
	});

	describe("when creating bank with configurations", () => {
		it("should create bank successfully", async () => {
			// Arrange
			const request: CreateBankWithConfigurationsRequest = {
				bank_id: "config_bank_es",
				name: "Banco Config España",
				bank_codes: ["5678"],
				api: "berlin_group",
				api_version: "1.3.6",
				aspsp: "configbank",
				country: "ES",
				auth_type_choice_required: false,
				configurations: {
					production: {
						enabled: 1,
						blocked: false,
						risky: false,
						app_auth_setup_required: true,
					},
					test: {
						enabled: 1,
						blocked: false,
						risky: true,
						app_auth_setup_required: false,
					},
				},
			};

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				expect(result.data.data.bank.bank_id).toBe("config_bank_es");
				expect(result.data.data.environment_configs).toHaveLength(2);
				expect(result.data.message).toBe("Bank created successfully");
			}
		});
	});

	describe("when bank already exists", () => {
		it("should return failure with conflict error", async () => {
			// Arrange
			const existingBankId = "santander_es";
			const existingBank = createBankWithEnvironments(existingBankId);
			repository.setBankWithEnvironments(existingBankId, existingBank);

			const request: CreateBankWithEnvironmentsRequest = {
				bank_id: existingBankId,
				name: "Duplicate Bank",
				bank_codes: ["9999"],
				api: "berlin_group",
				api_version: "1.3.6",
				aspsp: "duplicate",
				country: "ES",
				auth_type_choice_required: true,
				environments: ["production"],
				configuration: {
					enabled: 1,
					blocked: false,
					risky: false,
					app_auth_setup_required: false,
				},
			};

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(
					`Bank with ID '${existingBankId}' already exists`,
				);
			}
		});
	});

	describe("when request is invalid", () => {
		it("should return failure for missing required fields", async () => {
			// Arrange
			const invalidRequest = {
				name: "Invalid Bank",
				// Missing bank_id and other required fields
			} as CreateBankRequest;

			// Act
			const result = await useCase.execute(invalidRequest);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("bank_id is required");
			}
		});

		it("should return failure for invalid oneOf structure", async () => {
			// Arrange
			const invalidRequest = {
				bank_id: "invalid_bank",
				name: "Invalid Bank",
				bank_codes: ["1234"],
				api: "berlin_group",
				api_version: "1.3.6",
				aspsp: "invalid",
				country: "ES",
				auth_type_choice_required: true,
				// Missing both environments and configurations
			} as CreateBankRequest;

			// Act
			const result = await useCase.execute(invalidRequest);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain(
					"Either 'environments' or 'configurations' must be provided",
				);
			}
		});
	});
});
