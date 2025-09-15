export interface RegisterUserResponse {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
	emailVerified: boolean;
	createdAt: string;
}
