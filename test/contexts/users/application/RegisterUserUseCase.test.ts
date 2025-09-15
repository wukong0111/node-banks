import { describe, it, expect, beforeEach } from "vitest";
import { RegisterUserUseCase } from "../../../../src/contexts/users/application/RegisterUserUseCase.js";
import { MockUserRepository } from "../infrastructure/MockUserRepository.js";
import { UserRequestMother } from "../domain/UserRequestMother.js";
import { UserMother } from "../domain/UserMother.js";
import { PasswordHasher } from "../../../../src/contexts/users/infrastructure/auth/PasswordHasher.js";

describe("RegisterUserUseCase", () => {
	let userRepository: MockUserRepository;
	let useCase: RegisterUserUseCase;

	beforeEach(() => {
		userRepository = new MockUserRepository();
		useCase = new RegisterUserUseCase(userRepository);
	});

	it("should register a new user successfully", async () => {
		// Arrange
		const request = UserRequestMother.validRegisterRequest();

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.email).toBe(request.email);
			expect(result.data.firstName).toBe(request.firstName);
			expect(result.data.lastName).toBe(request.lastName);
			expect(result.data.isActive).toBe(true);
			expect(result.data.emailVerified).toBe(false);
			expect(result.data.userId).toBeDefined();
			expect(result.data.createdAt).toBeDefined();
		}
	});

	it("should fail when email is invalid", async () => {
		// Arrange
		const request = UserRequestMother.invalidEmailRegisterRequest();

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain("Invalid email format");
		}
	});

	it("should fail when password is too weak", async () => {
		// Arrange
		const request = UserRequestMother.weakPasswordRegisterRequest();

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain(
				"Password must be at least 8 characters long",
			);
		}
	});

	it("should fail when first name is too short", async () => {
		// Arrange
		const request = UserRequestMother.shortNameRegisterRequest();

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain(
				"First name must be between 2 and 100 characters",
			);
		}
	});

	it("should fail when email already exists", async () => {
		// Arrange
		const existingUser = UserMother.random();
		await userRepository.create({
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const request = UserRequestMother.validRegisterRequest();
		request.email = existingUser.email;

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Email already registered");
		}
	});

	it("should hash password when creating user", async () => {
		// Arrange
		const request = UserRequestMother.validRegisterRequest();
		const plainPassword = request.password;

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			// Verify the user was created in the repository
			const createdUser = await userRepository.findByEmail(request.email);
			expect(createdUser).toBeTruthy();
			expect(createdUser!.passwordHash).not.toBe(plainPassword);
			expect(createdUser!.passwordHash).toContain("."); // Hashed password contains salt

			// Verify the password can be verified
			const isValid = await PasswordHasher.compare(
				plainPassword,
				createdUser!.passwordHash,
			);
			expect(isValid).toBe(true);
		}
	});

	it("should create user with default values", async () => {
		// Arrange
		const request = UserRequestMother.validRegisterRequest();

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isActive).toBe(true);
			expect(result.data.emailVerified).toBe(false);
		}
	});

	it("should handle repository creation errors", async () => {
		// Arrange
		const request = UserRequestMother.validRegisterRequest();

		// Mock repository to throw an error
		const originalCreate = userRepository.create.bind(userRepository);
		userRepository.create = async () => {
			throw new Error("Database error");
		};

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Failed to create user");
		}

		// Restore original method
		userRepository.create = originalCreate;
	});
});
