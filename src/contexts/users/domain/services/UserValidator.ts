import type { CreateUserRequest } from "../User.js";

export class UserValidator {
	static validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	static validatePassword(password: string): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (password.length < 8) {
			errors.push("Password must be at least 8 characters long");
		}

		if (!/[A-Z]/.test(password)) {
			errors.push("Password must contain at least one uppercase letter");
		}

		if (!/[a-z]/.test(password)) {
			errors.push("Password must contain at least one lowercase letter");
		}

		if (!/\d/.test(password)) {
			errors.push("Password must contain at least one number");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	static validateName(name: string): boolean {
		return name.trim().length >= 2 && name.trim().length <= 100;
	}

	static validateCreateUserRequest(request: CreateUserRequest): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (!UserValidator.validateEmail(request.email)) {
			errors.push("Invalid email format");
		}

		const passwordValidation = UserValidator.validatePassword(request.password);
		if (!passwordValidation.isValid) {
			errors.push(...passwordValidation.errors);
		}

		if (!UserValidator.validateName(request.firstName)) {
			errors.push("First name must be between 2 and 100 characters");
		}

		if (!UserValidator.validateName(request.lastName)) {
			errors.push("Last name must be between 2 and 100 characters");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}
}
