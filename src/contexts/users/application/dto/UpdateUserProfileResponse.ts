export interface UpdateUserProfileResponse {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
	emailVerified: boolean;
	updatedAt: string;
}
