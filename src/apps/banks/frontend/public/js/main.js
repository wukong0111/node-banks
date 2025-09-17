// Alpine.js Components
document.addEventListener("alpine:init", () => {
	// Registration Form Component
	Alpine.data("registrationForm", () => ({
		form: {
			email: "",
			password: "",
			firstName: "",
			lastName: "",
		},
		errors: {},
		isLoading: false,
		successMessage: "",

		async submit() {
			this.isLoading = true;
			this.errors = {};
			this.successMessage = "";

			try {
				const response = await fetch("/app/users/register", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(this.form),
				});

				const data = await response.json();

				if (response.ok) {
					this.successMessage = "Registration successful! Please login.";
					this.form = {
						email: "",
						password: "",
						firstName: "",
						lastName: "",
					};
					// Redirect to login after 2 seconds
					setTimeout(() => {
						window.location.href = "/login";
					}, 2000);
				} else {
					this.errors = data.errors || {
						general: data.message || "Registration failed",
					};
				}
			} catch (_error) {
				this.errors = { general: "Network error. Please try again." };
			} finally {
				this.isLoading = false;
			}
		},

		validateField(field) {
			const value = this.form[field];
			delete this.errors[field];

			switch (field) {
				case "email":
					if (!value) {
						this.errors.email = "Email is required";
					} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
						this.errors.email = "Please enter a valid email";
					}
					break;
				case "password":
					if (!value) {
						this.errors.password = "Password is required";
					} else if (value.length < 8) {
						this.errors.password = "Password must be at least 8 characters";
					}
					break;
				case "firstName":
					if (!value) {
						this.errors.firstName = "First name is required";
					}
					break;
				case "lastName":
					if (!value) {
						this.errors.lastName = "Last name is required";
					}
					break;
			}
		},

		get hasErrors() {
			return Object.keys(this.errors).length > 0;
		},
	}));

	// Login Form Component
	Alpine.data("loginForm", () => ({
		form: {
			email: "",
			password: "",
		},
		errors: {},
		isLoading: false,
		successMessage: "",

		async submit() {
			this.isLoading = true;
			this.errors = {};
			this.successMessage = "";

			try {
				const response = await fetch("/app/users/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(this.form),
				});

				const data = await response.json();

				if (response.ok) {
					// Store JWT token
					localStorage.setItem("jwt_token", data.token);
					this.successMessage = "Login successful! Redirecting...";
					// Redirect to dashboard after 1 second
					setTimeout(() => {
						window.location.href = "/dashboard";
					}, 1000);
				} else {
					this.errors = data.errors || {
						general: data.error || "Login failed",
					};
				}
			} catch (_error) {
				this.errors = { general: "Network error. Please try again." };
			} finally {
				this.isLoading = false;
			}
		},

		validateField(field) {
			const value = this.form[field];
			delete this.errors[field];

			switch (field) {
				case "email":
					if (!value) {
						this.errors.email = "Email is required";
					} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
						this.errors.email = "Please enter a valid email";
					}
					break;
				case "password":
					if (!value) {
						this.errors.password = "Password is required";
					}
					break;
			}
		},

		get hasErrors() {
			return Object.keys(this.errors).length > 0;
		},
	}));

	// Dashboard Component
	Alpine.data("dashboard", () => ({
		user: null,
		stats: {
			totalBanks: 0,
			totalBankGroups: 0,
			activeConfigs: 0,
		},
		isLoading: true,
		error: null,

		async init() {
			await this.loadUserData();
			await this.loadDashboardStats();
		},

		async loadUserData() {
			try {
				const token = localStorage.getItem("jwt_token");
				if (!token) {
					window.location.href = "/login";
					return;
				}

				const response = await fetch("/app/users/profile", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					this.user = await response.json();
				} else {
					localStorage.removeItem("jwt_token");
					window.location.href = "/login";
				}
			} catch (_error) {
				this.error = "Failed to load user data";
			}
		},

		async loadDashboardStats() {
			try {
				const token = localStorage.getItem("jwt_token");
				const response = await fetch("/app/banks", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					// Handle PaginatedApiResponse structure
					if (data.success && data.data) {
						this.stats.totalBanks = data.pagination?.total || data.data.length;
					} else {
						// Fallback for direct array response
						this.stats.totalBanks = Array.isArray(data)
							? data.length
							: (data.banks || data)?.length || 0;
					}
				}

				// Load bank groups
				const groupsResponse = await fetch("/app/bank-groups", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (groupsResponse.ok) {
					const groupsData = await groupsResponse.json();
					// Handle similar structure for bank groups
					if (groupsData.success && groupsData.data) {
						this.stats.totalBankGroups =
							groupsData.pagination?.total || groupsData.data.length;
					} else {
						// Fallback for direct array response
						this.stats.totalBankGroups = Array.isArray(groupsData)
							? groupsData.length
							: (groupsData.groups || groupsData)?.length || 0;
					}
				}
			} catch (_error) {
				this.error = "Failed to load dashboard stats";
			} finally {
				this.isLoading = false;
			}
		},

		logout() {
			localStorage.removeItem("jwt_token");
			window.location.href = "/login";
		},

		get userFullName() {
			if (!this.user) return "";
			return `${this.user.firstName} ${this.user.lastName}`;
		},
	}));

	// Banks List Component
	Alpine.data("banksList", () => ({
		banks: [],
		filters: {
			name: "",
			country: "",
			api: "",
			env: "",
		},
		pagination: {
			page: 1,
			limit: 10,
			total: 0,
			totalPages: 0,
		},
		isLoading: false,
		error: null,
		successMessage: "",
		confirmDialog: {
			isOpen: false,
			bank: null,
			isLoading: false,
			open(bank) {
				this.bank = bank;
				this.isOpen = true;
			},
			close() {
				this.isOpen = false;
				this.bank = null;
				this.isLoading = false;
			},
		},

		async init() {
			await this.loadBanks();
		},

		async loadBanks() {
			this.isLoading = true;
			this.error = null;

			try {
				const token = localStorage.getItem("jwt_token");
				if (!token) {
					window.location.href = "/login";
					return;
				}

				const params = new URLSearchParams();
				if (this.filters.name) params.append("name", this.filters.name);
				if (this.filters.country)
					params.append("country", this.filters.country);
				if (this.filters.api) params.append("api", this.filters.api);
				if (this.filters.env) params.append("env", this.filters.env);
				params.append("page", this.pagination.page.toString());
				params.append("limit", this.pagination.limit.toString());

				const response = await fetch(`/api/banks?${params}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					// Handle PaginatedApiResponse structure
					if (data.success && data.data) {
						this.banks = data.data;
						this.pagination.total = data.pagination?.total || this.banks.length;
						this.pagination.totalPages =
							data.pagination?.totalPages ||
							Math.ceil(this.pagination.total / this.pagination.limit);
					} else {
						// Fallback for direct array response
						this.banks = Array.isArray(data) ? data : data.banks || data;
						this.pagination.total = data.total || this.banks.length;
						this.pagination.totalPages = Math.ceil(
							this.pagination.total / this.pagination.limit,
						);
					}
				} else {
					this.error = "Failed to load banks";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.isLoading = false;
			}
		},

		async deleteBank(bankId) {
			this.confirmDialog.isLoading = true;

			try {
				const token = localStorage.getItem("jwt_token");
				const response = await fetch(`/api/banks/${bankId}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success) {
						this.successMessage = data.message || "Bank deleted successfully";
						this.confirmDialog.close();
						await this.loadBanks();
						setTimeout(() => {
							this.successMessage = "";
						}, 3000);
					} else {
						this.error = data.error || "Failed to delete bank";
					}
				} else {
					const data = await response.json();
					this.error = data.error || "Failed to delete bank";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.confirmDialog.isLoading = false;
			}
		},

		applyFilters() {
			this.pagination.page = 1;
			this.loadBanks();
		},

		clearFilters() {
			this.filters = {
				name: "",
				country: "",
				api: "",
				env: "",
			};
			this.pagination.page = 1;
			this.loadBanks();
		},

		changePage(page) {
			this.pagination.page = page;
			this.loadBanks();
		},

		showBankDetails(bankId) {
			window.location.href = `/banks/${bankId}/details`;
		},

		editBank(bankId) {
			window.location.href = `/banks/${bankId}/edit`;
		},

		confirmDelete(bank) {
			this.confirmDialog.open(bank);
		},

		async confirmDeleteAction() {
			if (this.confirmDialog.bank) {
				await this.deleteBank(this.confirmDialog.bank.bank_id);
			}
		},

		logout() {
			localStorage.removeItem("jwt_token");
			window.location.href = "/login";
		},
	}));

	// Bank Form Component
	Alpine.data("bankForm", () => ({
		form: {
			bank_id: "",
			name: "",
			bank_codes: [],
			api: "",
			api_version: "",
			aspsp: "",
			country: "",
			auth_type_choice_required: false,
			bic: null,
			real_name: null,
			product_code: null,
			bank_group_id: null,
			logo_url: null,
			documentation: null,
			keywords: null,
			attribute: null,
			environments: [],
			configurations: {},
		},
		isEditing: false,
		bankId: null,
		isLoading: false,
		errors: {},
		successMessage: "",
		bankCodesString: "",

		async init() {
			// Check if we're in edit mode
			const pathParts = window.location.pathname.split("/");
			const bankId = pathParts[pathParts.length - 2];

			if (bankId && bankId !== "new") {
				this.isEditing = true;
				this.bankId = bankId;
				await this.loadBankData(bankId);
			}
		},

		async loadBankData(bankId) {
			this.isLoading = true;
			this.error = null;

			try {
				const token = localStorage.getItem("jwt_token");
				const response = await fetch(`/api/banks/${bankId}/details`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					// Handle ApiResponse structure
					if (data.success && data.data) {
						const bankData = data.data;
						// Handle both BankWithEnvironment and BankWithEnvironments
						if (bankData.environment_config) {
							// BankWithEnvironment - single environment
							this.form = { ...bankData };
							this.form.environments = [
								bankData.environment_config.environment,
							];
							this.form.configurations = {
								[bankData.environment_config.environment]:
									bankData.environment_config,
							};
						} else if (bankData.environment_configs) {
							// BankWithEnvironments - multiple environments
							this.form = { ...bankData };
							this.form.environments = Object.keys(
								bankData.environment_configs,
							);
							this.form.configurations = bankData.environment_configs;
						} else {
							// Fallback for basic bank data
							this.form = { ...bankData };
						}
					} else {
						// Fallback for direct bank data
						this.form = { ...data };
					}
					this.bankCodesString = this.form.bank_codes?.join(", ") || "";
				} else {
					this.error = "Failed to load bank data";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.isLoading = false;
			}
		},

		async submit() {
			if (!this.validateForm()) {
				return;
			}

			this.isLoading = true;
			this.errors = {};

			try {
				const token = localStorage.getItem("jwt_token");
				const url = this.isEditing ? `/api/banks/${this.bankId}` : "/api/banks";
				const method = this.isEditing ? "PUT" : "POST";

				const response = await fetch(url, {
					method,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(this.form),
				});

				const data = await response.json();

				if (response.ok) {
					if (data.success) {
						this.successMessage =
							data.message ||
							(this.isEditing
								? "Bank updated successfully"
								: "Bank created successfully");
						setTimeout(() => {
							window.location.href = "/banks";
						}, 2000);
					} else {
						this.errors = { general: data.error || "Operation failed" };
					}
				} else {
					this.errors = { general: data.error || "Operation failed" };
				}
			} catch (_error) {
				this.errors = { general: "Network error. Please try again." };
			} finally {
				this.isLoading = false;
			}
		},

		validateField(field) {
			const value = this.form[field];
			delete this.errors[field];

			switch (field) {
				case "bank_id":
					if (!value) {
						this.errors.bank_id = "Bank ID is required";
					}
					break;
				case "name":
					if (!value) {
						this.errors.name = "Bank name is required";
					}
					break;
				case "country":
					if (!value) {
						this.errors.country = "Country is required";
					}
					break;
				case "api":
					if (!value) {
						this.errors.api = "API is required";
					}
					break;
				case "api_version":
					if (!value) {
						this.errors.api_version = "API version is required";
					}
					break;
				case "aspsp":
					if (!value) {
						this.errors.aspsp = "ASPSP is required";
					}
					break;
				case "bank_codes":
					if (!value || value.length === 0) {
						this.errors.bank_codes = "At least one bank code is required";
					}
					break;
			}
		},

		validateForm() {
			this.errors = {};
			const requiredFields = [
				"bank_id",
				"name",
				"country",
				"api",
				"api_version",
				"aspsp",
				"bank_codes",
			];

			for (const field of requiredFields) {
				this.validateField(field);
			}

			return Object.keys(this.errors).length === 0;
		},

		updateBankCodes() {
			if (this.bankCodesString.trim()) {
				this.form.bank_codes = this.bankCodesString
					.split(",")
					.map((code) => code.trim())
					.filter((code) => code);
			} else {
				this.form.bank_codes = [];
			}
			this.validateField("bank_codes");
		},

		resetForm() {
			this.form = {
				bank_id: "",
				name: "",
				bank_codes: [],
				api: "",
				api_version: "",
				aspsp: "",
				country: "",
				auth_type_choice_required: false,
				bic: null,
				real_name: null,
				product_code: null,
				bank_group_id: null,
				logo_url: null,
				documentation: null,
				keywords: null,
				attribute: null,
				environments: [],
				configurations: {},
			};
			this.bankCodesString = "";
			this.errors = {};
		},

		cancel() {
			window.location.href = "/banks";
		},

		logout() {
			localStorage.removeItem("jwt_token");
			window.location.href = "/login";
		},

		get hasErrors() {
			return Object.keys(this.errors).length > 0;
		},
	}));

	// Bank Details Component
	Alpine.data("bankDetails", () => ({
		bank: null,
		bankId: null,
		isLoading: false,
		error: null,
		confirmDialog: {
			isOpen: false,
			isLoading: false,
			open() {
				this.isOpen = true;
			},
			close() {
				this.isOpen = false;
				this.isLoading = false;
			},
		},

		async init() {
			const pathParts = window.location.pathname.split("/");
			this.bankId = pathParts[pathParts.length - 2];
			await this.loadBankDetails();
		},

		async loadBankDetails() {
			this.isLoading = true;
			this.error = null;

			try {
				const token = localStorage.getItem("jwt_token");
				const response = await fetch(`/api/banks/${this.bankId}/details`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					// Handle ApiResponse structure
					if (data.success && data.data) {
						this.bank = data.data;
					} else {
						// Fallback for direct bank data
						this.bank = data;
					}
				} else {
					this.error = "Failed to load bank details";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.isLoading = false;
			}
		},

		async deleteBank() {
			this.confirmDialog.isLoading = true;

			try {
				const token = localStorage.getItem("jwt_token");
				const response = await fetch(`/api/banks/${this.bankId}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success) {
						this.confirmDialog.close();
						window.location.href = "/banks";
					} else {
						this.error = data.error || "Failed to delete bank";
					}
				} else {
					const data = await response.json();
					this.error = data.error || "Failed to delete bank";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.confirmDialog.isLoading = false;
			}
		},

		confirmDelete() {
			this.confirmDialog.open();
		},

		async confirmDeleteAction() {
			await this.deleteBank();
		},

		logout() {
			localStorage.removeItem("jwt_token");
			window.location.href = "/login";
		},

		get hasAdditionalInfo() {
			return (
				this.bank &&
				(this.bank.bic ||
					this.bank.real_name ||
					this.bank.product_code ||
					this.bank.bank_group_id ||
					this.bank.logo_url ||
					this.bank.documentation)
			);
		},
	}));

	// Bank Groups List Component
	Alpine.data("bankGroupsList", () => ({
		bankGroups: [],
		loading: false,
		error: null,
		successMessage: "",
		showCreateForm: false,
		showEditForm: false,
		showDeleteConfirm: false,
		formData: {
			group_id: "",
			name: "",
			description: "",
			logo_url: "",
			website: "",
		},
		groupToDelete: null,
		formSubmitting: false,
		deleteSubmitting: false,

		async init() {
			await this.loadBankGroups();
		},

		async loadBankGroups() {
			this.loading = true;
			this.error = null;

			try {
				const token = localStorage.getItem("jwt_token");
				if (!token) {
					window.location.href = "/login";
					return;
				}

				const response = await fetch("/api/bank-groups", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success && data.data) {
						this.bankGroups = data.data;
					} else {
						// Fallback for direct array response
						this.bankGroups = Array.isArray(data) ? data : data.groups || data;
					}
				} else {
					this.error = "Failed to load bank groups";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.loading = false;
			}
		},

		async createGroup() {
			this.formSubmitting = true;

			try {
				const token = localStorage.getItem("jwt_token");
				const response = await fetch("/api/bank-groups", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(this.formData),
				});

				const data = await response.json();

				if (response.ok) {
					if (data.success) {
						this.successMessage =
							data.message || "Bank group created successfully";
						this.closeForm();
						await this.loadBankGroups();
						setTimeout(() => {
							this.successMessage = "";
						}, 3000);
					} else {
						this.error = data.error || "Failed to create bank group";
					}
				} else {
					this.error = data.error || "Failed to create bank group";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.formSubmitting = false;
			}
		},

		async updateGroup() {
			this.formSubmitting = true;

			try {
				const token = localStorage.getItem("jwt_token");
				const response = await fetch(
					`/api/bank-groups/${this.formData.group_id}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(this.formData),
					},
				);

				const data = await response.json();

				if (response.ok) {
					if (data.success) {
						this.successMessage =
							data.message || "Bank group updated successfully";
						this.closeForm();
						await this.loadBankGroups();
						setTimeout(() => {
							this.successMessage = "";
						}, 3000);
					} else {
						this.error = data.error || "Failed to update bank group";
					}
				} else {
					this.error = data.error || "Failed to update bank group";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.formSubmitting = false;
			}
		},

		async deleteGroup() {
			this.deleteSubmitting = true;

			try {
				const token = localStorage.getItem("jwt_token");
				const response = await fetch(
					`/api/bank-groups/${this.groupToDelete.group_id}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const data = await response.json();

				if (response.ok) {
					if (data.success) {
						this.successMessage =
							data.message || "Bank group deleted successfully";
						this.showDeleteConfirm = false;
						this.groupToDelete = null;
						await this.loadBankGroups();
						setTimeout(() => {
							this.successMessage = "";
						}, 3000);
					} else {
						this.error = data.error || "Failed to delete bank group";
					}
				} else {
					this.error = data.error || "Failed to delete bank group";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.deleteSubmitting = false;
			}
		},

		editGroup(group) {
			this.formData = { ...group };
			this.showEditForm = true;
		},

		confirmDelete(group) {
			this.groupToDelete = group;
			this.showDeleteConfirm = true;
		},

		viewGroupDetails(groupId) {
			window.location.href = `/bank-groups/${groupId}/details`;
		},

		closeForm() {
			this.showCreateForm = false;
			this.showEditForm = false;
			this.formData = {
				group_id: "",
				name: "",
				description: "",
				logo_url: "",
				website: "",
			};
		},

		logout() {
			localStorage.removeItem("jwt_token");
			window.location.href = "/login";
		},
	}));

	// Bank Group Details Component
	Alpine.data("bankGroupDetails", () => ({
		bankGroup: null,
		associatedBanks: [],
		availableBanks: [],
		groupId: null,
		loading: false,
		banksLoading: false,
		error: null,
		showAssignBankForm: false,
		selectedBankId: "",
		assigningBank: false,

		async init() {
			const pathParts = window.location.pathname.split("/");
			this.groupId = pathParts[pathParts.length - 2];
			await this.loadGroupDetails();
			await this.loadAvailableBanks();
		},

		async loadGroupDetails() {
			this.loading = true;
			this.error = null;

			try {
				const token = localStorage.getItem("jwt_token");
				if (!token) {
					window.location.href = "/login";
					return;
				}

				const response = await fetch(`/api/bank-groups/${this.groupId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success && data.data) {
						this.bankGroup = data.data;
						// Load associated banks (this would need a dedicated endpoint)
						await this.loadAssociatedBanks();
					} else {
						// Fallback for direct group data
						this.bankGroup = data;
						await this.loadAssociatedBanks();
					}
				} else {
					this.error = "Failed to load bank group details";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.loading = false;
			}
		},

		async loadAssociatedBanks() {
			this.banksLoading = true;

			try {
				const token = localStorage.getItem("jwt_token");
				// This would ideally be a dedicated endpoint like /api/bank-groups/{groupId}/banks
				// For now, we'll filter all banks by bank_group_id
				const response = await fetch("/api/banks", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					let allBanks = [];
					if (data.success && data.data) {
						allBanks = data.data;
					} else {
						allBanks = Array.isArray(data) ? data : data.banks || data;
					}
					// Filter banks that belong to this group
					this.associatedBanks = allBanks.filter(
						(bank) => bank.bank_group_id === this.groupId,
					);
				}
			} catch (_error) {
				console.error("Failed to load associated banks:", _error);
			} finally {
				this.banksLoading = false;
			}
		},

		async loadAvailableBanks() {
			try {
				const token = localStorage.getItem("jwt_token");
				const response = await fetch("/api/banks", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success && data.data) {
						this.availableBanks = data.data.filter(
							(bank) => bank.bank_group_id !== this.groupId,
						);
					} else {
						const allBanks = Array.isArray(data) ? data : data.banks || data;
						this.availableBanks = allBanks.filter(
							(bank) => bank.bank_group_id !== this.groupId,
						);
					}
				}
			} catch (_error) {
				console.error("Failed to load available banks:", _error);
			}
		},

		async assignBankToGroup() {
			if (!this.selectedBankId) return;

			this.assigningBank = true;

			try {
				const token = localStorage.getItem("jwt_token");
				// Update the bank to assign it to this group
				const response = await fetch(`/api/banks/${this.selectedBankId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ bank_group_id: this.groupId }),
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success) {
						this.showAssignBankForm = false;
						this.selectedBankId = "";
						await this.loadGroupDetails();
						await this.loadAvailableBanks();
					} else {
						this.error = data.error || "Failed to assign bank to group";
					}
				} else {
					this.error = "Failed to assign bank to group";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			} finally {
				this.assigningBank = false;
			}
		},

		async removeBankFromGroup(bank) {
			try {
				const token = localStorage.getItem("jwt_token");
				// Update the bank to remove it from this group
				const response = await fetch(`/api/banks/${bank.bank_id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ bank_group_id: null }),
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success) {
						await this.loadGroupDetails();
						await this.loadAvailableBanks();
					} else {
						this.error = data.error || "Failed to remove bank from group";
					}
				} else {
					this.error = "Failed to remove bank from group";
				}
			} catch (_error) {
				this.error = "Network error. Please try again.";
			}
		},

		editGroup() {
			window.location.href = `/bank-groups/${this.groupId}/edit`;
		},

		viewBankDetails(bankId) {
			window.location.href = `/banks/${bankId}/details`;
		},

		goBack() {
			window.location.href = "/bank-groups";
		},

		formatDate(dateString) {
			return new Date(dateString).toLocaleDateString();
		},

		logout() {
			localStorage.removeItem("jwt_token");
			window.location.href = "/login";
		},
	}));
});
