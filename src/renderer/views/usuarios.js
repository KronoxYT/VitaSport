(function() {
    const usuariosTbody = document.getElementById('usuarios-tbody');
    const modalUsuario = new bootstrap.Modal(document.getElementById('modalUsuario'));
    const formUsuario = document.getElementById('formUsuario');
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    const modalUsuarioLabel = document.getElementById('modalUsuarioLabel');
    const usuarioIdInput = document.getElementById('usuario-id');

    // --- Notificaciones ---
    function showNotification(message, type = 'success') {
        const container = document.querySelector('.container-fluid');
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.role = 'alert';
        notification.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        container.insertBefore(notification, container.firstChild);
        setTimeout(() => $(notification).alert('close'), 5000);
    }

    // --- Lógica de Carga y Renderizado ---
    const loadUsuarios = async () => {
        try {
            const data = await window.api.getUsuarios();
            if (data.success) {
                renderUsuarios(data.users);
            } else {
                showNotification(`Error al cargar usuarios: ${data.message}`, 'danger');
            }
        } catch (error) {
            console.error('Error de red:', error);
            showNotification(`Error de red al cargar usuarios: ${error.message}`, 'danger');
        }
    };

    const renderUsuarios = (usuarios) => {
        usuariosTbody.innerHTML = '';
        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.username}</td>
                <td>${usuario.fullname || 'N/A'}</td>
                <td>${usuario.role}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-edit-usuario" data-id="${usuario.id}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-delete-usuario" data-id="${usuario.id}">Eliminar</button>
                </td>
            `;
            usuariosTbody.appendChild(tr);
        });
    };

    // --- Event Listeners ---
    btnNuevoUsuario.addEventListener('click', () => {
        formUsuario.reset();
        usuarioIdInput.value = '';
        modalUsuarioLabel.textContent = 'Nuevo Usuario';
        modalUsuario.show();
    });

    formUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!formUsuario.checkValidity()) {
            e.stopPropagation();
            formUsuario.classList.add('was-validated');
            return;
        }

        const formData = new FormData(formUsuario);
        const usuarioData = Object.fromEntries(formData.entries());
        const id = usuarioIdInput.value;

        // Validar contraseñas
        if (usuarioData.password || usuarioData.password_confirm) {
            if (usuarioData.password !== usuarioData.password_confirm) {
                showNotification('Las contraseñas no coinciden.', 'danger');
                return;
            }
        }

        // Si la contraseña está en blanco, no la enviamos para que no se actualice
        if (!usuarioData.password) {
            delete usuarioData.password;
        }
        delete usuarioData.password_confirm; // No necesitamos enviar esto al backend

        try {
            const result = id
                ? await window.api.updateUsuario(id, usuarioData)
                : await window.api.createUsuario(usuarioData);

            if (result.success) {
                modalUsuario.hide();
                showNotification(`Usuario ${id ? 'actualizado' : 'creado'} con éxito.`);
                loadUsuarios();
            } else {
                showNotification(`Error: ${result.message}`, 'danger');
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            showNotification(`Error al guardar usuario: ${error.message}`, 'danger');
        }
    });

    usuariosTbody.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('btn-delete-usuario')) {
            const id = target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
                try {
                    const result = await window.api.deleteUsuario(id);
                    if (result.success) {
                        showNotification('Usuario eliminado con éxito.');
                        loadUsuarios();
                    } else {
                        showNotification(`Error: ${result.message}`, 'danger');
                    }
                } catch (error) {
                    console.error('Error al eliminar usuario:', error);
                    showNotification(`Error al eliminar usuario: ${error.message}`, 'danger');
                }
            }
        } else if (target.classList.contains('btn-edit-usuario')) {
            const id = target.dataset.id;
            try {
                const data = await window.api.getUsuarioById(id);
                if (data.success) {
                    const usuario = data.user;
                    formUsuario.reset();
                    usuarioIdInput.value = usuario.id;
                    modalUsuarioLabel.textContent = 'Editar Usuario';
                    formUsuario.username.value = usuario.username;
                    formUsuario.fullname.value = usuario.fullname || '';
                    formUsuario.role.value = usuario.role;
                    // No rellenar la contraseña por seguridad
                    modalUsuario.show();
                } else {
                    showNotification('Error al cargar datos del usuario', 'danger');
                }
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                showNotification(`Error al cargar usuario: ${error.message}`, 'danger');
            }
        }
    });

    // Carga inicial
    loadUsuarios();
})();