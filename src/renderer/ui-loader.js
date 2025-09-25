document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const logoutBtn = document.getElementById('logout-btn');

    // Función para cargar vistas
    const loadView = async (view) => {
        try {
            // Cargar el HTML de la vista
            const response = await fetch(`views/${view}.html`);
            if (!response.ok) {
                throw new Error(`No se pudo encontrar la vista: ${view}.html`);
            }
            const html = await response.text();
            contentArea.innerHTML = html;

            // Eliminar el script de la vista anterior si existe
            const oldScript = document.getElementById('view-script');
            if (oldScript) {
                oldScript.remove();
            }

            // Cargar el JS de la vista
            const script = document.createElement('script');
            script.id = 'view-script';
            script.src = `views/${view}.js`;
            document.body.appendChild(script);

            // Actualizar el estado activo del enlace de navegación
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.view === view) {
                    link.classList.add('active');
                }
            });

        } catch (error) {
            console.error('Error al cargar la vista:', error);
            contentArea.innerHTML = `<div class="alert alert-danger">Error al cargar la sección.</div>`;
        }
    };

    // Manejar clics en la navegación
    document.querySelector('.sidebar').addEventListener('click', (e) => {
        const link = e.target.closest('a.nav-link');
        if (link) {
            e.preventDefault();
            const view = link.dataset.view;
            if (view) {
                loadView(view);
            }
        }
    });

    // Manejar clic en el botón de logout
    logoutBtn.addEventListener('click', () => {
        if (window.api && typeof window.api.clearToken === 'function') {
            window.api.clearToken();
        }
        window.location.href = 'index.html';
    });

    // Cargar la vista inicial por defecto
    loadView('dashboard');
});