import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { createLogger } from "../../../shared/infrastructure/logging/LoggerFactory.js";

const logger = createLogger().withContext({ service: "FrontendRoutes" });

const frontendRoutes = new Hono();

// Serve static files
frontendRoutes.use(
	"/static/*",
	serveStatic({
		root: "./src/apps/banks/frontend/public",
		rewriteRequestPath: (path) => path.replace("/static", ""),
	}),
);

// Serve HTML views
frontendRoutes.get("/register", (c) => {
	logger.info("Serving registration page");
	return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Banking Dashboard</title>
    <link rel="stylesheet" href="/static/css/main.css">
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">Banking Dashboard</div>
                <nav>
                    <ul class="nav-links">
                        <li><a href="/login">Login</a></li>
                        <li><a href="/register">Register</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <main class="auth-container">
        <div class="auth-card" x-data="registrationForm()">
            <h1 class="auth-title">Create Account</h1>
            
            <form @submit.prevent="submit()">
                <div class="form-group">
                    <label class="form-label" for="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        class="form-input"
                        :class="{ error: errors.firstName }"
                        x-model="form.firstName"
                        @blur="validateField('firstName')"
                        required
                    />
                    <div class="error-message" x-text="errors.firstName" x-show="errors.firstName"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        class="form-input"
                        :class="{ error: errors.lastName }"
                        x-model="form.lastName"
                        @blur="validateField('lastName')"
                        required
                    />
                    <div class="error-message" x-text="errors.lastName" x-show="errors.lastName"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        class="form-input"
                        :class="{ error: errors.email }"
                        x-model="form.email"
                        @blur="validateField('email')"
                        required
                    />
                    <div class="error-message" x-text="errors.email" x-show="errors.email"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        class="form-input"
                        :class="{ error: errors.password }"
                        x-model="form.password"
                        @blur="validateField('password')"
                        required
                    />
                    <div class="error-message" x-text="errors.password" x-show="errors.password"></div>
                </div>

                <div class="success-message" x-text="successMessage" x-show="successMessage"></div>
                <div class="error-message" x-text="errors.general" x-show="errors.general"></div>

                <button
                    type="submit"
                    class="btn btn-primary btn-block"
                    :disabled="isLoading || hasErrors"
                >
                    <span x-show="!isLoading">Register</span>
                    <span x-show="isLoading" class="loading"></span>
                </button>
            </form>

            <div style="margin-top: 1.5rem; text-align: center;">
                <p>Already have an account? <a href="/login" class="btn btn-secondary">Login</a></p>
            </div>
        </div>
    </main>

    <script src="/static/js/main.js" defer></script>
</body>
</html>
	`);
});

frontendRoutes.get("/login", (c) => {
	logger.info("Serving login page");
	return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Banking Dashboard</title>
    <link rel="stylesheet" href="/static/css/main.css">
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">Banking Dashboard</div>
                <nav>
                    <ul class="nav-links">
                        <li><a href="/login">Login</a></li>
                        <li><a href="/register">Register</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <main class="auth-container">
        <div class="auth-card" x-data="loginForm()">
            <h1 class="auth-title">Login</h1>
            
            <form @submit.prevent="submit()">
                <div class="form-group">
                    <label class="form-label" for="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        class="form-input"
                        :class="{ error: errors.email }"
                        x-model="form.email"
                        @blur="validateField('email')"
                        required
                    />
                    <div class="error-message" x-text="errors.email" x-show="errors.email"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        class="form-input"
                        :class="{ error: errors.password }"
                        x-model="form.password"
                        @blur="validateField('password')"
                        required
                    />
                    <div class="error-message" x-text="errors.password" x-show="errors.password"></div>
                </div>

                <div class="success-message" x-text="successMessage" x-show="successMessage"></div>
                <div class="error-message" x-text="errors.general" x-show="errors.general"></div>

                <button
                    type="submit"
                    class="btn btn-primary btn-block"
                    :disabled="isLoading || hasErrors"
                >
                    <span x-show="!isLoading">Login</span>
                    <span x-show="isLoading" class="loading"></span>
                </button>
            </form>

            <div style="margin-top: 1.5rem; text-align: center;">
                <p>Don't have an account? <a href="/register" class="btn btn-secondary">Register</a></p>
            </div>
        </div>
    </main>

    <script src="/static/js/main.js" defer></script>
</body>
</html>
	`);
});

frontendRoutes.get("/dashboard", (c) => {
	logger.info("Serving dashboard page");
	return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Banking Dashboard</title>
    <link rel="stylesheet" href="/static/css/main.css">
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
    <div x-data="dashboard()">
        <header class="header">
            <div class="container">
                <div class="header-content">
                    <div class="logo">Banking Dashboard</div>
                    <nav>
                        <ul class="nav-links">
                            <li><a href="/dashboard">Dashboard</a></li>
                            <li><a href="#" @click="logout()">Logout</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>

        <main class="dashboard">
            <div class="container">
                <div class="dashboard-header">
                    <h1 class="dashboard-title">Welcome back, <span x-text="userFullName"></span>!</h1>
                    <p class="dashboard-subtitle">Here's your banking overview</p>
                </div>

                <div x-show="isLoading" style="text-align: center; padding: 2rem;">
                    <div class="loading" style="width: 40px; height: 40px; margin: 0 auto;"></div>
                    <p style="margin-top: 1rem;">Loading dashboard...</p>
                </div>

                <div x-show="error" class="error-message" style="text-align: center; padding: 2rem;" x-text="error"></div>

                <div x-show="!isLoading && !error">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-title">Total Banks</div>
                            <div class="stat-value" x-text="stats.totalBanks">0</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-title">Bank Groups</div>
                            <div class="stat-value" x-text="stats.totalBankGroups">0</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-title">Active Configs</div>
                            <div class="stat-value" x-text="stats.activeConfigs">0</div>
                        </div>
                    </div>

                    <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 1.5rem;">
                        <h2 style="margin-bottom: 1rem;">Quick Actions</h2>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <a href="#" class="btn btn-primary">Add Bank</a>
                            <a href="#" class="btn btn-secondary">Add Bank Group</a>
                            <a href="#" class="btn btn-secondary">View Reports</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="/static/js/main.js" defer></script>
</body>
</html>
	`);
});

export default frontendRoutes;
