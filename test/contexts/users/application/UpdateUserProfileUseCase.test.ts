import { describe, it, expect, beforeEach } from "vitest";
import { UpdateUserProfileUseCase } from "../../../../src/contexts/users/application/UpdateUserProfileUseCase.js";
import { MockUserRepository } from "../infrastructure/MockUserRepository.js";
import * as UserRequestMother from "../domain/UserRequestMother.js";
import * as UserMother from "../domain/UserMother.js";

describe("UpdateUserProfileUseCase", () => {
	let userRepository: MockUserRepository;
	let useCase: UpdateUserProfileUseCase;

	beforeEach(() => {
		userRepository = new MockUserRepository();
		useCase = new UpdateUserProfileUseCase(userRepository);
	});

	it("should update both first and last name successfully", async () => {
		// Arrange
		const existingUser = UserMother.create({
			firstName: "OriginalFirstName",
			lastName: "OriginalLastName",
		});

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;
		const updateRequest = UserRequestMother.validUpdateRequest();

		// Act
		const result = await useCase.execute(userId, updateRequest);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.firstName).toBe(updateRequest.firstName);
			expect(result.data.lastName).toBe(updateRequest.lastName);
			expect(result.data.email).toBe(existingUser.email);
			expect(result.data.userId).toBe(userId);
			expect(result.data.updatedAt).toBeDefined();
		}
	});

	it("should update only first name when provided", async () => {
		// Arrange
		const existingUser = UserMother.create({
			firstName: "OriginalFirstName",
			lastName: "OriginalLastName",
		});

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;
		const updateRequest = UserRequestMother.partialUpdateRequest();

		// Act
		const result = await useCase.execute(userId, updateRequest);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.firstName).toBe(updateRequest.firstName);
			expect(result.data.lastName).toBe(existingUser.lastName); // Should remain unchanged
			expect(result.data.email).toBe(existingUser.email);
		}
	});

	it("should update only last name when provided", async () => {
		// Arrange
		const existingUser = UserMother.create({
			firstName: "OriginalFirstName",
			lastName: "OriginalLastName",
		});

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;
		const updateRequest = {
			lastName: "UpdatedLastName",
		};

		// Act
		const result = await useCase.execute(userId, updateRequest);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.firstName).toBe(existingUser.firstName); // Should remain unchanged
			expect(result.data.lastName).toBe(updateRequest.lastName);
			expect(result.data.email).toBe(existingUser.email);
		}
	});

	it("should fail when user does not exist", async () => {
		// Arrange
		const nonExistentUserId = "non-existent-user-id";
		const updateRequest = UserRequestMother.validUpdateRequest();

		// Act
		const result = await useCase.execute(nonExistentUserId, updateRequest);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("User not found");
		}
	});

	it("should fail when no updates are provided", async () => {
		// Arrange
		const existingUser = UserMother.create();

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;
		const updateRequest = UserRequestMother.emptyUpdateRequest();

		// Act
		const result = await useCase.execute(userId, updateRequest);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("No updates provided");
		}
	});

	it("should fail when first name is too short", async () => {
		// Arrange
		const existingUser = UserMother.create();

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;
		const updateRequest = UserRequestMother.invalidNameRegisterRequest();

		// Act
		const result = await useCase.execute(userId, updateRequest);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe(
				"First name must be between 2 and 100 characters",
			);
		}
	});

	it("should fail when last name is too short", async () => {
		// Arrange
		const existingUser = UserMother.create();

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;
		const updateRequest = {
			lastName: "A",
		};

		// Act
		const result = await useCase.execute(userId, updateRequest);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe(
				"Last name must be between 2 and 100 characters",
			);
		}
	});

	it("should update updatedAt timestamp", async () => {
		// Arrange
		const existingUser = UserMother.create();
		const originalUpdatedAt = existingUser.updatedAt;

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;
		const updateRequest = UserRequestMother.partialUpdateRequest();

		// Add a small delay to ensure timestamp difference
		await new Promise((resolve) => setTimeout(resolve, 10));

		// Act
		const result = await useCase.execute(userId, updateRequest);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.updatedAt).toBeDefined();
			expect(result.data.updatedAt).not.toBe(originalUpdatedAt.toISOString());
		}
	});

	it("should not include sensitive information in response", async () => {
		// Arrange
		const existingUser = UserMother.create();

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;
		const updateRequest = UserRequestMother.partialUpdateRequest();

		// Act
		const result = await useCase.execute(userId, updateRequest);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			const profileData = result.data;
			expect(profileData).not.toHaveProperty("passwordHash");
			expect(profileData).toHaveProperty("userId");
			expect(profileData).toHaveProperty("email");
			expect(profileData).toHaveProperty("firstName");
			expect(profileData).toHaveProperty("lastName");
			expect(profileData).toHaveProperty("isActive");
			expect(profileData).toHaveProperty("emailVerified");
			expect(profileData).toHaveProperty("updatedAt");
		}
	});

	it("should handle repository update errors", async () => {
		// Arrange
		const existingUser = UserMother.create();

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;
		const updateRequest = UserRequestMother.partialUpdateRequest();

		// Mock repository to throw an error
		const originalUpdate = userRepository.update.bind(userRepository);
		userRepository.update = async () => {
			throw new Error("Database error");
		};

		// Act
		const result = await useCase.execute(userId, updateRequest);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Failed to update user profile");
		}

		// Restore original method
		userRepository.update = originalUpdate;
	});

	it("should handle empty user ID", async () => {
		// Arrange
		const emptyUserId = "";
		const updateRequest = UserRequestMother.validUpdateRequest();

		// Act
		const result = await useCase.execute(emptyUserId, updateRequest);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("User not found");
		}
	});
});
