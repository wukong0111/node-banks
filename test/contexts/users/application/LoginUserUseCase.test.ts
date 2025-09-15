import { describe, it, expect, beforeEach } from "vitest";
import { LoginUserUseCase } from "../../../../src/contexts/users/application/LoginUserUseCase.js";
import { MockUserRepository } from "../infrastructure/MockUserRepository.js";
import { UserRequestMother } from "../domain/UserRequestMother.js";
import { UserMother } from "../domain/UserMother.js";
import { PasswordHasher } from "../../../../src/contexts/users/infrastructure/auth/PasswordHasher.js";

describe("LoginUserUseCase", () => {
	let userRepository: MockUserRepository;
	let mockJwtService: { sign: (payload: object) => Promise<string> };
	let useCase: LoginUserUseCase;

	beforeEach(() => {
		userRepository = new MockUserRepository();
		mockJwtService = {
			sign: async (payload: object) =>
				`mock-jwt-token-${JSON.stringify(payload)}`,
		};
		useCase = new LoginUserUseCase(userRepository, mockJwtService);
	});

	it("should login successfully with valid credentials", async () => {
		// Arrange
		const plainPassword = "ValidPass123";
		const hashedPassword = await PasswordHasher.hash(plainPassword);

		const existingUser = UserMother.create({
			email: "test@example.com",
			passwordHash: hashedPassword,
			firstName: "John",
			lastName: "Doe",
		});

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const request = UserRequestMother.validLoginRequest();
		request.email = existingUser.email;
		request.password = plainPassword;

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.token).toBeDefined();
			expect(result.data.token).toContain("mock-jwt-token");
			expect(result.data.user.email).toBe(existingUser.email);
			expect(result.data.user.firstName).toBe(existingUser.firstName);
			expect(result.data.user.lastName).toBe(existingUser.lastName);
			expect(result.data.user.userId).toBe(existingUser.userId);
		}
	});

	it("should fail when user does not exist", async () => {
		// Arrange
		const request = UserRequestMother.invalidLoginRequest();

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Invalid email or password");
		}
	});

	it("should fail when password is incorrect", async () => {
		// Arrange
		const plainPassword = "ValidPass123";
		const hashedPassword = await PasswordHasher.hash(plainPassword);

		const existingUser = UserMother.create({
			email: "test@example.com",
			passwordHash: hashedPassword,
		});

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const request = UserRequestMother.validLoginRequest();
		request.email = existingUser.email;
		request.password = "WrongPassword123";

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Invalid email or password");
		}
	});

	it("should fail when user account is deactivated", async () => {
		// Arrange
		const plainPassword = "ValidPass123";
		const hashedPassword = await PasswordHasher.hash(plainPassword);

		const existingUser = UserMother.create({
			isActive: false,
		});
		existingUser.passwordHash = hashedPassword;

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		// Set user as inactive
		userRepository.setUserInactive(existingUser.userId);

		const request = UserRequestMother.validLoginRequest();
		request.email = existingUser.email;
		request.password = plainPassword;

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Account is deactivated");
		}
	});

	it("should generate JWT token with correct payload", async () => {
		// Arrange
		const plainPassword = "ValidPass123";
		const hashedPassword = await PasswordHasher.hash(plainPassword);

		const existingUser = UserMother.create({
			email: "test@example.com",
			passwordHash: hashedPassword,
		});

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const request = UserRequestMother.validLoginRequest();
		request.email = existingUser.email;
		request.password = plainPassword;

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			const tokenPayload = JSON.parse(
				result.data.token.replace("mock-jwt-token-", ""),
			);
			expect(tokenPayload.userId).toBe(existingUser.userId);
			expect(tokenPayload.email).toBe(existingUser.email);
		}
	});

	it("should handle JWT service errors", async () => {
		// Arrange
		const plainPassword = "ValidPass123";
		const hashedPassword = await PasswordHasher.hash(plainPassword);

		const existingUser = UserMother.create({
			email: "test@example.com",
			passwordHash: hashedPassword,
		});

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		// Mock JWT service to throw an error
		const errorJwtService = {
			sign: async () => {
				throw new Error("JWT service error");
			},
		};

		const errorUseCase = new LoginUserUseCase(userRepository, errorJwtService);

		const request = UserRequestMother.validLoginRequest();
		request.email = existingUser.email;
		request.password = plainPassword;

		// Act
		const result = await errorUseCase.execute(request);

		// Assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Failed to generate authentication token");
		}
	});

	it("should return user data without sensitive information", async () => {
		// Arrange
		const plainPassword = "ValidPass123";
		const hashedPassword = await PasswordHasher.hash(plainPassword);

		const existingUser = UserMother.create({
			email: "test@example.com",
			passwordHash: hashedPassword,
		});

		await userRepository.create({
			userId: existingUser.userId,
			email: existingUser.email,
			password: existingUser.passwordHash,
			firstName: existingUser.firstName,
			lastName: existingUser.lastName,
		});

		const request = UserRequestMother.validLoginRequest();
		request.email = existingUser.email;
		request.password = plainPassword;

		// Act
		const result = await useCase.execute(request);

		// Assert
		expect(result.success).toBe(true);
		if (result.success) {
			const userData = result.data.user;
			expect(userData).not.toHaveProperty("passwordHash");
			expect(userData).not.toHaveProperty("isActive");
			expect(userData).not.toHaveProperty("emailVerified");
			expect(userData).not.toHaveProperty("createdAt");
			expect(userData).not.toHaveProperty("updatedAt");
			expect(userData).toHaveProperty("userId");
			expect(userData).toHaveProperty("email");
			expect(userData).toHaveProperty("firstName");
			expect(userData).toHaveProperty("lastName");
		}
	});
});
