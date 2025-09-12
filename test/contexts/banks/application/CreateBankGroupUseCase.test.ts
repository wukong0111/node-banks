import { describe, it, expect, beforeEach } from "vitest";
import { CreateBankGroupUseCase } from "@contexts/banks/application/CreateBankGroupUseCase.js";
import { MockBankGroupRepository } from "@test/contexts/banks/infrastructure/MockBankGroupRepository.js";
import { createMockLogger } from "@test/shared/application/services/MockLoggerService.js";
import { createBankGroup } from "@test/contexts/banks/domain/BankGroupMother.js";

describe("CreateBankGroupUseCase", () => {
	let useCase: CreateBankGroupUseCase;
	let repository: MockBankGroupRepository;
	let logger: ReturnType<typeof createMockLogger>;

	beforeEach(() => {
		repository = new MockBankGroupRepository();
		logger = createMockLogger();
		useCase = new CreateBankGroupUseCase(repository, logger);
	});

	it("should create a bank group successfully", async () => {
		// Arrange
		const request = {
			group_id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Bank Group",
			description: "A test bank group",
			logo_url: "https://example.com/logo.png",
			website: "https://example.com",
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.group_id).toBe(request.group_id);
			expect(result.data.data.name).toBe(request.name);
			expect(result.data.data.description).toBe(request.description);
			expect(result.data.data.logo_url).toBe(request.logo_url);
			expect(result.data.data.website).toBe(request.website);
			expect(result.data.message).toBe("Bank group created successfully");
		}

		// Verify logger calls
		expect(logger.getInfoLogs()).toContainEqual(
			expect.objectContaining({
				message: "Creating bank group",
				context: { name: request.name },
			}),
		);

		expect(logger.getInfoLogs()).toContainEqual(
			expect.objectContaining({
				message: "Bank group created successfully",
				context: { group_id: request.group_id },
			}),
		);
	});

	it("should fail when group_id is missing", async () => {
		// Arrange
		const request = {
			group_id: "",
			name: "Test Bank Group",
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
				message: "Invalid bank group creation request",
			}),
		);
	});

	it("should fail when name is missing", async () => {
		// Arrange
		const request = {
			group_id: "123e4567-e89b-12d3-a456-426614174000",
			name: "",
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe(
				"name is required and must be a non-empty string",
			);
		}
	});

	it("should fail when group_id is not a valid UUID", async () => {
		// Arrange
		const request = {
			group_id: "invalid-uuid",
			name: "Test Bank Group",
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("group_id must be a valid UUID");
		}
	});

	it("should fail when bank group already exists", async () => {
		// Arrange
		const existingGroup = createBankGroup({
			group_id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Existing Group",
		});
		repository.addBankGroup(existingGroup);

		const request = {
			group_id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Bank Group",
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Bank group with this ID already exists");
		}

		// Verify logger call
		expect(logger.getWarnLogs()).toContainEqual(
			expect.objectContaining({
				message: "Bank group already exists",
				context: { group_id: request.group_id },
			}),
		);
	});

	it("should handle repository errors gracefully", async () => {
		// Arrange
		const request = {
			group_id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Bank Group",
		};

		repository.shouldFailOnFindById(false);
		repository.shouldFailOnCreate(true, "Database connection failed");

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Failed to create bank group");
		}

		// Verify logger call
		expect(logger.getErrorLogs()).toContainEqual(
			expect.objectContaining({
				message: "Failed to create bank group",
				context: expect.objectContaining({
					group_id: request.group_id,
				}),
			}),
		);
	});

	it("should create bank group with optional fields as null", async () => {
		// Arrange
		const request = {
			group_id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Bank Group",
			description: null,
			logo_url: null,
			website: null,
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.group_id).toBe(request.group_id);
			expect(result.data.data.name).toBe(request.name);
			expect(result.data.data.description).toBeNull();
			expect(result.data.data.logo_url).toBeNull();
			expect(result.data.data.website).toBeNull();
		}
	});

	it("should create bank group without optional fields", async () => {
		// Arrange
		const request = {
			group_id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Bank Group",
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.group_id).toBe(request.group_id);
			expect(result.data.data.name).toBe(request.name);
			expect(result.data.data.description).toBeNull();
			expect(result.data.data.logo_url).toBeNull();
			expect(result.data.data.website).toBeNull();
		}
	});
});
