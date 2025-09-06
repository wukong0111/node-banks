import type { ApiResponse, BankWithEnvironment, BankWithEnvironments } from "../../domain/Bank.js";

export type GetBankDetailsResponse = ApiResponse<BankWithEnvironment | BankWithEnvironments>;