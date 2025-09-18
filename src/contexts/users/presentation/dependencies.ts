import { PostgresUserRepository } from "../infrastructure/PostgresUserRepository.js";
import { RegisterUserUseCase } from "../application/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../application/LoginUserUseCase.js";
import { GetUserProfileUseCase } from "../application/GetUserProfileUseCase.js";
import { UpdateUserProfileUseCase } from "../application/UpdateUserProfileUseCase.js";
import { JWTService } from "../../../shared/infrastructure/auth/JWTService.js";
import { createLogger } from "../../../shared/infrastructure/logging/LoggerFactory.js";

const userRepository = new PostgresUserRepository();
const jwtService = JWTService.getInstance();
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
