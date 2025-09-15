export interface LoginUserResponse {
	token: string;
	user: {
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
	};
}
