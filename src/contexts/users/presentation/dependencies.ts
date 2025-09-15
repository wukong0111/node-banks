import { PostgresUserRepository } from "../infrastructure/PostgresUserRepository.js";
import { RegisterUserUseCase } from "../application/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../application/LoginUserUseCase.js";
import { GetUserProfileUseCase } from "../application/GetUserProfileUseCase.js";
import { UpdateUserProfileUseCase } from "../application/UpdateUserProfileUseCase.js";
import { SignJWT } from "jose";
import { getJWTConfig } from "../../../shared/infrastructure/config/JWTConfig.js";

// Create a simple JWT service wrapper for user authentication
class UserJWTService {
	private readonly config = getJWTConfig();
	private readonly secretKey = new TextEncoder().encode(this.config.secret);

	async sign(payload: Record<string, any>): Promise<string> {
		const jwt = new SignJWT(payload)
			.setProtectedHeader({ alg: this.config.algorithm })
			.setIssuedAt()
			.setIssuer(this.config.issuer)
			.setExpirationTime("24h");

		if (this.config.audience) {
			jwt.setAudience(this.config.audience);
		}

		return await jwt.sign(this.secretKey);
	}
}
import { createLogger } from "../../../shared/infrastructure/logging/LoggerFactory.js";

const userRepository = new PostgresUserRepository();
const jwtService = new UserJWTService();
const logger = createLogger().withContext({ service: "UsersService" });

export const registerUserUseCase = new RegisterUserUseCase(userRepository);
export const loginUserUseCase = new LoginUserUseCase(
	userRepository,
	jwtService,
);
export const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
export const updateUserProfileUseCase = new UpdateUserProfileUseCase(
	userRepository,
);

export const deps = {
	registerUserUseCase,
	loginUserUseCase,
	getUserProfileUseCase,
	updateUserProfileUseCase,
	logger,
};
