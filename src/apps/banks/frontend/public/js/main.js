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
						general: data.message || "Login failed",
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
					const banks = await response.json();
					this.stats.totalBanks = banks.length;
				}

				// Load bank groups
				const groupsResponse = await fetch("/app/bank-groups", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (groupsResponse.ok) {
					const groups = await response.json();
					this.stats.totalBankGroups = groups.length;
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
});
