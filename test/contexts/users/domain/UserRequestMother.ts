import type { RegisterUserRequest } from "../../../../src/contexts/users/application/dto/RegisterUserRequest.js";
import type { LoginUserRequest } from "../../../../src/contexts/users/application/dto/LoginUserRequest.js";
import type { UpdateUserProfileRequest } from "../../../../src/contexts/users/application/dto/UpdateUserProfileRequest.js";

export function validRegisterRequest(): RegisterUserRequest {
	return {
		email: "newuser@example.com",
		password: "ValidPass123",
		firstName: "Jane",
		lastName: "Smith",
	};
}

export function invalidEmailRegisterRequest(): RegisterUserRequest {
	return {
		email: "invalid-email",
		password: "ValidPass123",
		firstName: "Jane",
		lastName: "Smith",
	};
}

export function invalidPasswordRegisterRequest(): RegisterUserRequest {
	return {
		email: "newuser@example.com",
		password: "weak",
		firstName: "Jane",
		lastName: "Smith",
	};
}

export function invalidNameRegisterRequest(): RegisterUserRequest {
	return {
		email: "newuser@example.com",
		password: "ValidPass123",
		firstName: "A",
		lastName: "Smith",
	};
}

export function validLoginRequest(): LoginUserRequest {
	return {
		email: "test@example.com",
		password: "ValidPass123",
	};
}

export function invalidEmailLoginRequest(): LoginUserRequest {
	return {
		email: "invalid-email",
		password: "ValidPass123",
	};
}

export function invalidPasswordLoginRequest(): LoginUserRequest {
	return {
		email: "test@example.com",
		password: "wrongpassword",
	};
}

export function validUpdateRequest(): UpdateUserProfileRequest {
	return {
		firstName: "Updated",
		lastName: "Name",
	};
}

export function partialUpdateRequest(): UpdateUserProfileRequest {
	return {
		firstName: "Updated",
	};
}

export function emptyUpdateRequest(): UpdateUserProfileRequest {
	return {};
}
