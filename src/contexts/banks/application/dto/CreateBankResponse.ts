import type { Bank, BankEnvironmentConfig } from "../../domain/Bank.js";

export interface CreateBankResponse {
	success: true;
	data: {
		bank: Bank;
		environment_configs: BankEnvironmentConfig[];
	};
	message: string;
}
