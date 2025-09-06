import type { Environment } from "../../domain/Bank.js";

export interface GetBankDetailsRequest {
	bankId: string;
	env?: Environment;
}