import type { UserRepository } from "../../../../src/contexts/users/domain/UserRepository.js";
import type {
	User,
	CreateUserRequest,
	UpdateUserRequest,
} from "../../../../src/contexts/users/domain/User.js";

export class MockUserRepository implements UserRepository {
	private users: Map<string, User> = new Map();
	private emailIndex: Map<string, string> = new Map();

	async findByEmail(email: string): Promise<User | null> {
		const userId = this.emailIndex.get(email);
		if (!userId) {
			return null;
		}
		return this.users.get(userId) || null;
	}

	async findById(userId: string): Promise<User | null> {
		return this.users.get(userId) || null;
	}

	async create(
		request: CreateUserRequest & {
			userId?: string;
			emailVerified?: boolean;
			isActive?: boolean;
		},
	): Promise<User> {
		const userId =
			request.userId ||
			`user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
		const now = new Date();

		const user: User = {
			userId,
			email: request.email,
			passwordHash: request.password,
			firstName: request.firstName,
			lastName: request.lastName,
			isActive: request.isActive ?? true,
			emailVerified: request.emailVerified ?? false,
			createdAt: now,
			updatedAt: now,
		};

		this.users.set(userId, user);
		this.emailIndex.set(request.email, userId);

		return user;
	}

	async update(
		userId: string,
		updates: UpdateUserRequest,
	): Promise<User | null> {
		const user = this.users.get(userId);
		if (!user) {
			return null;
		}

		const updatedUser: User = {
			...user,
			...updates,
			updatedAt: new Date(),
		};

		this.users.set(userId, updatedUser);

		return updatedUser;
	}

	async delete(userId: string): Promise<boolean> {
		const user = this.users.get(userId);
		if (!user) {
			return false;
		}

		this.users.delete(userId);
		this.emailIndex.delete(user.email);

		return true;
	}

	async existsByEmail(email: string): Promise<boolean> {
		return this.emailIndex.has(email);
	}

	// Helper methods for testing
	reset(): void {
		this.users.clear();
		this.emailIndex.clear();
	}

	getAllUsers(): User[] {
		return Array.from(this.users.values());
	}

	setUserInactive(userId: string): void {
		const user = this.users.get(userId);
		if (user) {
			const updatedUser = {
				...user,
				isActive: false,
				updatedAt: new Date(),
			};
			this.users.set(userId, updatedUser);
		}
	}
}
