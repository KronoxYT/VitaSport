// ============================================================================
// VitaSport Security Utilities
// Reusable security functions for the renderer process
// ============================================================================

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Sanitizes HTML content more thoroughly
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    
    // Remove script tags and their content
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers
    html = html.replace(/on\w+="[^"]*"/gi, '');
    html = html.replace(/on\w+='[^']*'/gi, '');
    
    // Remove javascript: protocol
    html = html.replace(/javascript:/gi, '');
    
    // Remove data: protocol (except for images)
    html = html.replace(/data:(?!image)/gi, '');
    
    return html;
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Validates username format (alphanumeric and underscore, 3-20 chars)
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid
 */
function validateUsername(username) {
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - {valid: boolean, score: number, feedback: string}
 */
function validatePasswordStrength(password) {
    const result = {
        valid: false,
        score: 0,
        feedback: []
    };

    if (!password || password.length < 8) {
        result.feedback.push('La contraseña debe tener al menos 8 caracteres');
        return result;
    }

    // Check for different character types
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (hasLower) result.score++;
    if (hasUpper) result.score++;
    if (hasNumber) result.score++;
    if (hasSpecial) result.score++;

    if (password.length >= 12) result.score++;
    if (password.length >= 16) result.score++;

    // Provide feedback
    if (!hasLower || !hasUpper) {
        result.feedback.push('Usa mayúsculas y minúsculas');
    }
    if (!hasNumber) {
        result.feedback.push('Incluye al menos un número');
    }
    if (!hasSpecial) {
        result.feedback.push('Incluye al menos un carácter especial');
    }

    result.valid = result.score >= 3;
    
    return result;
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return String(text).replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Generates a secure random string
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
function generateSecureRandomString(length = 32) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    
    return Array.from(values)
        .map(value => charset[value % charset.length])
        .join('');
}

/**
 * Hashes a string using SHA-256 (for client-side use only, not for passwords!)
 * @param {string} message - Message to hash
 * @returns {Promise<string>} - Hex string hash
 */
async function hashString(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates URL format and checks if it's safe
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid and safe
 */
function validateURL(url) {
    try {
        const parsed = new URL(url);
        const allowedProtocols = ['http:', 'https:'];
        return allowedProtocols.includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Rate limiter for preventing abuse
 */
class RateLimiter {
    constructor(maxAttempts = 5, windowMs = 60000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.attempts = new Map();
    }

    /**
     * Check if action is allowed
     * @param {string} key - Identifier (e.g., 'login', 'api-call')
     * @returns {boolean} - True if allowed
     */
    isAllowed(key) {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];
        
        // Filter out old attempts
        const recentAttempts = attempts.filter(time => now - time < this.windowMs);
        
        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }

        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);
        return true;
    }

    /**
     * Reset attempts for a key
     * @param {string} key - Identifier
     */
    reset(key) {
        this.attempts.delete(key);
    }

    /**
     * Get remaining attempts
     * @param {string} key - Identifier
     * @returns {number} - Remaining attempts
     */
    getRemainingAttempts(key) {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];
        const recentAttempts = attempts.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxAttempts - recentAttempts.length);
    }
}

/**
 * Validates file uploads
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} - {valid: boolean, error: string}
 */
function validateFile(file, options = {}) {
    const defaults = {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
    };

    const config = { ...defaults, ...options };
    const result = { valid: true, error: null };

    // Check file size
    if (file.size > config.maxSize) {
        result.valid = false;
        result.error = `El archivo es demasiado grande. Máximo: ${config.maxSize / 1024 / 1024}MB`;
        return result;
    }

    // Check MIME type
    if (!config.allowedTypes.includes(file.type)) {
        result.valid = false;
        result.error = `Tipo de archivo no permitido. Permitidos: ${config.allowedTypes.join(', ')}`;
        return result;
    }

    // Check file extension
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!config.allowedExtensions.includes(extension)) {
        result.valid = false;
        result.error = `Extensión de archivo no permitida. Permitidas: ${config.allowedExtensions.join(', ')}`;
        return result;
    }

    return result;
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {Function} - Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Secure localStorage wrapper with encryption simulation
 */
class SecureStorage {
    constructor(prefix = 'vs_') {
        this.prefix = prefix;
    }

    /**
     * Set item in storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    setItem(key, value) {
        try {
            const data = JSON.stringify({
                value,
                timestamp: Date.now()
            });
            // In production, you might want to add actual encryption here
            localStorage.setItem(this.prefix + key, btoa(data));
        } catch (error) {
            console.error('Error setting item in secure storage:', error);
        }
    }

    /**
     * Get item from storage
     * @param {string} key - Storage key
     * @param {number} maxAge - Max age in ms (0 = no expiry)
     * @returns {any} - Stored value or null
     */
    getItem(key, maxAge = 0) {
        try {
            const raw = localStorage.getItem(this.prefix + key);
            if (!raw) return null;

            const data = JSON.parse(atob(raw));
            
            // Check expiry
            if (maxAge > 0 && Date.now() - data.timestamp > maxAge) {
                this.removeItem(key);
                return null;
            }

            return data.value;
        } catch (error) {
            console.error('Error getting item from secure storage:', error);
            return null;
        }
    }

    /**
     * Remove item from storage
     * @param {string} key - Storage key
     */
    removeItem(key) {
        localStorage.removeItem(this.prefix + key);
    }

    /**
     * Clear all items with prefix
     */
    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
    // Node.js/Electron environment
    module.exports = {
        sanitizeInput,
        sanitizeHTML,
        validateEmail,
        validateUsername,
        validatePasswordStrength,
        escapeHTML,
        generateSecureRandomString,
        hashString,
        validateURL,
        RateLimiter,
        validateFile,
        debounce,
        throttle,
        SecureStorage
    };
} else {
    // Browser environment - expose globally
    window.SecurityUtils = {
        sanitizeInput,
        sanitizeHTML,
        validateEmail,
        validateUsername,
        validatePasswordStrength,
        escapeHTML,
        generateSecureRandomString,
        hashString,
        validateURL,
        RateLimiter,
        validateFile,
        debounce,
        throttle,
        SecureStorage
    };
}
