import type { Bank, BankEnvironmentConfig } from "../../domain/Bank.js";

export interface UpdateBankResponse {
	success: true;
	data: {
		bank: Bank;
		environment_configs: BankEnvironmentConfig[];
	};
	message: string;
}
