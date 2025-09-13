import type { Environment, BankFilters } from "../Bank.js";
import type { GetBanksRequest } from "../../application/dto/GetBanksRequest.js";
import type {
	CreateBankRequest,
	CreateBankWithEnvironmentsRequest,
	CreateBankWithConfigurationsRequest,
} from "../../application/dto/CreateBankRequest.js";
import type { CreateBankGroupRequest } from "../../application/dto/CreateBankGroupRequest.js";
import type { UpdateBankGroupRequest } from "../../application/dto/UpdateBankGroupRequest.js";
import type { DeleteBankRequest } from "../../application/dto/DeleteBankRequest.js";
import { type Result, createSuccess, createFailure } from "../Result.js";

const VALID_ENVIRONMENTS = [
	"production",
	"test",
	"sandbox",
	"development",
	"all",
] as const;

export function validateBankRequest(
	request: GetBanksRequest,
): Result<BankFilters> {
	const errors: string[] = [];

	// Validate environment parameter
	let env: Environment | "all" | undefined;
	if (request.env !== undefined) {
		if (
			!VALID_ENVIRONMENTS.includes(
				request.env as (typeof VALID_ENVIRONMENTS)[number],
			)
		) {
			errors.push(
				`Invalid environment parameter. Must be one of: ${VALID_ENVIRONMENTS.join(", ")}`,
			);
		} else {
			env = request.env as Environment | "all";
		}
	}

	// Validate and parse page parameter
	let page: number | undefined;
	if (request.page !== undefined) {
		const parsedPage = parseInt(request.page, 10);
		if (Number.isNaN(parsedPage) || parsedPage < 1) {
			errors.push("Page parameter must be a positive integer");
		} else {
			page = parsedPage;
		}
	}

	// Validate and parse limit parameter
	let limit: number | undefined;
	if (request.limit !== undefined) {
		const parsedLimit = parseInt(request.limit, 10);
		if (Number.isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
			errors.push(
				"Limit parameter must be a positive integer between 1 and 100",
			);
		} else {
			limit = parsedLimit;
		}
	}

	// Return first error if any validation failed
	if (errors.length > 0) {
		return createFailure(errors[0]);
	}

	// Build validated filters
	const validatedFilters: BankFilters = {
		env,
		name: request.name,
		api: request.api,
		country: request.country,
		page,
		limit,
	};

	return createSuccess(validatedFilters);
}

export function validateCreateBankRequest(
	request: CreateBankRequest,
): Result<CreateBankRequest> {
	const errors: string[] = [];

	// Validate required fields
	if (
		!request.bank_id ||
		typeof request.bank_id !== "string" ||
		request.bank_id.trim() === ""
	) {
		errors.push("bank_id is required and must be a non-empty string");
	}

	if (
		!request.name ||
		typeof request.name !== "string" ||
		request.name.trim() === ""
	) {
		errors.push("name is required and must be a non-empty string");
	}

	if (!Array.isArray(request.bank_codes) || request.bank_codes.length === 0) {
		errors.push(
			"bank_codes is required and must be a non-empty array of strings",
		);
	} else {
		for (const code of request.bank_codes) {
			if (typeof code !== "string" || code.trim() === "") {
				errors.push("All bank_codes must be non-empty strings");
				break;
			}
		}
	}

	if (
		!request.api ||
		typeof request.api !== "string" ||
		request.api.trim() === ""
	) {
		errors.push("api is required and must be a non-empty string");
	}

	if (
		!request.api_version ||
		typeof request.api_version !== "string" ||
		request.api_version.trim() === ""
	) {
		errors.push("api_version is required and must be a non-empty string");
	}

	if (
		!request.aspsp ||
		typeof request.aspsp !== "string" ||
		request.aspsp.trim() === ""
	) {
		errors.push("aspsp is required and must be a non-empty string");
	}

	if (
		!request.country ||
		typeof request.country !== "string" ||
		request.country.trim() === ""
	) {
		errors.push("country is required and must be a non-empty string");
	}

	if (typeof request.auth_type_choice_required !== "boolean") {
		errors.push("auth_type_choice_required is required and must be a boolean");
	}

	// Validate oneOf: either environments or configurations
	const hasEnvironments = "environments" in request;
	const hasConfigurations = "configurations" in request;

	if (!hasEnvironments && !hasConfigurations) {
		errors.push("Either 'environments' or 'configurations' must be provided");
	}

	if (hasEnvironments && hasConfigurations) {
		errors.push("Cannot provide both 'environments' and 'configurations'");
	}

	if (hasEnvironments) {
		const envReq = request as CreateBankWithEnvironmentsRequest;
		if (
			!Array.isArray(envReq.environments) ||
			envReq.environments.length === 0
		) {
			errors.push("environments must be a non-empty array");
		} else {
			const validEnvs = ["production", "test", "sandbox", "development"];
			for (const env of envReq.environments) {
				if (!validEnvs.includes(env)) {
					errors.push(
						`Invalid environment: ${env}. Must be one of: ${validEnvs.join(", ")}`,
					);
					break;
				}
			}
		}
		if (!envReq.configuration) {
			errors.push("configuration is required when using environments");
		}
	}

	if (hasConfigurations) {
		const confReq = request as CreateBankWithConfigurationsRequest;
		if (!confReq.configurations || typeof confReq.configurations !== "object") {
			errors.push("configurations must be an object");
		} else {
			const validEnvs = ["production", "test", "sandbox", "development"];
			const keys = Object.keys(confReq.configurations);
			if (keys.length === 0) {
				errors.push("configurations must have at least one environment");
			}
			for (const key of keys) {
				if (!validEnvs.includes(key)) {
					errors.push(
						`Invalid environment key: ${key}. Must be one of: ${validEnvs.join(", ")}`,
					);
					break;
				}
			}
		}
	}

	// Return first error if any validation failed
	if (errors.length > 0) {
		return createFailure(errors[0]);
	}

	return createSuccess(request);
}

export function validateCreateBankGroupRequest(
	request: CreateBankGroupRequest,
): Result<CreateBankGroupRequest> {
	const errors: string[] = [];

	// Validate required fields
	if (
		!request.group_id ||
		typeof request.group_id !== "string" ||
		request.group_id.trim() === ""
	) {
		errors.push("group_id is required and must be a non-empty string");
	}

	if (
		!request.name ||
		typeof request.name !== "string" ||
		request.name.trim() === ""
	) {
		errors.push("name is required and must be a non-empty string");
	}

	// Validate UUID format for group_id
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (request.group_id && !uuidRegex.test(request.group_id)) {
		errors.push("group_id must be a valid UUID");
	}

	// Validate optional fields if provided
	if (request.description !== undefined && request.description !== null) {
		if (typeof request.description !== "string") {
			errors.push("description must be a string or null");
		}
	}

	if (request.logo_url !== undefined && request.logo_url !== null) {
		if (typeof request.logo_url !== "string") {
			errors.push("logo_url must be a string or null");
		}
	}

	if (request.website !== undefined && request.website !== null) {
		if (typeof request.website !== "string") {
			errors.push("website must be a string or null");
		}
	}

	// Return first error if any validation failed
	if (errors.length > 0) {
		return createFailure(errors[0]);
	}

	return createSuccess(request);
}

export function validateDeleteBankRequest(
	request: DeleteBankRequest,
): Result<DeleteBankRequest> {
	const errors: string[] = [];

	// Validate required fields
	if (
		!request.bankId ||
		typeof request.bankId !== "string" ||
		request.bankId.trim() === ""
	) {
		errors.push("bankId is required and must be a non-empty string");
	}

	// Return first error if any validation failed
	if (errors.length > 0) {
		return createFailure(errors[0]);
	}

	return createSuccess(request);
}

export function validateUpdateBankGroupRequest(
	request: UpdateBankGroupRequest,
): Result<UpdateBankGroupRequest> {
	const errors: string[] = [];

	// Validate that at least one field is provided for update
	if (
		request.name === undefined &&
		request.description === undefined &&
		request.logo_url === undefined &&
		request.website === undefined
	) {
		errors.push("At least one field must be provided for update");
	}

	// Validate name if provided
	if (request.name !== undefined) {
		if (typeof request.name !== "string" || request.name.trim() === "") {
			errors.push("name must be a non-empty string");
		}
	}

	// Validate description if provided
	if (request.description !== undefined && request.description !== null) {
		if (typeof request.description !== "string") {
			errors.push("description must be a string or null");
		}
	}

	// Validate logo_url if provided
	if (request.logo_url !== undefined && request.logo_url !== null) {
		if (typeof request.logo_url !== "string") {
			errors.push("logo_url must be a string or null");
		}
	}

	// Validate website if provided
	if (request.website !== undefined && request.website !== null) {
		if (typeof request.website !== "string") {
			errors.push("website must be a string or null");
		}
	}

	// Return first error if any validation failed
	if (errors.length > 0) {
		return createFailure(errors[0]);
	}

	return createSuccess(request);
}
