import { describe, it, expect, beforeEach } from "vitest";
import { GetUserProfileUseCase } from "../../../../src/contexts/users/application/GetUserProfileUseCase.js";
import { MockUserRepository } from "../infrastructure/MockUserRepository.js";
import * as UserMother from "../domain/UserMother.js";

describe("GetUserProfileUseCase", () => {
	let userRepository: MockUserRepository;
	let useCase: GetUserProfileUseCase;

	beforeEach(() => {
		userRepository = new MockUserRepository();
		useCase = new GetUserProfileUseCase(userRepository);
	});

	it("should get user profile successfully", async () => {
		// Arrange
		const existingUser = UserMother.create({
			userId: "user-123",
			email: "test@example.com",
			firstName: "John",
			lastName: "Doe",
			isActive: true,
			emailVerified: false,
		});

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const userId = existingUser.userId;

		// Act
		const result = await useCase.execute(userId);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.userId).toBe(userId);
			expect(result.data.email).toBe(existingUser.email);
			expect(result.data.firstName).toBe(existingUser.firstName);
			expect(result.data.lastName).toBe(existingUser.lastName);
			expect(result.data.isActive).toBe(existingUser.isActive);
			expect(result.data.emailVerified).toBe(existingUser.emailVerified);
			expect(result.data.createdAt).toBeDefined();
			expect(result.data.updatedAt).toBeDefined();
		}
	});

	it("should fail when user does not exist", async () => {
		// Arrange
		const nonExistentUserId = "non-existent-user-id";

		// Act
		const result = await useCase.execute(nonExistentUserId);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("User not found");
		}
	});

	it("should return profile for inactive user", async () => {
		// Arrange
		const inactiveUser = UserMother.inactive();

		await userRepository.create({
			userId: inactiveUser.userId,
			email: inactiveUser.email,
			password: inactiveUser.passwordHash,
			firstName: inactiveUser.firstName,
			lastName: inactiveUser.lastName,
			isActive: inactiveUser.isActive,
		});

		// Set user as inactive
		userRepository.setUserInactive(inactiveUser.userId);

		const userId = inactiveUser.userId;

		// Act
		const result = await useCase.execute(userId);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.userId).toBe(userId);
			expect(result.data.isActive).toBe(false);
		}
	});

	it("should return profile for verified user", async () => {
		// Arrange
		const verifiedUser = UserMother.create({
			emailVerified: true,
		});

		await userRepository.create({
			userId: verifiedUser.userId,
			email: verifiedUser.email,
			password: verifiedUser.passwordHash,
			firstName: verifiedUser.firstName,
			lastName: verifiedUser.lastName,
			emailVerified: verifiedUser.emailVerified,
		});

		const userId = verifiedUser.userId;

		// Act
		const result = await useCase.execute(userId);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.userId).toBe(userId);
			expect(result.data.emailVerified).toBe(true);
		}
	});

	it("should return dates in ISO string format", async () => {
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

		// Act
		const result = await useCase.execute(userId);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(typeof result.data.createdAt).toBe("string");
			expect(typeof result.data.updatedAt).toBe("string");

			// Verify they are valid ISO date strings
			expect(() => new Date(result.data.createdAt)).not.toThrow();
			expect(() => new Date(result.data.updatedAt)).not.toThrow();
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

		// Act
		const result = await useCase.execute(userId);

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
			expect(profileData).toHaveProperty("createdAt");
			expect(profileData).toHaveProperty("updatedAt");
		}
	});

	it("should handle empty user ID", async () => {
		// Arrange
		const emptyUserId = "";

		// Act
		const result = await useCase.execute(emptyUserId);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("User not found");
		}
	});

	it("should handle null user ID", async () => {
		// Arrange
		const nullUserId = null as unknown as string;

		// Act
		const result = await useCase.execute(nullUserId);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("User not found");
		}
	});
});
