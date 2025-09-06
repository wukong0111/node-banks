import type { PermissionArray } from "./Permission.js";

export interface JWTClaims {
	iss: string; // service-identifier
	sub: string; // service-auth
	exp: number; // expiration timestamp
	service_type: string; // internal/external
	permissions: PermissionArray;
	environment: string; // production/test/sandbox/development
}

export interface AuthContext {
	userId: string;
	serviceType: string;
	permissions: PermissionArray;
	environment: string;
	claims: JWTClaims;
}