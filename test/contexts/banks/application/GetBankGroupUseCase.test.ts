import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetBankGroupUseCase } from "@contexts/banks/application/GetBankGroupUseCase.js";
import { MockBankGroupRepository } from "@test/contexts/banks/infrastructure/MockBankGroupRepository.js";
import { createMockLogger } from "@test/shared/application/services/MockLoggerService.js";
import { createBankGroup } from "@test/contexts/banks/domain/BankGroupMother.js";

describe("GetBankGroupUseCase", () => {
	let useCase: GetBankGroupUseCase;
	let repository: MockBankGroupRepository;
	let logger: ReturnType<typeof createMockLogger>;

	beforeEach(() => {
		repository = new MockBankGroupRepository();
		logger = createMockLogger();
		useCase = new GetBankGroupUseCase(repository, logger);
	});

	it("should return bank group when found", async () => {
		// Arrange
		const bankGroup = createBankGroup({
			group_id: "550e8400-e29b-41d4-a716-446655440000",
			name: "Test Bank Group",
			description: "A test bank group",
		});
		repository.addBankGroup(bankGroup);

		const request = {
			group_id: bankGroup.group_id,
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.group_id).toBe(bankGroup.group_id);
			expect(result.data.data.name).toBe(bankGroup.name);
			expect(result.data.data.description).toBe(bankGroup.description);
			expect(result.data.data.logo_url).toBe(bankGroup.logo_url);
			expect(result.data.data.website).toBe(bankGroup.website);
		}

		// Verify logger calls
		expect(logger.getInfoLogs()).toContainEqual(
			expect.objectContaining({
				message: "Getting bank group",
				context: { group_id: bankGroup.group_id },
			}),
		);

		expect(logger.getInfoLogs()).toContainEqual(
			expect.objectContaining({
				message: "Bank group retrieved successfully",
				context: { group_id: bankGroup.group_id },
			}),
		);
	});

	it("should fail when group_id is missing", async () => {
		// Arrange
		const request = {
			group_id: "",
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe(
				"group_id is required and must be a non-empty string",
			);
		}

		// Verify logger call
		expect(logger.getWarnLogs()).toContainEqual(
			expect.objectContaining({
				message: "Invalid bank group get request",
			}),
		);
	});

	it("should fail when group_id is not a valid UUID", async () => {
		// Arrange
		const request = {
			group_id: "invalid-uuid",
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("group_id must be a valid UUID");
		}
	});

	it("should fail when bank group not found", async () => {
		// Arrange
		const request = {
			group_id: "550e8400-e29b-41d4-a716-446655440000",
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Bank group not found");
		}

		// Verify logger call
		expect(logger.getWarnLogs()).toContainEqual(
			expect.objectContaining({
				message: "Bank group not found",
				context: { group_id: request.group_id },
			}),
		);
	});

	it("should handle repository errors gracefully", async () => {
		// Arrange
		const request = {
			group_id: "550e8400-e29b-41d4-a716-446655440000",
		};

		repository.shouldFailOnFindById(true, "Database connection failed");

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Failed to get bank group");
		}

		// Verify logger call
		expect(logger.getErrorLogs()).toContainEqual(
			expect.objectContaining({
				message: "Failed to get bank group",
				context: expect.objectContaining({
					group_id: request.group_id,
				}),
			}),
		);
	});

	it("should call repository with correct id", async () => {
		// Arrange
		const bankGroup = createBankGroup({
			group_id: "550e8400-e29b-41d4-a716-446655440000",
			name: "Test Bank Group",
		});
		repository.addBankGroup(bankGroup);

		const findByIdSpy = vi.spyOn(repository, "findById");
		const request = {
			group_id: bankGroup.group_id,
		};

		// Act
		await useCase.execute(request);

		// Assert
		expect(findByIdSpy).toHaveBeenCalledWith(bankGroup.group_id);
	});
});
