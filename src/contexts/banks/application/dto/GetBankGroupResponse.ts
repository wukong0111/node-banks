import type { BankGroup } from "../../domain/BankGroup.js";

export interface GetBankGroupResponse {
	success: true;
	data: BankGroup;
}
