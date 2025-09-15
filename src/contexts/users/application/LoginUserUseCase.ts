import type { UserRepository } from "../domain/UserRepository.js";
import type { LoginUserRequest } from "./dto/LoginUserRequest.js";
import type { LoginUserResponse } from "./dto/LoginUserResponse.js";
import { compare } from "../infrastructure/auth/PasswordHasher.js";
import { createSuccess, createFailure, type Result } from "../domain/Result.js";
import type { JWTPayload } from "jose";

export class LoginUserUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: {
			sign: (payload: JWTPayload) => Promise<string>;
		},
	) {}

	async execute(request: LoginUserRequest): Promise<Result<LoginUserResponse>> {
		const user = await this.userRepository.findByEmail(request.email);
		if (!user) {
			return createFailure("Invalid email or password");
		}

		if (!user.isActive) {
			return createFailure("Account is deactivated");
		}

		const isPasswordValid = await compare(request.password, user.passwordHash);
		if (!isPasswordValid) {
			return createFailure("Invalid email or password");
		}

		try {
			const token = await this.jwtService.sign({
				userId: user.userId,
				email: user.email,
			});

			const response: LoginUserResponse = {
				token,
				user: {
					userId: user.userId,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
				},
			};

			return createSuccess(response);
		} catch (_error) {
			return createFailure("Failed to generate authentication token");
		}
	}
}
