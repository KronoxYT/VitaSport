// ============================================================================
// VitaSport Renderer - Enhanced Security & Features
// ============================================================================

// ============================================================================
// 1. SECURITY UTILITIES
// ============================================================================

class SecurityManager {
    constructor() {
        this.maxLoginAttempts = 5;
        this.loginAttempts = 0;
        this.lockoutTime = 5 * 60 * 1000; // 5 minutes
        this.lockoutUntil = null;
    }

    // Input sanitization to prevent XSS
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Validate email format
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate username (alphanumeric and underscore only)
    validateUsername(username) {
        const re = /^[a-zA-Z0-9_]{3,20}$/;
        return re.test(username);
    }

    // Rate limiting for login attempts
    checkLoginAttempts() {
        if (this.lockoutUntil && Date.now() < this.lockoutUntil) {
            const remainingTime = Math.ceil((this.lockoutUntil - Date.now()) / 1000);
            throw new Error(`Demasiados intentos fallidos. Intenta de nuevo en ${remainingTime} segundos.`);
        }

        if (this.lockoutUntil && Date.now() >= this.lockoutUntil) {
            this.resetLoginAttempts();
        }

        return true;
    }

    recordFailedLogin() {
        this.loginAttempts++;
        if (this.loginAttempts >= this.maxLoginAttempts) {
            this.lockoutUntil = Date.now() + this.lockoutTime;
            throw new Error(`Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos.`);
        }
    }

    resetLoginAttempts() {
        this.loginAttempts = 0;
        this.lockoutUntil = null;
    }
}

// ============================================================================
// 2. COOKIE MANAGEMENT
// ============================================================================

class CookieManager {
    // Set cookie with security options
    setCookie(name, value, days = 7, secure = true) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        const secureFlag = secure ? 'Secure;' : '';
        const sameSite = 'SameSite=Strict;';
        document.cookie = `${name}=${value};${expires};${secureFlag}${sameSite}path=/`;
    }

    // Get cookie value
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Delete cookie
    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }

    // Get all cookies
    getAllCookies() {
        const cookies = {};
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            const [name, value] = c.split('=');
            if (name && value) cookies[name] = value;
        }
        return cookies;
    }
}

// ============================================================================
// 3. DARK MODE MANAGER
// ============================================================================

class DarkModeManager {
    constructor() {
        this.cookieManager = new CookieManager();
        this.init();
    }

    init() {
        // Check for saved preference or system preference
        const savedTheme = this.cookieManager.getCookie('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.enableDarkMode();
        } else {
            this.enableLightMode();
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.cookieManager.getCookie('theme')) {
                    e.matches ? this.enableDarkMode() : this.enableLightMode();
                }
            });
        }
    }

    enableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'dark');
        this.cookieManager.setCookie('theme', 'dark', 365);
    }

    enableLightMode() {
        document.documentElement.setAttribute('data-theme', 'light');
        this.cookieManager.setCookie('theme', 'light', 365);
    }

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            this.enableLightMode();
        } else {
            this.enableDarkMode();
        }
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}

// ============================================================================
// 4. UI ENHANCEMENTS
// ============================================================================

class UIManager {
    constructor() {
        this.loadingOverlay = null;
    }

    // Show loading state
    showLoading(message = 'Cargando...') {
        if (this.loadingOverlay) return;

        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'loading-overlay';
        this.loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(this.loadingOverlay);
    }

    // Hide loading state
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
            this.loadingOverlay = null;
        }
    }

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove toast after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    // Show error in form
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove existing error
        this.clearFieldError(fieldId);

        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();
    }

    clearAllFieldErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.field-error').forEach(el => el.remove());
    }
}

// ============================================================================
// 5. SESSION MANAGER
// ============================================================================

class SessionManager {
    constructor() {
        this.cookieManager = new CookieManager();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
        this.timeoutId = null;
        this.warningTimeoutId = null;
    }

    startSessionTimer() {
        this.resetSessionTimer();
        this.setupActivityListeners();
    }

    resetSessionTimer() {
        // Clear existing timers
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);

        // Set warning timer
        this.warningTimeoutId = setTimeout(() => {
            this.showSessionWarning();
        }, this.sessionTimeout - this.warningTime);

        // Set logout timer
        this.timeoutId = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.sessionTimeout);

        // Update last activity time
        this.cookieManager.setCookie('lastActivity', Date.now().toString(), 1);
    }

    setupActivityListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, () => this.resetSessionTimer(), { passive: true });
        });
    }

    showSessionWarning() {
        const ui = new UIManager();
        ui.showToast('Tu sesión expirará pronto. Mueve el mouse para continuar.', 'warning', 5000);
    }

    handleSessionTimeout() {
        const ui = new UIManager();
        ui.showToast('Sesión expirada por inactividad', 'error', 3000);
        
        setTimeout(() => {
            this.logout();
        }, 3000);
    }

    logout() {
        const isTauri = typeof window.api !== 'undefined';
        if (isTauri) {
            window.api.clearToken();
        }
        this.cookieManager.deleteCookie('lastActivity');
        window.location.href = 'index.html';
    }
}

// ============================================================================
// 6. MAIN APPLICATION
// ============================================================================

class LoginApp {
    constructor() {
        this.security = new SecurityManager();
        this.cookies = new CookieManager();
        this.darkMode = new DarkModeManager();
        this.ui = new UIManager();
        this.session = new SessionManager();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedUsername();
        this.addDarkModeToggle();
        this.setupPasswordVisibilityToggle();
        this.addKeyboardShortcuts();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const errorMessageDiv = document.getElementById('error-message');

        if (!loginForm) return;

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            this.ui.clearAllFieldErrors();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me')?.checked || false;

            try {
                // Security checks
                this.security.checkLoginAttempts();

                // Validate inputs
                if (!this.security.validateUsername(username)) {
                    this.ui.showFieldError('username', 'Usuario inválido (3-20 caracteres, solo letras, números y guión bajo)');
                    return;
                }

                if (password.length < 4) {
                    this.ui.showFieldError('password', 'La contraseña debe tener al menos 4 caracteres');
                    return;
                }

                // Sanitize inputs
                const cleanUsername = this.security.sanitizeInput(username);
                
                this.ui.showLoading('Iniciando sesión...');

                // Perform login
                const result = await this.performLogin(cleanUsername, password);

                this.ui.hideLoading();

                if (result.success) {
                    this.security.resetLoginAttempts();
                    
                    // Save username if remember me is checked
                    if (rememberMe) {
                        this.cookies.setCookie('savedUsername', cleanUsername, 30);
                    } else {
                        this.cookies.deleteCookie('savedUsername');
                    }

                    // Save session info
                    this.session.startSessionTimer();
                    
                    this.ui.showToast('¡Inicio de sesión exitoso!', 'success', 2000);
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        const isTauri = typeof window.api !== 'undefined';
                        if (isTauri) {
                            window.api.saveToken(result.token);
                            window.location.href = 'shell.html';
                        } else {
                            this.cookies.setCookie('authToken', result.token, 1);
                            window.location.href = './views/dashboard.html';
                        }
                    }, 2000);
                } else {
                    this.security.recordFailedLogin();
                    errorMessageDiv.textContent = result.message || 'Usuario o contraseña incorrectos';
                    errorMessageDiv.style.display = 'block';
                    this.ui.showToast(result.message || 'Error de autenticación', 'error');
                }
            } catch (error) {
                this.ui.hideLoading();
                console.error('Error al intentar iniciar sesión:', error);
                errorMessageDiv.textContent = error.message || 'Error: No se pudo conectar con el servidor.';
                errorMessageDiv.style.display = 'block';
                this.ui.showToast(error.message || 'Error de conexión', 'error');
            }
        });
    }

    async performLogin(username, password) {
        const isTauri = typeof window.api !== 'undefined' && typeof window.api.login === 'function';
        
        if (isTauri) {
            return await window.api.login(username, password);
        } else {
            const baseUrl = (window.__CONFIG__ && window.__CONFIG__.API_BASE_URL) 
                ? window.__CONFIG__.API_BASE_URL 
                : 'http://localhost:3001';
            
            const resp = await fetch(baseUrl + '/api/usuarios/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' // CSRF protection
                },
                body: JSON.stringify({ username, password })
            });

            const text = await resp.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                throw new Error('Respuesta inesperada del servidor: ' + text);
            }
        }
    }

    loadSavedUsername() {
        const savedUsername = this.cookies.getCookie('savedUsername');
        if (savedUsername) {
            const usernameField = document.getElementById('username');
            const rememberMeCheckbox = document.getElementById('remember-me');
            if (usernameField) usernameField.value = savedUsername;
            if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
        }
    }

    addDarkModeToggle() {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'theme-toggle-container';
        toggleContainer.innerHTML = `
            <button id="theme-toggle" class="theme-toggle" aria-label="Cambiar tema">
                <span class="theme-icon">🌙</span>
            </button>
        `;
        document.body.appendChild(toggleContainer);

        const toggleBtn = document.getElementById('theme-toggle');
        this.updateThemeIcon(toggleBtn);

        toggleBtn.addEventListener('click', () => {
            this.darkMode.toggle();
            this.updateThemeIcon(toggleBtn);
        });
    }

    updateThemeIcon(button) {
        const icon = button.querySelector('.theme-icon');
        const isDark = this.darkMode.getCurrentTheme() === 'dark';
        icon.textContent = isDark ? '☀️' : '🌙';
        button.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }

    setupPasswordVisibilityToggle() {
        const passwordField = document.getElementById('password');
        if (!passwordField) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.setAttribute('aria-label', 'Mostrar contraseña');

        passwordField.parentNode.style.position = 'relative';
        passwordField.parentNode.appendChild(toggleBtn);

        toggleBtn.addEventListener('click', () => {
            const type = passwordField.type === 'password' ? 'text' : 'password';
            passwordField.type = type;
            toggleBtn.innerHTML = type === 'password' ? '👁️' : '🙈';
            toggleBtn.setAttribute('aria-label', type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
        });
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+D or Cmd+D to toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.darkMode.toggle();
                const toggleBtn = document.getElementById('theme-toggle');
                if (toggleBtn) this.updateThemeIcon(toggleBtn);
            }
        });
    }
}

// ============================================================================
// 7. INITIALIZE APPLICATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const app = new LoginApp();
    app.init();

    // Log initialization (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('%c🔒 VitaSport Security Enhanced', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
        console.log('%c✓ Dark Mode Enabled', 'color: #2196F3;');
        console.log('%c✓ Cookie Management Active', 'color: #2196F3;');
        console.log('%c✓ Security Features Active', 'color: #2196F3;');
        console.log('%c✓ Session Management Active', 'color: #2196F3;');
    }
});
