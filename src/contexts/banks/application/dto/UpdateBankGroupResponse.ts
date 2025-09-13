import type { BankGroup } from "../../domain/BankGroup.js";

export interface UpdateBankGroupResponse {
	success: true;
	data: BankGroup;
	message: string;
}
