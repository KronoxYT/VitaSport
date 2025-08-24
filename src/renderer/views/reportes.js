(function() {
    const btnReporteGeneral = document.getElementById('btn-reporte-general');
    const btnReporteInventario = document.getElementById('btn-reporte-inventario');
    const btnReporteVentas = document.getElementById('btn-reporte-ventas');

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

    async function handlePdfExport(apiFunction, reportName) {
        try {
            showNotification(`Generando reporte de ${reportName}...`, 'info');
            const result = await apiFunction();
            if (result.success) {
                showNotification(`El reporte de ${reportName} ha comenzado a descargarse.`)
            } else {
                showNotification(`Error al generar el reporte de ${reportName}: ${result.message}`, 'danger');
            }
        } catch (error) {
            console.error(`Error al exportar PDF de ${reportName}:`, error);
            showNotification(`Error al generar el reporte de ${reportName}: ${error.message}`, 'danger');
        }
    }

    btnReporteGeneral.addEventListener('click', () => {
        handlePdfExport(window.api.exportGeneralPDF, 'general');
    });

    btnReporteInventario.addEventListener('click', () => {
        handlePdfExport(window.api.exportInventoryPDF, 'inventario');
    });

    btnReporteVentas.addEventListener('click', () => {
        handlePdfExport(window.api.exportSalesPDF, 'ventas');
    });

    console.log('Vista de Reportes inicializada.');
})();