document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const result = await window.api.login(username, password);

            if (result.success) {
                // Guardar el token de sesión
                window.api.saveToken(result.token);
                // Redirigir al shell principal de la aplicación
                window.location.href = 'shell.html';
            } else {
                errorMessageDiv.textContent = result.message;
                errorMessageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error al intentar iniciar sesión:', error);
            errorMessageDiv.textContent = 'Error: No se pudo conectar con el proceso principal.';
            errorMessageDiv.style.display = 'block';
        }
    });
});