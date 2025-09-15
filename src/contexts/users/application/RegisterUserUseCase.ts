import type { UserRepository } from "../domain/UserRepository.js";
import type { RegisterUserRequest } from "./dto/RegisterUserRequest.js";
import type { RegisterUserResponse } from "./dto/RegisterUserResponse.js";
import { validateCreateUserRequest } from "../domain/services/UserValidator.js";
import { hash } from "../infrastructure/auth/PasswordHasher.js";
import { createSuccess, createFailure, type Result } from "../domain/Result.js";

export class RegisterUserUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(
		request: RegisterUserRequest,
	): Promise<Result<RegisterUserResponse>> {
		const validation = validateCreateUserRequest(request);
		if (!validation.isValid) {
			return createFailure(validation.errors.join(", "));
		}

		const emailExists = await this.userRepository.existsByEmail(request.email);
		if (emailExists) {
			return createFailure("Email already registered");
		}

		try {
			const passwordHash = await hash(request.password);

			const user = await this.userRepository.create({
				email: request.email,
				password: passwordHash,
				firstName: request.firstName,
				lastName: request.lastName,
			});

			const response: RegisterUserResponse = {
				userId: user.userId,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				isActive: user.isActive,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt.toISOString(),
			};

			return createSuccess(response);
		} catch (_error) {
			return createFailure("Failed to create user");
		}
	}
}
