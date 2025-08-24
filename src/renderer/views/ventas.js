(function() {
    const ventasTbody = document.getElementById('ventas-tbody');
    const modalVenta = new bootstrap.Modal(document.getElementById('modalVenta'));
    const formVenta = document.getElementById('formVenta');
    const ventaProductoSelect = document.getElementById('venta-producto');
    const btnNuevaVenta = document.getElementById('btn-nueva-venta');
    const btnExportarVentas = document.getElementById('btn-exportar-ventas');
    const btnExportarCsv = document.getElementById('btn-exportar-csv');

    let allProducts = [];

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
    const loadVentas = async () => {
        try {
            const data = await window.api.getVentas();
            if (data.success) {
                renderVentas(data.ventas);
            } else {
                showNotification(`Error al cargar ventas: ${data.message}`, 'danger');
            }
        } catch (error) {
            console.error('Error de red:', error);
            showNotification(`Error de red al cargar ventas: ${error.message}`, 'danger');
        }
    };

    const renderVentas = (ventas) => {
        ventasTbody.innerHTML = '';
        ventas.forEach(venta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${venta.id}</td>
                <td>${venta.product_name || 'N/A'}</td>
                <td>${venta.quantity}</td>
                <td>${venta.sale_price}</td>
                <td>${venta.discount || 0}</td>
                <td>${venta.channel || 'N/A'}</td>
                <td>${new Date(venta.sale_date).toLocaleDateString()}</td>
                <td>${venta.vendedor || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-danger btn-delete-venta" data-id="${venta.id}">Eliminar</button>
                </td>
            `;
            ventasTbody.appendChild(tr);
        });
    };

    const loadProducts = async () => {
        try {
            const data = await window.api.getProductos();
            if (data.success) {
                allProducts = data.productos;
                ventaProductoSelect.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>';
                allProducts.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id;
                    option.textContent = p.name;
                    ventaProductoSelect.appendChild(option);
                });
            } else {
                showNotification(`Error al cargar productos: ${data.message}`, 'danger');
            }
        } catch (error) {
            console.error('Error de red:', error);
            showNotification(`Error de red al cargar productos: ${error.message}`, 'danger');
        }
    };

    // --- Event Listeners ---
    btnNuevaVenta.addEventListener('click', () => {
        formVenta.reset();
        document.getElementById('modalVentaLabel').textContent = 'Registrar Venta';
        modalVenta.show();
    });

    formVenta.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!formVenta.checkValidity()) {
            e.stopPropagation();
            formVenta.classList.add('was-validated');
            return;
        }
        const formData = new FormData(formVenta);
        const ventaData = Object.fromEntries(formData.entries());
        
        try {
            const currentUser = await window.api.getCurrentUser();
            if (!currentUser) {
                showNotification('No se pudo identificar al usuario. Por favor, reinicie sesión.', 'danger');
                return;
            }
            ventaData.created_by = currentUser.id;

            const result = await window.api.createVenta(ventaData);
            if (result.success) {
                modalVenta.hide();
                showNotification('Venta registrada con éxito');
                loadVentas();
            } else {
                showNotification(`Error: ${result.message}`, 'danger');
            }
        } catch (error) {
            console.error('Error al guardar venta:', error);
            showNotification(`Error al guardar venta: ${error.message}`, 'danger');
        }
    });

    ventasTbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-delete-venta')) {
            const id = e.target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
                try {
                    const result = await window.api.deleteVenta(id);
                    if (result.success) {
                        showNotification('Venta eliminada con éxito');
                        loadVentas();
                    } else {
                        showNotification(`Error: ${result.message}`, 'danger');
                    }
                } catch (error) {
                    console.error('Error al eliminar venta:', error);
                    showNotification(`Error al eliminar venta: ${error.message}`, 'danger');
                }
            }
        }
    });

    btnExportarVentas.addEventListener('click', () => {
        window.api.exportSalesPDF();
    });

    btnExportarCsv.addEventListener('click', () => {
        window.api.exportSalesCSV();
    });

    // Carga inicial
    loadVentas();
    loadProducts();
})();