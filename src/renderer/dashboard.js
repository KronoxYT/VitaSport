document.addEventListener('DOMContentLoaded', () => {
    const userInfoSpan = document.getElementById('user-info');
    const userData = sessionStorage.getItem('user');
    let user = null;

    if (userData) {
        user = JSON.parse(userData);
        userInfoSpan.textContent = `${user.username} (${user.role})`;
    } else {
        // Si no hay datos de usuario, redirigir al login
        window.location.href = 'index.html';
        return; // Detener la ejecución del script
    }

    // --- Referencias a elementos del DOM ---
    // Productos
    const productosSection = document.getElementById('productos-section');
    const productosTbody = document.getElementById('productos-tbody');
    const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    const modalProducto = $('#modalProducto'); // jQuery
    const formProducto = document.getElementById('formProducto');
    const modalProductoLabel = document.getElementById('modalProductoLabel');

    // Ventas
    const ventasSection = document.getElementById('ventas-section');
    const ventasTbody = document.getElementById('ventas-tbody');
    const btnNuevaVenta = document.getElementById('btn-nueva-venta');
    const modalVenta = $('#modalVenta'); // jQuery
    const formVenta = document.getElementById('formVenta');
    const modalVentaLabel = document.getElementById('modalVentaLabel');
    const ventaProductoSelect = document.getElementById('venta-producto');
    const btnExportarVentas = document.getElementById('btn-exportar-ventas');

    // Usuarios
    const usuariosSection = document.getElementById('usuarios-section');
    const usuariosTbody = document.getElementById('usuarios-tbody');
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    const modalUsuario = $('#modalUsuario'); // jQuery
    const formUsuario = document.getElementById('formUsuario');
    const modalUsuarioLabel = document.getElementById('modalUsuarioLabel');

    // Alertas y Gráficos
    const alertasStockDiv = document.getElementById('alertas-stock');
    const alertasVencimientoDiv = document.getElementById('alertas-vencimiento');
    const graficoVentasProductoCanvas = document.getElementById('grafico-ventas-producto');
    const graficoVentasMesCanvas = document.getElementById('grafico-ventas-mes');

    // --- Lógica de negocio ---
    // Usar la URL de API dinámica desde config.js
    const API_BASE_URL = (window.__CONFIG__ && window.__CONFIG__.API_BASE_URL) ? window.__CONFIG__.API_BASE_URL + '/api' : 'http://localhost:3001/api';

    // Función genérica para fetch
    async function apiFetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error en el servidor' }));
                throw new Error(errorData.message);
            }
            return response.json();
        } catch (error) {
            console.error(`Error en fetch a ${endpoint}:`, error);
            alert(`Error de conexión: ${error.message}`);
            throw error;
        }
    }

    // --- Gestión de Productos ---
    async function cargarProductos() {
        try {
            const data = await apiFetch('/productos');
            productosTbody.innerHTML = '';
            if (data.success) {
                data.productos.forEach(prod => {
                    const acciones = user.role === 'Administrador' ? `
                        <button class="btn btn-sm btn-primary btn-editar" data-id="${prod.id}">Editar</button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${prod.id}">Eliminar</button>
                    ` : '';
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${prod.id}</td>
                        <td>${prod.sku || ''}</td>
                        <td>${prod.name}</td>
                        <td>${prod.brand || ''}</td>
                        <td>${prod.category || ''}</td>
                        <td>${prod.presentation || ''}</td>
                        <td>${prod.flavor || ''}</td>
                        <td>${prod.weight || ''}</td>
                        <td>${prod.expiry_date || ''}</td>
                        <td>${prod.lot_number || ''}</td>
                        <td>${prod.min_stock || ''}</td>
                        <td>${prod.location || ''}</td>
                        <td>${prod.status || ''}</td>
                        <td>${acciones}</td>
                    `;
                    productosTbody.appendChild(tr);
                });
            }
        } catch (error) {
            productosTbody.innerHTML = '<tr><td colspan="14">Error al cargar productos.</td></tr>';
        }
    }

    async function guardarProducto(data, id) {
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `/productos/${id}` : '/productos';
        try {
            const result = await apiFetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (result.success) {
                modalProducto.modal('hide');
                cargarProductos();
            } else {
                alert(`Error al guardar producto: ${result.message}`);
            }
        } catch (error) {
            // El error ya se maneja en apiFetch
        }
    }

    async function eliminarProducto(id) {
        if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
        try {
            const result = await apiFetch(`/productos/${id}`, { method: 'DELETE' });
            if (result.success) {
                cargarProductos();
            } else {
                alert('No se pudo eliminar el producto.');
            }
        } catch (error) {}
    }
    
    async function editarProducto(id) {
        try {
            const data = await apiFetch(`/productos/${id}`);
            if (data.success && data.producto) {
                const prod = data.producto;
                formProducto.reset();
                formProducto.dataset.editId = id;
                modalProductoLabel.textContent = 'Editar Producto';
                // Llenar el formulario
                Object.keys(prod).forEach(key => {
                    if (formProducto.elements[key]) {
                        // Formatear fecha para input type="date"
                        if (formProducto.elements[key].type === 'date' && prod[key]) {
                            formProducto.elements[key].value = new Date(prod[key]).toISOString().split('T')[0];
                        } else {
                            formProducto.elements[key].value = prod[key] || '';
                        }
                    }
                });
                modalProducto.modal('show');
            } else {
                alert('Producto no encontrado.');
            }
        } catch (error) {}
    }


    // --- Gestión de Ventas ---
    async function cargarVentas() {
        try {
            const data = await apiFetch('/ventas');
            ventasTbody.innerHTML = '';
            if (data.success) {
                data.ventas.forEach(v => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${v.id}</td>
                        <td>${v.product_name || v.product_id}</td>
                        <td>${v.quantity}</td>
                        <td>${v.sale_price}</td>
                        <td>${v.discount || ''}</td>
                        <td>${v.channel || ''}</td>
                        <td>${v.sale_date || ''}</td>
                        <td>${v.vendedor || ''}</td>
                        <td><button class="btn btn-sm btn-danger btn-eliminar-venta" data-id="${v.id}">Eliminar</button></td>
                    `;
                    ventasTbody.appendChild(tr);
                });
            }
        } catch (error) {
            ventasTbody.innerHTML = '<tr><td colspan="9">Error al cargar ventas.</td></tr>';
        }
    }

    async function guardarVenta(data) {
        try {
            const result = await apiFetch('/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (result.success) {
                modalVenta.modal('hide');
                cargarVentas();
                cargarAlertas(); // Recargar alertas por si el stock cambió
            } else {
                alert(`Error al registrar venta: ${result.message}`);
            }
        } catch (error) {}
    }
    
    async function eliminarVenta(id) {
        if (!confirm('¿Seguro que deseas eliminar esta venta?')) return;
        try {
            const result = await apiFetch(`/ventas/${id}`, { method: 'DELETE' });
            if (result.success) {
                cargarVentas();
            } else {
                alert('No se pudo eliminar la venta.');
            }
        } catch (error) {}
    }

    // --- Gestión de Usuarios (Solo Admin) ---
    async function cargarUsuarios() {
        try {
            const data = await apiFetch('/usuarios');
            usuariosTbody.innerHTML = '';
            if (data.success) {
                data.usuarios.forEach(u => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${u.id}</td>
                        <td>${u.username}</td>
                        <td>${u.fullname || ''}</td>
                        <td>${u.role}</td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-editar-usuario" data-id="${u.id}">Editar</button>
                            <button class="btn btn-sm btn-danger btn-eliminar-usuario" data-id="${u.id}">Eliminar</button>
                        </td>
                    `;
                    usuariosTbody.appendChild(tr);
                });
            }
        } catch (error) {
            usuariosTbody.innerHTML = '<tr><td colspan="5">Error al cargar usuarios.</td></tr>';
        }
    }
    
    async function guardarUsuario(data, id) {
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `/usuarios/${id}` : '/usuarios';
    
        // No enviar la contraseña si está vacía en la edición
        if (id && !data.password) {
            delete data.password;
        }
    
        try {
            const result = await apiFetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (result.success) {
                modalUsuario.modal('hide');
                cargarUsuarios();
            } else {
                alert(`Error al guardar usuario: ${result.message}`);
            }
        } catch (error) {}
    }
    
    async function editarUsuario(id) {
        try {
            const data = await apiFetch(`/usuarios/${id}`);
            if (data.success && data.usuario) {
                const u = data.usuario;
                formUsuario.reset();
                formUsuario.dataset.editId = id;
                modalUsuarioLabel.textContent = 'Editar Usuario';
                formUsuario.elements.username.value = u.username;
                formUsuario.elements.fullname.value = u.fullname;
                formUsuario.elements.role.value = u.role;
                // Dejar la contraseña en blanco para no revelarla
                formUsuario.elements.password.placeholder = 'Dejar en blanco para no cambiar';
                modalUsuario.modal('show');
            } else {
                alert('Usuario no encontrado.');
            }
        } catch (error) {}
    }
    
    async function eliminarUsuario(id) {
        if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
        try {
            const result = await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
            if (result.success) {
                cargarUsuarios();
            } else {
                alert('No se pudo eliminar el usuario.');
            }
        } catch (error) {}
    }


    // --- Alertas y Gráficos ---
    async function cargarAlertas() {
        try {
            const [stockData, vencimientoData] = await Promise.all([
                apiFetch('/alertas/stock-bajo'),
                apiFetch('/alertas/vencimiento')
            ]);

            if (stockData.success && stockData.alertas.length > 0) {
                alertasStockDiv.style.display = 'block';
                alertasStockDiv.innerHTML = '<b>Stock bajo:</b> ' + stockData.alertas.map(a => `${a.nombre} (Stock: ${a.stock}, Mínimo: ${a.min_stock})`).join(', ');
            } else {
                alertasStockDiv.style.display = 'none';
            }

            if (vencimientoData.success && vencimientoData.alertas.length > 0) {
                alertasVencimientoDiv.style.display = 'block';
                alertasVencimientoDiv.innerHTML = '<b>Próximos a vencer:</b> ' + vencimientoData.alertas.map(a => `${a.name} (${a.expiry_date})`).join(', ');
            } else {
                alertasVencimientoDiv.style.display = 'none';
            }
        } catch (error) {
            alertasStockDiv.style.display = 'none';
            alertasVencimientoDiv.style.display = 'none';
        }
    }

    async function cargarGraficos() {
        try {
            const [ventasProductoData, ventasMesData] = await Promise.all([
                apiFetch('/estadisticas/ventas-producto'),
                apiFetch('/estadisticas/ventas-mes')
            ]);

            if (ventasProductoData.success) {
                new Chart(graficoVentasProductoCanvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ventasProductoData.datos.map(d => d.producto),
                        datasets: [{
                            label: 'Ventas por producto',
                            data: ventasProductoData.datos.map(d => d.total),
                            backgroundColor: 'rgba(54, 162, 235, 0.5)'
                        }]
                    }
                });
            }

            if (ventasMesData.success) {
                new Chart(graficoVentasMesCanvas.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ventasMesData.datos.map(d => d.mes),
                        datasets: [{
                            label: 'Ventas por mes',
                            data: ventasMesData.datos.map(d => d.total),
                            borderColor: 'rgba(255, 99, 132, 0.7)',
                            tension: 0.1
                        }]
                    }
                });
            }
        } catch (error) {}
    }
    
    // --- Inicialización y Event Listeners ---
    function inicializar() {
        // Carga de datos inicial
        cargarProductos();
        cargarVentas();
        cargarAlertas();
        cargarGraficos();

        // Visibilidad de secciones según rol
        if (user.role === 'Administrador') {
            productosSection.style.display = 'block';
            usuariosSection.style.display = 'block';
            cargarUsuarios();
        } else { // Vendedor
            productosSection.style.display = 'none'; // O mostrarlo como solo lectura
            usuariosSection.style.display = 'none';
        }
        
        // Listeners para modales de "Nuevo"
        btnNuevoProducto.addEventListener('click', () => {
            formProducto.reset();
            formProducto.dataset.editId = '';
            modalProductoLabel.textContent = 'Nuevo Producto';
            modalProducto.modal('show');
        });

        btnNuevaVenta.addEventListener('click', async () => {
            formVenta.reset();
            modalVentaLabel.textContent = 'Registrar Venta';
            // Cargar productos en el select
            try {
                const data = await apiFetch('/productos');
                if(data.success) {
                    ventaProductoSelect.innerHTML = data.productos.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
                }
            } catch(e) {}
            modalVenta.modal('show');
        });

        btnNuevoUsuario.addEventListener('click', () => {
            formUsuario.reset();
            formUsuario.dataset.editId = '';
            modalUsuarioLabel.textContent = 'Nuevo Usuario';
            formUsuario.elements.password.placeholder = '';
            modalUsuario.modal('show');
        });

        // Listeners para formularios
        formProducto.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formProducto);
            const data = Object.fromEntries(formData.entries());
            const id = formProducto.dataset.editId;
            guardarProducto(data, id);
        });

        formVenta.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formVenta);
            const data = Object.fromEntries(formData.entries());
            data.created_by = user.id; // Asociar venta al usuario logueado
            guardarVenta(data);
        });

        formUsuario.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formUsuario);
            const data = Object.fromEntries(formData.entries());
            const id = formUsuario.dataset.editId;
            guardarUsuario(data, id);
        });

        // Listeners para botones de acción en tablas (delegación de eventos)
        productosTbody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-editar')) {
                editarProducto(e.target.dataset.id);
            } else if (e.target.classList.contains('btn-eliminar')) {
                eliminarProducto(e.target.dataset.id);
            }
        });

        ventasTbody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar-venta')) {
                eliminarVenta(e.target.dataset.id);
            }
        });

        usuariosTbody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-editar-usuario')) {
                editarUsuario(e.target.dataset.id);
            } else if (e.target.classList.contains('btn-eliminar-usuario')) {
                eliminarUsuario(e.target.dataset.id);
            }
        });
        
        // Listener para exportar PDF
        btnExportarVentas.addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/reportes/ventas/pdf`);
                if (!response.ok) throw new Error('No se pudo generar el PDF.');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reporte_ventas.pdf';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                alert(error.message);
            }
        });
    }

    inicializar();
});