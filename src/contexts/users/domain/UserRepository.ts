import type { User, CreateUserRequest, UpdateUserRequest } from "./User.js";

export interface UserRepository {
	findByEmail(email: string): Promise<User | null>;
	findById(userId: string): Promise<User | null>;
	create(user: CreateUserRequest): Promise<User>;
	update(userId: string, updates: UpdateUserRequest): Promise<User | null>;
	delete(userId: string): Promise<boolean>;
	existsByEmail(email: string): Promise<boolean>;
}
