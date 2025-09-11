export type Environment = "production" | "test" | "sandbox" | "development";

export interface BankEnvironmentConfig {
	environment: Environment;
	enabled: number; // 0 or 1
	blocked: boolean;
	risky: boolean;
	app_auth_setup_required: boolean;
	blocked_text?: string | null;
	risky_message?: string | null;
	supports_instant_payments?: boolean | null;
	instant_payments_activated?: boolean | null;
	instant_payments_limit?: number | null;
	ok_status_codes_simple_payment?: object | null;
	ok_status_codes_instant_payment?: object | null;
	ok_status_codes_periodic_payment?: object | null;
	enabled_periodic_payment?: boolean | null;
	frequency_periodic_payment?: string | null;
	config_periodic_payment?: string | null;
}

export interface BankEnvironmentConfigRequest {
	enabled?: number; // 0 or 1
	blocked?: boolean;
	risky?: boolean;
	app_auth_setup_required?: boolean;
	blocked_text?: string | null;
	risky_message?: string | null;
	supports_instant_payments?: boolean | null;
	instant_payments_activated?: boolean | null;
	instant_payments_limit?: number | null;
	ok_status_codes_simple_payment?: object | null;
	ok_status_codes_instant_payment?: object | null;
	ok_status_codes_periodic_payment?: object | null;
	enabled_periodic_payment?: boolean | null;
	frequency_periodic_payment?: string | null;
	config_periodic_payment?: string | null;
}

export interface Bank {
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
	keywords?: object | null;
	attribute?: object | null;
}

export interface BankWithEnvironment extends Bank {
	environment_config: BankEnvironmentConfig;
}

export interface BankWithEnvironments extends Bank {
	environment_configs: Record<Environment, BankEnvironmentConfig>;
}

export interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	timestamp?: string;
}

export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T> {
	pagination: Pagination;
}

export interface BankFilters {
	env?: Environment | "all";
	name?: string;
	api?: string;
	country?: string;
	page?: number;
	limit?: number;
}
