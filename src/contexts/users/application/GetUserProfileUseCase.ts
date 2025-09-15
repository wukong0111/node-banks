import type { UserRepository } from "../domain/UserRepository.js";
import type { GetUserProfileResponse } from "./dto/GetUserProfileResponse.js";
import { createSuccess, createFailure, type Result } from "../domain/Result.js";

export class GetUserProfileUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(userId: string): Promise<Result<GetUserProfileResponse>> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			return createFailure("User not found");
		}

		const response: GetUserProfileResponse = {
			userId: user.userId,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			isActive: user.isActive,
			emailVerified: user.emailVerified,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		};

		return createSuccess(response);
	}
}
