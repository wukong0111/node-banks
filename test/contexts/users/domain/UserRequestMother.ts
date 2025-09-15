import type { CreateUserRequest } from "../../../../src/contexts/users/domain/User.js";
import type { RegisterUserRequest } from "../../../../src/contexts/users/application/dto/RegisterUserRequest.js";
import type { LoginUserRequest } from "../../../../src/contexts/users/application/dto/LoginUserRequest.js";
import type { UpdateUserProfileRequest } from "../../../../src/contexts/users/application/dto/UpdateUserProfileRequest.js";

export class UserRequestMother {
	static validRegisterRequest(): RegisterUserRequest {
		return {
			email: "newuser@example.com",
			password: "ValidPass123",
			firstName: "Jane",
			lastName: "Smith",
		};
	}

	static invalidEmailRegisterRequest(): RegisterUserRequest {
		return {
			email: "invalid-email",
			password: "ValidPass123",
			firstName: "Jane",
			lastName: "Smith",
		};
	}

	static weakPasswordRegisterRequest(): RegisterUserRequest {
		return {
			email: "newuser@example.com",
			password: "weak",
			firstName: "Jane",
			lastName: "Smith",
		};
	}

	static shortNameRegisterRequest(): RegisterUserRequest {
		return {
			email: "newuser@example.com",
			password: "ValidPass123",
			firstName: "A",
			lastName: "Smith",
		};
	}

	static validLoginRequest(): LoginUserRequest {
		return {
			email: "existinguser@example.com",
			password: "ValidPass123",
		};
	}

	static invalidLoginRequest(): LoginUserRequest {
		return {
			email: "nonexistent@example.com",
			password: "WrongPass123",
		};
	}

	static validUpdateRequest(): UpdateUserProfileRequest {
		return {
			firstName: "UpdatedFirstName",
			lastName: "UpdatedLastName",
		};
	}

	static partialUpdateRequest(): UpdateUserProfileRequest {
		return {
			firstName: "UpdatedFirstName",
		};
	}

	static emptyUpdateRequest(): UpdateUserProfileRequest {
		return {};
	}

	static shortNameUpdateRequest(): UpdateUserProfileRequest {
		return {
			firstName: "A",
		};
	}

	static toCreateUserRequest(
		registerRequest: RegisterUserRequest,
	): CreateUserRequest {
		return {
			email: registerRequest.email,
			password: registerRequest.password,
			firstName: registerRequest.firstName,
			lastName: registerRequest.lastName,
		};
	}
}
