// Application Logic

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initInventory();
    setupNavigation();
});

// --- Navigation Logic ---
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));

            // Show target section
            const tabId = item.dataset.tab;
            document.getElementById(`${tabId}-view`).classList.add('active');

            // Update Title
            pageTitle.textContent = item.querySelector('span').textContent;
        });
    });
}

// --- Dashboard Logic ---
function initDashboard() {
    updateKPIs();
    renderProductionChart();
    renderStatusChart();
}

function updateKPIs() {
    document.getElementById('kpi-production').textContent = productionData.kpi.today.toLocaleString();
    document.getElementById('kpi-utilization').textContent = `${productionData.kpi.utilization}%`;
    document.getElementById('kpi-molds').textContent = productionData.kpi.totalMolds;
    document.getElementById('kpi-repair').textContent = productionData.kpi.repairNeeded;
}

function renderProductionChart() {
    const ctx = document.getElementById('productionChart').getContext('2d');

    // Gradient for the line chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: productionData.daily.map(d => d.date),
            datasets: [{
                label: '생산량',
                data: productionData.daily.map(d => d.value),
                borderColor: '#3b82f6',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3b82f6',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

function renderStatusChart() {
    const ctx = document.getElementById('moldStatusChart').getContext('2d');

    // Calculate counts
    const normalCount = moldData.filter(m => m.status === 'normal').length;
    const repairCount = moldData.filter(m => m.status === 'repair').length;
    const disposalCount = moldData.filter(m => m.status === 'disposal').length;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['정상', '수리 필요', '폐기'],
            datasets: [{
                data: [normalCount, repairCount, disposalCount],
                backgroundColor: [
                    '#10b981', // Green
                    '#f59e0b', // Orange
                    '#ef4444'  // Red
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// --- Inventory Logic ---
function initInventory() {
    const tableBody = document.getElementById('mold-table-body');
    const searchInput = document.getElementById('mold-search');
    const statusFilter = document.getElementById('status-filter');

    function renderTable(data) {
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-secondary);">검색 결과가 없습니다.</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');

            let statusLabel = '';
            let statusClass = '';

            switch (item.status) {
                case 'normal': statusLabel = '정상'; statusClass = 'normal'; break;
                case 'repair': statusLabel = '수리 필요'; statusClass = 'repair'; break;
                case 'disposal': statusLabel = '폐기 예정'; statusClass = 'disposal'; break;
            }

            row.innerHTML = `
                <td>${item.id}</td>
                <td style="font-weight: 500; color: var(--text-primary);">${item.name}</td>
                <td>${item.spec}</td>
                <td>${item.location}</td>
                <td>${item.shots.toLocaleString()}</td>
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                <td>
                    <button class="icon-btn" style="width: 32px; height: 32px; font-size: 1rem;"><i class="ri-edit-line"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function filterData() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        const filtered = moldData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                item.id.toLowerCase().includes(searchTerm);
            const matchesStatus = statusValue === 'all' || item.status === statusValue;

            return matchesSearch && matchesStatus;
        });

        renderTable(filtered);
    }

    // Initial Render
    renderTable(moldData);

    // Event Listeners
    searchInput.addEventListener('input', filterData);
    statusFilter.addEventListener('change', filterData);
}
