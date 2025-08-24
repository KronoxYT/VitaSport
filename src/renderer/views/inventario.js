(function() {
    let allProducts = [];

    // Elementos del DOM
    const productosTbody = document.getElementById('productos-tbody');
    const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    const modalProducto = $('#modalProducto');
    const formProducto = document.getElementById('formProducto');
    const modalProductoLabel = document.getElementById('modalProductoLabel');
    const filtroBusqueda = document.getElementById('filtro-busqueda');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const selectImageBtn = document.getElementById('select-image-btn');
    const imagePreview = document.getElementById('image-preview');
    const imagePathInput = document.getElementById('image-path');

    // Elementos para movimiento de stock y exportación
    const btnMovimientoStock = document.getElementById('btn-movimiento-stock');
    const modalMovimientoStock = $('#modalMovimientoStock');
    const formMovimientoStock = document.getElementById('formMovimientoStock');
    const selectProductoMovimiento = document.getElementById('mov-producto');
    const btnExportarInventario = document.getElementById('btn-exportar-inventario');

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

    // --- Lógica Principal ---
    function getStockBadge(stock, minStock) {
        if (stock <= 0) return '<span class="badge badge-danger">Agotado</span>';
        if (minStock && stock <= minStock) return `<span class="badge badge-warning">${stock}</span>`;
        return `<span class="badge badge-success">${stock}</span>`;
    }

    function renderizarProductos(productos) {
        productosTbody.innerHTML = '';
        if (productos.length === 0) {
            productosTbody.innerHTML = '<tr><td colspan="9" class="text-center">No se encontraron productos.</td></tr>';
            return;
        }
        productos.forEach(prod => {
            const stockBadge = getStockBadge(prod.stock_real || 0, prod.min_stock);
            const imageSrc = prod.image_path ? `file://${prod.image_path}` : 'https://via.placeholder.com/50';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${imageSrc}" width="50" height="50" style="object-fit: cover;"></td>
                <td>${prod.sku || 'N/A'}</td>
                <td>${prod.name}</td>
                <td>${prod.brand || ''}</td>
                <td>${prod.category || ''}</td>
                <td>${stockBadge}</td>
                <td>${prod.sale_price || '0.00'}</td>
                <td>${prod.expiry_date ? new Date(prod.expiry_date).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-editar" data-id="${prod.id}">✏️</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${prod.id}">🗑️</button>
                </td>
            `;
            productosTbody.appendChild(tr);
        });
    }

    async function cargarProductos() {
        try {
            const data = await window.api.getProductos();
            if (data.success) {
                allProducts = data.productos;
                renderizarProductos(allProducts);
                const categorias = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
                filtroCategoria.innerHTML = '<option value="">Filtrar por categoría...</option>';
                categorias.forEach(cat => {
                    filtroCategoria.innerHTML += `<option value="${cat}">${cat}</option>`;
                });
            } else {
                showNotification(`Error al cargar productos: ${data.message}`, 'danger');
            }
        } catch (error) {
            console.error("Error al cargar productos:", error);
            showNotification(`Error al cargar productos: ${error.message}`, 'danger');
        }
    }

    async function guardarProducto(data, id) {
        try {
            const result = id 
                ? await window.api.updateProducto(id, data)
                : await window.api.createProducto(data);

            if (result.success) {
                modalProducto.modal('hide');
                showNotification(`Producto ${id ? 'actualizado' : 'creado'} con éxito.`);
                cargarProductos();
            } else {
                showNotification(`Error al guardar producto: ${result.message}`, 'danger');
            }
        } catch (error) {
             console.error("Error al guardar producto:", error);
             showNotification(`Error: ${error.message}`, 'danger');
        }
    }

    async function eliminarProducto(id) {
        if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
        try {
            const result = await window.api.deleteProducto(id);
            if (result.success) {
                showNotification('Producto eliminado con éxito.');
                cargarProductos();
            } else {
                showNotification('No se pudo eliminar el producto.', 'danger');
            }
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            showNotification(`Error: ${error.message}`, 'danger');
        }
    }
    
    async function editarProducto(id) {
        try {
            const data = await window.api.getProductoById(id);
            if (data.success && data.producto) {
                const prod = data.producto;
                formProducto.reset();
                imagePreview.style.display = 'none';
                document.getElementById('producto-id').value = id;
                modalProductoLabel.textContent = 'Editar Producto';
                Object.keys(prod).forEach(key => {
                    if (formProducto.elements[key]) {
                        const input = formProducto.elements[key];
                        if (input.type === 'date' && prod[key]) {
                            input.value = new Date(prod[key]).toISOString().split('T')[0];
                        } else {
                            input.value = prod[key] || '';
                        }
                    }
                });
                if (prod.image_path) {
                    imagePreview.src = `file://${prod.image_path}`;
                    imagePreview.style.display = 'block';
                    imagePathInput.value = prod.image_path;
                }
                modalProducto.modal('show');
            } else {
                showNotification('Producto no encontrado.', 'danger');
            }
        } catch (error) {
            console.error("Error al editar producto:", error);
            showNotification(`Error: ${error.message}`, 'danger');
        }
    }

    function filtrarProductos() {
        const texto = filtroBusqueda.value.toLowerCase();
        const categoria = filtroCategoria.value;

        const productosFiltrados = allProducts.filter(prod => {
            const matchTexto = prod.name.toLowerCase().includes(texto) || (prod.sku && prod.sku.toLowerCase().includes(texto));
            const matchCategoria = categoria ? prod.category === categoria : true;
            return matchTexto && matchCategoria;
        });

        renderizarProductos(productosFiltrados);
    }

    // --- Event Listeners ---
    btnNuevoProducto.addEventListener('click', () => {
        formProducto.reset();
        document.getElementById('producto-id').value = '';
        modalProductoLabel.textContent = 'Añadir Producto';
        imagePreview.style.display = 'none';
        imagePathInput.value = '';
        modalProducto.modal('show');
    });

    formProducto.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!formProducto.checkValidity()) {
            e.stopPropagation();
            formProducto.classList.add('was-validated');
            return;
        }
        const formData = new FormData(formProducto);
        const data = Object.fromEntries(formData.entries());
        const id = data.id;
        delete data.id;
        guardarProducto(data, id);
    });

    productosTbody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('btn-editar')) {
            editarProducto(target.dataset.id);
        } else if (target.classList.contains('btn-eliminar')) {
            eliminarProducto(target.dataset.id);
        }
    });

    selectImageBtn.addEventListener('click', async () => {
        const path = await window.api.selectImage();
        if (path) {
            imagePathInput.value = path;
            imagePreview.src = `file://${path}`;
            imagePreview.style.display = 'block';
        }
    });

    filtroBusqueda.addEventListener('keyup', filtrarProductos);
    filtroCategoria.addEventListener('change', filtrarProductos);

    // --- Lógica para Funcionalidades Nuevas ---
    btnMovimientoStock.addEventListener('click', () => {
        // Poblar el select con los productos actuales
        selectProductoMovimiento.innerHTML = '';
        allProducts.forEach(p => {
            selectProductoMovimiento.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });
        modalMovimientoStock.modal('show');
    });

    formMovimientoStock.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!formMovimientoStock.checkValidity()) {
            e.stopPropagation();
            formMovimientoStock.classList.add('was-validated');
            return;
        }
        const formData = new FormData(formMovimientoStock);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const currentUser = await window.api.getCurrentUser();
            if (!currentUser) {
                showNotification('Error: No se pudo identificar al usuario actual. Por favor, inicie sesión de nuevo.', 'danger');
                return;
            }
            data.created_by = currentUser.id;
            data.quantity = parseInt(data.quantity, 10);

            const result = await window.api.createStockMovement(data);
            if (result.success) {
                modalMovimientoStock.modal('hide');
                showNotification('Movimiento de stock registrado con éxito.');
                cargarProductos(); // Recargar para ver el stock actualizado
            } else {
                showNotification(`Error: ${result.message}`, 'danger');
            }
        } catch (error) {
            console.error('Error al registrar movimiento:', error);
            showNotification(`Error: ${error.message}`, 'danger');
        }
    });

    btnExportarInventario.addEventListener('click', async () => {
        try {
            const result = await window.api.exportInventoryPDF();
            if (result.success) {
                showNotification('La descarga del reporte PDF ha comenzado.');
            } else {
                showNotification(`Error al exportar PDF: ${result.message}`, 'danger');
            }
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            showNotification(`Error: ${error.message}`, 'danger');
        }
    });

    // Carga inicial
    cargarProductos();
})();