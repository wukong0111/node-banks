import { createLogger } from "../../../shared/infrastructure/logging/LoggerFactory.js";
import { PostgresBankRepository } from "../infrastructure/PostgresBankRepository.js";
import { PostgresBankGroupRepository } from "../infrastructure/PostgresBankGroupRepository.js";
import { GetBanksUseCase } from "../application/GetBanksUseCase.js";
import { GetBankDetailsUseCase } from "../application/GetBankDetailsUseCase.js";
import { UpdateBankUseCase } from "../application/UpdateBankUseCase.js";
import { CreateBankUseCase } from "../application/CreateBankUseCase.js";
import { DeleteBankUseCase } from "../application/DeleteBankUseCase.js";
import { GetBankGroupsUseCase } from "../application/GetBankGroupsUseCase.js";
import { CreateBankGroupUseCase } from "../application/CreateBankGroupUseCase.js";
import { GetBankGroupUseCase } from "../application/GetBankGroupUseCase.js";
import { UpdateBankGroupUseCase } from "../application/UpdateBankGroupUseCase.js";

// Shared logger instance
export const logger = createLogger().withContext({ service: "BanksAPI" });

// Shared repository instances
export const bankRepository = new PostgresBankRepository();
export const bankGroupRepository = new PostgresBankGroupRepository();

// Bank use cases
export const getBanksUseCase = new GetBanksUseCase(bankRepository, logger);
export const getBankDetailsUseCase = new GetBankDetailsUseCase(
	bankRepository,
	logger,
);
export const updateBankUseCase = new UpdateBankUseCase(bankRepository, logger);
export const createBankUseCase = new CreateBankUseCase(bankRepository, logger);
export const deleteBankUseCase = new DeleteBankUseCase(bankRepository);

// Bank group use cases
export const getBankGroupsUseCase = new GetBankGroupsUseCase(
	bankGroupRepository,
	logger,
);
export const createBankGroupUseCase = new CreateBankGroupUseCase(
	bankGroupRepository,
	logger,
);
export const getBankGroupUseCase = new GetBankGroupUseCase(
	bankGroupRepository,
	logger,
);
export const updateBankGroupUseCase = new UpdateBankGroupUseCase(
	bankGroupRepository,
	logger,
);
