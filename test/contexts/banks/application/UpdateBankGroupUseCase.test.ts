import { describe, it, expect, beforeEach } from "vitest";
import { UpdateBankGroupUseCase } from "@contexts/banks/application/UpdateBankGroupUseCase.js";
import { MockBankGroupRepository } from "@test/contexts/banks/infrastructure/MockBankGroupRepository.js";
import { createMockLogger } from "@test/shared/application/services/MockLoggerService.js";
import { createBankGroup } from "@test/contexts/banks/domain/BankGroupMother.js";
import type { BankGroup } from "@contexts/banks/domain/BankGroup.js";

describe("UpdateBankGroupUseCase", () => {
	let useCase: UpdateBankGroupUseCase;
	let repository: MockBankGroupRepository;
	let logger: ReturnType<typeof createMockLogger>;
	let existingBankGroup: BankGroup;

	beforeEach(() => {
		repository = new MockBankGroupRepository();
		logger = createMockLogger();
		useCase = new UpdateBankGroupUseCase(repository, logger);

		// Create a test bank group
		existingBankGroup = createBankGroup({
			group_id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Bank Group",
			description: "Test Description",
			logo_url: "https://example.com/logo.png",
			website: "https://example.com",
		});

		repository.addBankGroup(existingBankGroup);
	});

	it("should update bank group name successfully", async () => {
		const request = {
			name: "Updated Bank Group Name",
		};

		const result = await useCase.execute(existingBankGroup.group_id, request);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.name).toBe("Updated Bank Group Name");
			expect(result.data.data.description).toBe(existingBankGroup.description);
			expect(result.data.data.logo_url).toBe(existingBankGroup.logo_url);
			expect(result.data.data.website).toBe(existingBankGroup.website);
		}
	});

	it("should update bank group description successfully", async () => {
		const request = {
			description: "Updated Description",
		};

		const result = await useCase.execute(existingBankGroup.group_id, request);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.name).toBe(existingBankGroup.name);
			expect(result.data.data.description).toBe("Updated Description");
			expect(result.data.data.logo_url).toBe(existingBankGroup.logo_url);
			expect(result.data.data.website).toBe(existingBankGroup.website);
		}
	});

	it("should update bank group logo_url successfully", async () => {
		const request = {
			logo_url: "https://updated-example.com/logo.png",
		};

		const result = await useCase.execute(existingBankGroup.group_id, request);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.name).toBe(existingBankGroup.name);
			expect(result.data.data.description).toBe(existingBankGroup.description);
			expect(result.data.data.logo_url).toBe(
				"https://updated-example.com/logo.png",
			);
			expect(result.data.data.website).toBe(existingBankGroup.website);
		}
	});

	it("should update bank group website successfully", async () => {
		const request = {
			website: "https://updated-example.com",
		};

		const result = await useCase.execute(existingBankGroup.group_id, request);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.name).toBe(existingBankGroup.name);
			expect(result.data.data.description).toBe(existingBankGroup.description);
			expect(result.data.data.logo_url).toBe(existingBankGroup.logo_url);
			expect(result.data.data.website).toBe("https://updated-example.com");
		}
	});

	it("should update multiple fields successfully", async () => {
		const request = {
			name: "Updated Name",
			description: "Updated Description",
			website: "https://updated-website.com",
		};

		const result = await useCase.execute(existingBankGroup.group_id, request);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.name).toBe("Updated Name");
			expect(result.data.data.description).toBe("Updated Description");
			expect(result.data.data.logo_url).toBe(existingBankGroup.logo_url);
			expect(result.data.data.website).toBe("https://updated-website.com");
		}
	});

	it("should return failure when bank group not found", async () => {
		const request = {
			name: "Updated Name",
		};

		const result = await useCase.execute("non-existent-id", request);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Bank group not found");
		}
	});

	it("should return failure when no fields provided for update", async () => {
		const request = {};

		const result = await useCase.execute(existingBankGroup.group_id, request);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe(
				"At least one field must be provided for update",
			);
		}
	});

	it("should return failure when name is empty string", async () => {
		const request = {
			name: "",
		};

		const result = await useCase.execute(existingBankGroup.group_id, request);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("name must be a non-empty string");
		}
	});

	it("should return failure when repository update fails", async () => {
		const request = {
			name: "Updated Name",
		};

		repository.shouldFailOnUpdate(true, "Database error");

		const result = await useCase.execute(existingBankGroup.group_id, request);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Failed to update bank group");
		}
	});

	it("should handle null values for optional fields", async () => {
		const request = {
			description: null,
			logo_url: null,
			website: null,
		};

		const result = await useCase.execute(existingBankGroup.group_id, request);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.data.name).toBe(existingBankGroup.name);
			expect(result.data.data.description).toBeNull();
			expect(result.data.data.logo_url).toBeNull();
			expect(result.data.data.website).toBeNull();
		}
	});
});
