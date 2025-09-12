import type {
	BankEnvironmentConfigRequest,
	Environment,
} from "../../domain/Bank.js";

export interface CreateBankBaseRequest {
	bank_id: string;
	name: string;
	bank_codes: string[];
	api: string;
	api_version: string;
	aspsp: string;
	country: string;
	auth_type_choice_required: boolean;
	bic?: string | null;
	real_name?: string | null;
	product_code?: string | null;
	bank_group_id?: string | null;
	logo_url?: string | null;
	documentation?: string | null;
	keywords?: Record<string, unknown> | null;
	attribute?: Record<string, unknown> | null;
}

export interface CreateBankWithEnvironmentsRequest
	extends CreateBankBaseRequest {
	environments: Environment[];
	configuration: BankEnvironmentConfigRequest;
}

export interface CreateBankWithConfigurationsRequest
	extends CreateBankBaseRequest {
	configurations: Record<string, BankEnvironmentConfigRequest>;
}

export type CreateBankRequest =
	| CreateBankWithEnvironmentsRequest
	| CreateBankWithConfigurationsRequest;
