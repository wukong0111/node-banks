import { describe, it, expect, beforeEach } from "vitest";
import { DeleteBankUseCase } from "@contexts/banks/application/DeleteBankUseCase.js";
import { MockBankRepository } from "@test/contexts/banks/infrastructure/MockBankRepository.js";
import { createSantanderBank } from "@test/contexts/banks/domain/BankMother.js";
import type { BankWithEnvironments } from "@contexts/banks/domain/Bank.js";
import type { DeleteBankRequest } from "@contexts/banks/application/dto/DeleteBankRequest.js";

describe("DeleteBankUseCase", () => {
	let useCase: DeleteBankUseCase;
	let repository: MockBankRepository;

	beforeEach(() => {
		repository = new MockBankRepository();
		useCase = new DeleteBankUseCase(repository);
	});

	const createBankWithEnvironments = (bankId: string): BankWithEnvironments => {
		const bank = createSantanderBank();
		const bankWithEnvironments: BankWithEnvironments = {
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

		// Also add to the banks array for count to work properly
		repository.addBank({
			bank_id: bankWithEnvironments.bank_id,
			name: bankWithEnvironments.name,
			bank_codes: bankWithEnvironments.bank_codes,
			api: bankWithEnvironments.api,
			api_version: bankWithEnvironments.api_version,
			aspsp: bankWithEnvironments.aspsp,
			country: bankWithEnvironments.country,
			auth_type_choice_required: bankWithEnvironments.auth_type_choice_required,
		});

		return bankWithEnvironments;
	};

	describe("when deleting an existing bank", () => {
		it("should delete bank successfully", async () => {
			// Arrange
			const bankId = "santander_bank_001";
			const existingBank = createBankWithEnvironments(bankId);
			repository.setBankWithEnvironments(bankId, existingBank);

			const request: DeleteBankRequest = {
				bankId,
			};

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				expect(result.data.message).toBe("Bank deleted successfully");
				expect(result.data.timestamp).toBeDefined();
			}

			// Verify bank was actually deleted
			const bankCount = await repository.count({});
			expect(bankCount).toBe(0);
		});
	});

	describe("when bank does not exist", () => {
		it("should return failure with not found error", async () => {
			// Arrange
			const nonExistentBankId = "nonexistent_bank_001";
			const request: DeleteBankRequest = {
				bankId: nonExistentBankId,
			};

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(
					`Bank with ID '${nonExistentBankId}' not found`,
				);
			}
		});
	});

	describe("when request is invalid", () => {
		it("should return failure for missing bankId", async () => {
			// Arrange
			const invalidRequest = {} as DeleteBankRequest;

			// Act
			const result = await useCase.execute(invalidRequest);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(
					"bankId is required and must be a non-empty string",
				);
			}
		});

		it("should return failure for empty bankId", async () => {
			// Arrange
			const invalidRequest: DeleteBankRequest = {
				bankId: "",
			};

			// Act
			const result = await useCase.execute(invalidRequest);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(
					"bankId is required and must be a non-empty string",
				);
			}
		});

		it("should return failure for whitespace-only bankId", async () => {
			// Arrange
			const invalidRequest: DeleteBankRequest = {
				bankId: "   ",
			};

			// Act
			const result = await useCase.execute(invalidRequest);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(
					"bankId is required and must be a non-empty string",
				);
			}
		});
	});

	describe("when deleting bank with environment configurations", () => {
		it("should delete bank and its configurations successfully", async () => {
			// Arrange
			const bankId = "santander_bank_002";
			const existingBank = createBankWithEnvironments(bankId);
			repository.setBankWithEnvironments(bankId, existingBank);

			// Verify initial state
			const initialCount = await repository.count({});
			expect(initialCount).toBe(1);

			const request: DeleteBankRequest = {
				bankId,
			};

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				expect(result.data.message).toBe("Bank deleted successfully");
			}

			// Verify bank and configurations were deleted
			const finalCount = await repository.count({});
			expect(finalCount).toBe(0);
		});
	});
});
