import type { User } from "../../../../src/contexts/users/domain/User.js";

export function create(overrides: Partial<User> = {}): User {
	const now = new Date();
	const defaultUser: User = {
		userId: "user-123",
		email: "test@example.com",
		passwordHash: "hashed-password",
		firstName: "John",
		lastName: "Doe",
		isActive: true,
		emailVerified: false,
		createdAt: now,
		updatedAt: now,
	};

	return { ...defaultUser, ...overrides };
}

export function withEmail(email: string): User {
	return create({ email });
}

export function withPassword(passwordHash: string): User {
	return create({ passwordHash });
}

export function active(): User {
	return create({ isActive: true, emailVerified: true });
}

export function inactive(): User {
	return create({ isActive: false });
}

export function verified(): User {
	return create({ emailVerified: true });
}
