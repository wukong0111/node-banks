import type { BankGroup } from "../../domain/BankGroup.js";

export interface CreateBankGroupResponse {
	success: true;
	data: BankGroup;
	message: string;
}
