// ==========================================
// PMS System - Main Application Logic
// ==========================================

// 1. Configuration
const API_URL = 'https://script.google.com/macros/s/AKfycbwPRwOzCa0DLfHBrpyVTJqy4dnxZot8ZeJt1bGJATAT-jBk_NrBf-nxGlrfn_oEoIUT/exec';

// 2. Global State
const state = {
    moldMaster: [],
    customers: [],
    products: [],
    machines: [],
    partners: [],
    isLoading: false
};

// 3. Initialization
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModal();
    loadData();
});

// 4. Navigation Logic
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            // Add active class to clicked
            item.classList.add('active');
            const tabId = item.dataset.tab;
            document.getElementById(`${tabId}-view`).classList.add('active');

            // Update Title
            pageTitle.textContent = item.querySelector('span').textContent;
        });
    });
}

// 5. Dashboard Logic
function renderDashboard() {
    // Calculate KPIs
    const totalMolds = state.moldMaster.length;
    const totalCustomers = state.customers.length;
    const totalMachines = state.machines.length;

    // Calculate Recent Registrations (Current Month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const recentMolds = state.moldMaster.filter(item => {
        if (!item['등록일']) return false;
        const date = new Date(item['등록일']);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    // Update DOM
    document.getElementById('kpi-total-molds').textContent = totalMolds;
    document.getElementById('kpi-recent-reg').textContent = recentMolds;
    document.getElementById('kpi-customers').textContent = totalCustomers;
    document.getElementById('kpi-machines').textContent = totalMachines;
}

// 6. Inventory Logic
function renderInventoryFilters() {
    const filterSelect = document.getElementById('customer-filter');

    // Clear existing options except 'all'
    filterSelect.innerHTML = '<option value="all">모든 고객사</option>';

    state.customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer['거래처기호']; // Use code as value
        option.textContent = customer['거래처명'];
        filterSelect.appendChild(option);
    });

    // Add Event Listeners for Filter and Search
    filterSelect.addEventListener('change', handleFilterSearch);
    document.getElementById('mold-search').addEventListener('input', handleFilterSearch);
}

function handleFilterSearch() {
    const searchTerm = document.getElementById('mold-search').value.toLowerCase();
    const selectedCustomer = document.getElementById('customer-filter').value;

    const filteredData = state.moldMaster.filter(item => {
        // Search Condition
        const searchMatch =
            (item['금형명'] && item['금형명'].toLowerCase().includes(searchTerm)) ||
            (item['ID'] && String(item['ID']).toLowerCase().includes(searchTerm)) ||
            (item['제품명'] && item['제품명'].toLowerCase().includes(searchTerm));

        // Filter Condition
        const customerMatch = selectedCustomer === 'all' || item['고객사코드'] === selectedCustomer;

        return searchMatch && customerMatch;
    });

    renderInventoryTable(filteredData);
}

function renderInventoryTable(data) {
    const tbody = document.getElementById('mold-table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">검색 결과가 없습니다.</td></tr>';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');

        // Format Date
        let dateStr = '';
        if (item['등록일']) {
            const d = new Date(item['등록일']);
            dateStr = d.toLocaleDateString();
        }

        // Find Customer Name
        const customerCode = item['고객사코드'];
        const customer = state.customers.find(c => c['거래처기호'] === customerCode);
        const customerName = customer ? customer['거래처명'] : customerCode;

        tr.innerHTML = `
            <td>${item['ID'] || ''}</td>
            <td>${customerName || ''}</td>
            <td>${item['제품명'] || ''}</td>
            <td style="font-weight: 500; color: var(--text-primary);">${item['금형명'] || ''}</td>
            <td>${item['버전'] || ''}</td>
            <td>${item['설비'] || ''}</td>
            <td>${dateStr}</td>
            <td>
                <button class="icon-btn"><i class="ri-edit-line"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 7. Modal & Form Logic
function initModal() {
    const modal = document.getElementById('add-mold-modal');
    const openBtn = document.getElementById('btn-open-add-mold');
    const closeBtns = document.querySelectorAll('.close-modal');
    const form = document.getElementById('add-mold-form');

    // Open Modal
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            populateModalOptions();
            modal.classList.add('active');
        });
    }

    // Close Modal
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Auto-generate ID listeners
    const productInput = form.querySelector('input[name="productName"]');
    const versionInput = form.querySelector('input[name="version"]');
    productInput.id = 'modal-product-input';
    versionInput.id = 'modal-version-input';

    [document.getElementById('modal-customer-select'), productInput, versionInput].forEach(input => {
        input.addEventListener('input', generateMoldId);
        input.addEventListener('change', generateMoldId);
    });

    // Handle Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        // Ensure ID is generated before submit if it wasn't already
        if (!document.getElementById('modal-id-input').value) {
            generateMoldId();
        }

        const data = {
            id: document.getElementById('modal-id-input').value,
            customerCode: formData.get('customerCode'),
            productName: formData.get('productName'),
            moldName: formData.get('moldName'),
            version: formData.get('version'),
            machine: formData.get('machine')
        };

        await submitNewMold(data);
    });
}

function generateMoldId() {
    const customerCode = document.getElementById('modal-customer-select').value;
    const productName = document.getElementById('modal-product-input').value.trim();
    const version = document.getElementById('modal-version-input').value.trim();
    const idInput = document.getElementById('modal-id-input');

    if (!customerCode || !productName || !version) {
        idInput.value = '';
        idInput.placeholder = '고객사, 제품명, 버전을 모두 입력하세요';
        return;
    }

    // Calculate Sequence based on Global Total Count + 1
    // User Requirement: "순번은 총등록된 전체금형데이터수+1"
    // Format: CustomerCode-ProductName-Sequence-Version

    const totalCount = state.moldMaster.length;
    const nextSeq = totalCount + 1;
    const seqStr = String(nextSeq).padStart(4, '0');

    const newId = `${customerCode}-${productName}-${seqStr}-${version}`;
    idInput.value = newId;
}

function populateModalOptions() {
    const custSelect = document.getElementById('modal-customer-select');
    const machSelect = document.getElementById('modal-machine-select');

    // Populate Customers
    custSelect.innerHTML = '<option value="">선택하세요</option>';
    state.customers.forEach(c => {
        const option = document.createElement('option');
        option.value = c['거래처기호'];
        option.textContent = c['거래처명'];
        custSelect.appendChild(option);
    });

    // Populate Machines
    machSelect.innerHTML = '<option value="">선택하세요</option>';
    state.machines.forEach(m => {
        const option = document.createElement('option');
        option.value = m['설비명'];
        option.textContent = m['설비명'];
        machSelect.appendChild(option);
    });
}

async function submitNewMold(data) {
    setLoading(true);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'addMold',
                data: data
            })
        });

        alert('등록 요청을 보냈습니다. (잠시 후 목록이 갱신됩니다)');
        document.getElementById('add-mold-modal').classList.remove('active');
        document.getElementById('add-mold-form').reset();

        // Reload data to see the new item
        setTimeout(loadData, 1000);

    } catch (error) {
        console.error('Error submitting form:', error);
        alert('등록 중 오류가 발생했습니다.');
    } finally {
        setLoading(false);
    }
}

// 8. Utilities
async function loadData() {
    setLoading(true);
    try {
        console.log("Fetching data from:", API_URL);

        // Fetch all required data in parallel
        const [moldsRes, customersRes, productsRes, machinesRes, partnersRes] = await Promise.all([
            fetch(`${API_URL}?action=getMoldMaster`),
            fetch(`${API_URL}?action=getCustomerCodes`),
            fetch(`${API_URL}?action=getProductNames`),
            fetch(`${API_URL}?action=getMachines`),
            fetch(`${API_URL}?action=getPartners`)
        ]);

        // Parse JSON
        const molds = await moldsRes.json();
        const customers = await customersRes.json();
        const products = await productsRes.json();
        const machines = await machinesRes.json();
        const partners = await partnersRes.json();

        // Check for API errors
        if (molds.error) throw new Error(molds.error);

        // Update State
        state.moldMaster = molds;
        state.customers = customers;
        state.products = products;
        state.machines = machines;
        state.partners = partners;

        console.log("Data loaded successfully:", state);

        // Render UI
        renderDashboard();
        renderInventoryFilters();
        renderInventoryTable(state.moldMaster);

    } catch (error) {
        console.error("Error loading data:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.\n" + error.message);
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        document.body.style.cursor = 'wait';
        document.body.style.opacity = '0.7';
    } else {
        document.body.style.cursor = 'default';
        document.body.style.opacity = '1';
    }
}
