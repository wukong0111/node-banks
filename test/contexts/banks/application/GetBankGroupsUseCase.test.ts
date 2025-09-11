import { describe, it, expect, beforeEach } from "vitest";
import { GetBankGroupsUseCase } from "@contexts/banks/application/GetBankGroupsUseCase.js";
import { MockBankGroupRepository } from "@test/contexts/banks/infrastructure/MockBankGroupRepository.js";
import { createMockLogger } from "@test/shared/application/services/MockLoggerService.js";

describe("GetBankGroupsUseCase", () => {
	let useCase: GetBankGroupsUseCase;
	let repository: MockBankGroupRepository;

	beforeEach(() => {
		repository = new MockBankGroupRepository();
		const mockLogger = createMockLogger();
		useCase = new GetBankGroupsUseCase(repository, mockLogger);
	});

	describe("when repository returns bank groups successfully", () => {
		it("should return bank groups", async () => {
			// Arrange
			const bankGroups = [
				{
					group_id: "550e8400-e29b-41d4-a716-446655440000",
					name: "Grupo Santander",
					description: "Grupo bancario Santander",
					logo_url: "https://example.com/santander.png",
					website: "https://www.santander.com",
					created_at: "2024-01-01T00:00:00.000Z",
					updated_at: "2024-01-01T00:00:00.000Z",
				},
				{
					group_id: "550e8400-e29b-41d4-a716-446655440001",
					name: "Grupo BBVA",
					description: "Grupo bancario BBVA",
					logo_url: "https://example.com/bbva.png",
					website: "https://www.bbva.com",
					created_at: "2024-01-01T00:00:00.000Z",
					updated_at: "2024-01-01T00:00:00.000Z",
				},
			];
			repository.setBankGroups(bankGroups);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(bankGroups);
			}
		});

		it("should return empty array when no bank groups exist", async () => {
			// Arrange
			repository.setBankGroups([]);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual([]);
			}
		});
	});

	describe("when repository fails", () => {
		it("should return failure result with error message", async () => {
			// Arrange
			const errorMessage = "Database connection failed";
			repository.shouldFailOnFindAll(true, errorMessage);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Internal server error");
			}
		});
	});
});
