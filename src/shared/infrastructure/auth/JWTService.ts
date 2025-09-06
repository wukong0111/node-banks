import { jwtVerify, SignJWT, type JWTVerifyOptions } from "jose";
import type { JWTClaims, AuthContext } from "../../domain/auth/JWTClaims.js";
import type { Permission } from "../../domain/auth/Permission.js";
import { getJWTConfig } from "../config/JWTConfig.js";

export class JWTService {
	private static instance: JWTService;
	private readonly config = getJWTConfig();
	private readonly secretKey = new TextEncoder().encode(this.config.secret);

	private constructor() {}

	public static getInstance(): JWTService {
		if (!JWTService.instance) {
			JWTService.instance = new JWTService();
		}
		return JWTService.instance;
	}

	public async verifyToken(token: string): Promise<JWTClaims> {
		try {
			const { payload } = await jwtVerify(token, this.secretKey, {
				issuer: this.config.issuer,
				algorithms: [this.config.algorithm]
			} as JWTVerifyOptions);

			// Validate required claims structure
			if (!payload.iss || !payload.sub || !payload.exp || !payload.service_type || !payload.permissions || !payload.environment) {
				throw new Error("Invalid JWT claims structure");
			}

			return {
				iss: payload.iss as string,
				sub: payload.sub as string,
				exp: payload.exp as number,
				service_type: payload.service_type as string,
				permissions: payload.permissions as Permission[],
				environment: payload.environment as string
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown JWT verification error";
			throw new Error(`JWT verification failed: ${errorMessage}`);
		}
	}

	public createAuthContext(claims: JWTClaims): AuthContext {
		return {
			userId: claims.sub,
			serviceType: claims.service_type,
			permissions: claims.permissions,
			environment: claims.environment,
			claims
		};
	}

	public hasPermission(context: AuthContext, requiredPermission: Permission): boolean {
		return context.permissions.includes(requiredPermission);
	}

	public hasAnyPermission(context: AuthContext, requiredPermissions: Permission[]): boolean {
		return requiredPermissions.some(permission => context.permissions.includes(permission));
	}

	public hasAllPermissions(context: AuthContext, requiredPermissions: Permission[]): boolean {
		return requiredPermissions.every(permission => context.permissions.includes(permission));
	}

	// Utility method to generate tokens for testing (should be in a separate service in production)
	public async generateToken(claims: Omit<JWTClaims, "exp">): Promise<string> {
		const jwt = new SignJWT({ ...claims })
			.setProtectedHeader({ alg: this.config.algorithm })
			.setIssuedAt()
			.setIssuer(this.config.issuer)
			.setExpirationTime(this.config.expirationTime);

		if (this.config.audience) {
			jwt.setAudience(this.config.audience);
		}

		return await jwt.sign(this.secretKey);
	}
}