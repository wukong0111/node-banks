export interface JWTConfig {
	secret: string;
	algorithm: string;
	issuer: string;
	audience?: string;
	expirationTime: string;
}

export const getJWTConfig = (): JWTConfig => {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET environment variable is required");
	}

	return {
		secret,
		algorithm: process.env.JWT_ALGORITHM || "HS256",
		issuer: process.env.JWT_ISSUER || "bank-service",
		audience: process.env.JWT_AUDIENCE,
		expirationTime: process.env.JWT_EXPIRATION || "24h"
	};
};