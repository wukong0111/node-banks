import type { UserRepository } from "../domain/UserRepository.js";
import type { UpdateUserProfileRequest } from "./dto/UpdateUserProfileRequest.js";
import type { UpdateUserProfileResponse } from "./dto/UpdateUserProfileResponse.js";
import { validateName } from "../domain/services/UserValidator.js";
import { createSuccess, createFailure, type Result } from "../domain/Result.js";

export class UpdateUserProfileUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(
		userId: string,
		request: UpdateUserProfileRequest,
	): Promise<Result<UpdateUserProfileResponse>> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			return createFailure("User not found");
		}

		const updates: Partial<{
			firstName: string;
			lastName: string;
		}> = {};

		if (request.firstName !== undefined) {
			if (!validateName(request.firstName)) {
				return createFailure("First name must be between 2 and 100 characters");
			}
			updates.firstName = request.firstName;
		}

		if (request.lastName !== undefined) {
			if (!validateName(request.lastName)) {
				return createFailure("Last name must be between 2 and 100 characters");
			}
			updates.lastName = request.lastName;
		}

		if (Object.keys(updates).length === 0) {
			return createFailure("No updates provided");
		}

		try {
			const updatedUser = await this.userRepository.update(userId, updates);
			if (!updatedUser) {
				return createFailure("Failed to update user");
			}

			const response: UpdateUserProfileResponse = {
				userId: updatedUser.userId,
				email: updatedUser.email,
				firstName: updatedUser.firstName,
				lastName: updatedUser.lastName,
				isActive: updatedUser.isActive,
				emailVerified: updatedUser.emailVerified,
				updatedAt: updatedUser.updatedAt.toISOString(),
			};

			return createSuccess(response);
		} catch (_error) {
			return createFailure("Failed to update user profile");
		}
	}
}
