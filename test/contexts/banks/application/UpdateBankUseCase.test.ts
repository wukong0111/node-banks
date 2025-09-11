import { describe, it, expect, beforeEach } from "vitest";
import { UpdateBankUseCase } from "@contexts/banks/application/UpdateBankUseCase.js";
import { MockBankRepository } from "@test/contexts/banks/infrastructure/MockBankRepository.js";
import { createMockLogger } from "@test/shared/application/services/MockLoggerService.js";
import { createSantanderBank } from "@test/contexts/banks/domain/BankMother.js";
import type { BankWithEnvironments } from "@contexts/banks/domain/Bank.js";
import type {
	UpdateBankRequestWithId,
	UpdateBankWithConfigurationsRequest,
} from "@contexts/banks/application/dto/UpdateBankRequest.js";

describe("UpdateBankUseCase", () => {
	let useCase: UpdateBankUseCase;
	let repository: MockBankRepository;

	beforeEach(() => {
		repository = new MockBankRepository();
		const mockLogger = createMockLogger();
		useCase = new UpdateBankUseCase(repository, mockLogger);
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

	describe("when bank exists", () => {
		it("should update bank successfully", async () => {
			// Arrange
			const bankId = "santander_es";
			const existingBank = createBankWithEnvironments(bankId);
			repository.setBankWithEnvironments(bankId, existingBank);

			const request: UpdateBankRequestWithId = {
				bankId,
				request: {
					name: "Banco Santander Updated",
					auth_type_choice_required: false,
					configurations: {},
				} as UpdateBankWithConfigurationsRequest,
			};

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				expect(result.data.data.bank.name).toBe("Banco Santander Updated");
				expect(result.data.data.bank.auth_type_choice_required).toBe(false);
				expect(result.data.message).toBe("Bank updated successfully");
			}
		});
	});

	describe("when bank does not exist", () => {
		it("should return failure", async () => {
			// Arrange
			const request: UpdateBankRequestWithId = {
				bankId: "non_existent_bank",
				request: {
					name: "Updated Name",
					configurations: {},
				} as UpdateBankWithConfigurationsRequest,
			};

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Bank not found");
			}
		});
	});
});
