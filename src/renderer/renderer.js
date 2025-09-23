document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const isElectron = typeof window.api !== 'undefined' && typeof window.api.login === 'function';
            let result;
            if (isElectron) {
                result = await window.api.login(username, password);
            } else {
                // Fallback para entorno de navegador (Live Server) usando la API REST
                const resp = await fetch('http://localhost:3001/api/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                result = await resp.json();
            }

            if (result.success) {
                // Guardar el token de sesión
                if (isElectron) {
                    window.api.saveToken(result.token);
                    window.location.href = 'shell.html';
                } else {
                    // En navegador simple no tenemos shell con IPC; podemos redirigir a dashboard como estática
                    window.location.href = './views/dashboard.html';
                }
            } else {
                errorMessageDiv.textContent = result.message;
                errorMessageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error al intentar iniciar sesión:', error);
            errorMessageDiv.textContent = 'Error: No se pudo conectar con el servidor.';
            errorMessageDiv.style.display = 'block';
        }
    });
});