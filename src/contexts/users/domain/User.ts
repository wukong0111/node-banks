export interface User {
	userId: string;
	email: string;
	passwordHash: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateUserRequest {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

export interface UpdateUserRequest {
	firstName?: string;
	lastName?: string;
}

export interface UserProfile {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
	emailVerified: boolean;
	createdAt: Date;
}
