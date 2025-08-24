(function() {
    let salesByMonthChart = null;
    let salesByProductChart = null;

    async function loadDashboardData() {
        try {
            // Cargar KPIs
            const kpis = await window.api.getDashboardKPIs();
            document.getElementById('kpi-total-products').textContent = kpis.totalProducts;
            document.getElementById('kpi-total-sales').textContent = kpis.totalSales;
            document.getElementById('kpi-low-stock-alerts').textContent = kpis.lowStockAlerts;

            // Cargar datos para gráficos
            const salesByMonthData = await window.api.getSalesByMonth();
            const salesByProductData = await window.api.getSalesByProduct();

            // Renderizar gráficos
            renderSalesByMonthChart(salesByMonthData.datos);
            renderSalesByProductChart(salesByProductData.datos);

        } catch (error) {
            console.error("Error al cargar datos del dashboard:", error);
            // Opcional: mostrar una notificación de error
        }
    }

    function renderSalesByMonthChart(data) {
        const ctx = document.getElementById('salesByMonthChart').getContext('2d');
        const labels = data.map(d => d.mes);
        const values = data.map(d => d.total);

        if (salesByMonthChart) {
            salesByMonthChart.destroy();
        }

        salesByMonthChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Unidades Vendidas',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function renderSalesByProductChart(data) {
        const ctx = document.getElementById('salesByProductChart').getContext('2d');
        const labels = data.map(d => d.producto);
        const values = data.map(d => d.total);

        if (salesByProductChart) {
            salesByProductChart.destroy();
        }

        salesByProductChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas',
                    data: values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    }

    document.getElementById('btn-refresh-dashboard').addEventListener('click', loadDashboardData);

    // Carga inicial
    loadDashboardData();
})();