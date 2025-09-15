import type { User } from "../../../../src/contexts/users/domain/User.js";

export class UserMother {
	static create(overrides: Partial<User> = {}): User {
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

	static inactive(): User {
		return UserMother.create({ isActive: false });
	}

	static verified(): User {
		return UserMother.create({ emailVerified: true });
	}

	static withEmail(email: string): User {
		return UserMother.create({ email });
	}

	static withId(userId: string): User {
		return UserMother.create({ userId });
	}

	static random(): User {
		const randomId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
		const randomEmail = `user-${Math.random().toString(36).substring(2, 8)}@example.com`;
		const randomFirstName = `FirstName${Math.floor(Math.random() * 1000)}`;
		const randomLastName = `LastName${Math.floor(Math.random() * 1000)}`;

		return UserMother.create({
			userId: randomId,
			email: randomEmail,
			firstName: randomFirstName,
			lastName: randomLastName,
		});
	}
}
