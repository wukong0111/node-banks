import { describe, it, expect, beforeEach } from "vitest";
import { GetBanksUseCase } from "@contexts/banks/application/GetBanksUseCase.js";
import { MockBankRepository } from "@test/contexts/banks/infrastructure/MockBankRepository.js";
import {
	createBankList,
	createSpanishBankList,
	createSantanderBank,
	createBbvaBank,
	createGermanBank,
	createBankWithApi,
} from "@test/contexts/banks/domain/BankMother.js";
import {
	createEmptyBankRequest,
	createBankRequestWithPagination,
	createBankRequestWithName,
	createSpanishBankRequest,
	createBankRequestWithCountry,
	createBankRequestWithApi,
	createFirstPageRequest,
	createInvalidPageRequest,
	createInvalidLimitRequest,
	createNegativePageRequest,
	createZeroLimitRequest,
	createExcessiveLimitRequest,
	createBankRequestWithPage,
} from "@test/contexts/banks/domain/BankRequestMother.js";

describe("GetBanksUseCase", () => {
	let useCase: GetBanksUseCase;
	let repository: MockBankRepository;

	beforeEach(() => {
		repository = new MockBankRepository();
		useCase = new GetBanksUseCase(repository);
	});

	describe("when request is valid", () => {
		it("should return banks with correct pagination", async () => {
			// Arrange
			const banks = createBankList(5);
			repository.setBanks(banks);
			const request = createBankRequestWithPagination(1, 3);

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				expect(result.data.data).toHaveLength(3);
				expect(result.data.pagination.page).toBe(1);
				expect(result.data.pagination.limit).toBe(3);
				expect(result.data.pagination.total).toBe(5);
				expect(result.data.pagination.totalPages).toBe(2);
			}
		});

		it("should apply default pagination when not provided", async () => {
			// Arrange
			const banks = createBankList(3);
			repository.setBanks(banks);
			const request = createEmptyBankRequest();

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.pagination.page).toBe(1);
				expect(result.data.pagination.limit).toBe(20);
			}
		});

		it("should filter banks by name", async () => {
			// Arrange
			const santander = createSantanderBank();
			const bbva = createBbvaBank();
			repository.setBanks([santander, bbva]);
			const request = createBankRequestWithName("Santander");

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.data).toHaveLength(1);
				expect(result.data.data?.[0]?.name).toContain("Santander");
			}
		});

		it("should filter banks by country", async () => {
			// Arrange
			const spanishBanks = createSpanishBankList(3);
			const germanBank = createGermanBank();
			repository.setBanks([...spanishBanks, germanBank]);
			const request = createBankRequestWithCountry("ES");

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.data).toHaveLength(3);
				expect(result.data.data?.every((bank) => bank.country === "ES")).toBe(true);
			}
		});

		it("should filter banks by API", async () => {
			// Arrange
			const berlinGroupBank = createBankWithApi("berlin_group");
			const openBankingBank = createBankWithApi("open_banking");
			repository.setBanks([berlinGroupBank, openBankingBank]);
			const request = createBankRequestWithApi("berlin");

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.data).toHaveLength(1);
				expect(result.data.data?.[0]?.api).toBe("berlin_group");
			}
		});

		it("should return empty results when no banks match filters", async () => {
			// Arrange
			const banks = createSpanishBankList(3);
			repository.setBanks(banks);
			const request = createBankRequestWithCountry("FR");

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.data).toHaveLength(0);
				expect(result.data.pagination.total).toBe(0);
			}
		});
	});

	describe("when request has validation errors", () => {
		it("should return failure for invalid page number", async () => {
			// Arrange
			const request = createInvalidPageRequest();

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("Page parameter");
			}
		});

		it("should return failure for invalid limit", async () => {
			// Arrange
			const request = createInvalidLimitRequest();

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("Limit parameter");
			}
		});

		it("should return failure for negative page", async () => {
			// Arrange
			const request = createNegativePageRequest();

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("Page parameter");
			}
		});

		it("should return failure for zero limit", async () => {
			// Arrange
			const request = createZeroLimitRequest();

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("Limit parameter");
			}
		});

		it("should return failure for excessive limit", async () => {
			// Arrange
			const request = createExcessiveLimitRequest();

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain("Limit parameter");
			}
		});
	});

	describe("when repository fails", () => {
		it("should return failure when repository throws error", async () => {
			// Arrange
			const request = createFirstPageRequest();
			repository.shouldFailOnFindAll(true, "Database connection failed");

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Internal server error");
			}
		});

		it("should handle repository errors gracefully", async () => {
			// Arrange
			const request = createSpanishBankRequest();
			repository.shouldFailOnFindAll(true, "Network timeout");

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Internal server error");
				// No data property in Failure type
			}
		});
	});

	describe("edge cases", () => {
		it("should handle empty repository", async () => {
			// Arrange
			const request = createFirstPageRequest();
			// Repository is already empty by default

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.data).toHaveLength(0);
				expect(result.data.pagination.total).toBe(0);
				expect(result.data.pagination.totalPages).toBe(0);
			}
		});

		it("should handle page beyond available results", async () => {
			// Arrange
			const banks = createBankList(5);
			repository.setBanks(banks);
			const request = createBankRequestWithPage(10);

			// Act
			const result = await useCase.execute(request);

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.data).toHaveLength(0);
				expect(result.data.pagination.page).toBe(10);
				expect(result.data.pagination.total).toBe(5);
			}
		});
	});
});