// HOTEL MANAGEMENT SYSTEM - FINANCES MODULE
import { getData, saveData, generateId } from './utils.js';

function getFinances() {
    return getData('finances') || { income: [], expenses: [] };
}

function saveFinances(finances) {
    saveData('finances', finances);
}
function renderIncomeTable() {
    const finances = getFinances();
    const tbody = document.querySelector('#income-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    finances.income.forEach((item, idx) => {
        tbody.innerHTML += `<tr>
            <td>${item.date}</td>
            <td>${item.source}</td>
            <td>${item.description || ''}</td>
            <td>${item.amount}</td>
            <td><button class='btn btn-sm btn-danger' data-idx='${idx}' data-type='income'>Удалить</button></td>
        </tr>`;
    });
    updateDashboardWidgets();
}
function renderExpenseTable() {
    const finances = getFinances();
    const tbody = document.querySelector('#expense-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    finances.expenses.forEach((item, idx) => {
        tbody.innerHTML += `<tr>
            <td>${item.date}</td>
            <td>${item.category}</td>
            <td>${item.description || ''}</td>
            <td>${item.amount}</td>
            <td><button class='btn btn-sm btn-danger' data-idx='${idx}' data-type='expense'>Удалить</button></td>
        </tr>`;
    });
    updateDashboardWidgets();
}
function initFinancesModule() {
    updateDashboardWidgets();
    renderIncomeTable();
    renderExpenseTable();
    //добавление дохода
    const addIncomeBtn = document.getElementById('add-income-btn');
    const incomeModal = document.getElementById('income-modal');
    const closeIncomeModal = document.getElementById('close-income-modal');
    const incomeForm = document.getElementById('income-form');
    if (addIncomeBtn && incomeModal && closeIncomeModal && incomeForm) {
        addIncomeBtn.onclick = () => { incomeModal.style.display = 'flex'; };
        closeIncomeModal.onclick = () => { incomeModal.style.display = 'none'; };
        incomeForm.onsubmit = function(e) {
            e.preventDefault();
            const finances = getFinances();
            finances.income.push({
                date: document.getElementById('income-date').value,
                source: document.getElementById('income-source').value,
                description: document.getElementById('income-description').value,
                amount: parseFloat(document.getElementById('income-amount').value)
            });
            saveFinances(finances);
            renderIncomeTable();
            incomeModal.style.display = 'none';
            incomeForm.reset();
        };
    }
    //добавление расхода
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const expenseModal = document.getElementById('expense-modal');
    const closeExpenseModal = document.getElementById('close-expense-modal');
    const expenseForm = document.getElementById('expense-form');
    if (addExpenseBtn && expenseModal && closeExpenseModal && expenseForm) {
        addExpenseBtn.onclick = () => { expenseModal.style.display = 'flex'; };
        closeExpenseModal.onclick = () => { expenseModal.style.display = 'none'; };
        expenseForm.onsubmit = function(e) {
            e.preventDefault();
            const finances = getFinances();
            finances.expenses.push({
                date: document.getElementById('expense-date').value,
                category: document.getElementById('expense-category').value,
                description: document.getElementById('expense-description').value,
                amount: parseFloat(document.getElementById('expense-amount').value)
            });
            saveFinances(finances);
            renderExpenseTable();
            expenseModal.style.display = 'none';
            expenseForm.reset();
        };
    }
    //удаление дохода/расхода
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-danger') && e.target.dataset.idx) {
            const idx = parseInt(e.target.dataset.idx);
            const type = e.target.dataset.type;
            const finances = getFinances();
            if (type === 'income') {
                finances.income.splice(idx, 1);
                saveFinances(finances);
                renderIncomeTable();
            } else if (type === 'expense') {
                finances.expenses.splice(idx, 1);
                saveFinances(finances);
                renderExpenseTable();
            }
        }
    });
    //экспорт доходов в CSV
    const exportIncomeCsvBtn = document.getElementById('export-income-csv-btn');
    if (exportIncomeCsvBtn) {
        exportIncomeCsvBtn.onclick = () => {
            const finances = getFinances();
            downloadCsv(finances.income, 'income.csv');
        };
    }
    //экспорт расходов в CSV
    const exportExpenseCsvBtn = document.getElementById('export-expense-csv-btn');
    if (exportExpenseCsvBtn) {
        exportExpenseCsvBtn.onclick = () => {
            const finances = getFinances();
            downloadCsv(finances.expenses, 'expenses.csv');
        };
    }
    updateDashboardWidgets();
}

function downloadCsv(data, filename) {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(',')].concat(data.map(row => keys.map(k => '"'+(row[k]||'')+'"').join(','))).join('\n');
    // Добавляем BOM для корректного отображения кириллицы в Excel
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getMonthlySums(data, monthsBack = 3) {
    const now = new Date();
    let monthlySums = [];
    for (let i = 0; i < monthsBack; i++) {
        let year = now.getFullYear();
        let month = now.getMonth() + 1 - i;
        // Корректируем год и месяц, если ушли в предыдущий год
        while (month <= 0) {
            month += 12;
            year--;
        }
        const filtered = data.filter(item => {
            const d = new Date(item.date);
            return d.getFullYear() === year && (d.getMonth() + 1) === month;
        });
        const sum = filtered.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
        monthlySums.push(sum);
    }
    return monthlySums;
}

function updateDashboardWidgets() {
    //финансы
    const finances = getFinances();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    //доходы за месяц
    const income = finances.income.filter(i => {
        const d = new Date(i.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
    }).reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    //расходы за месяц
    const expenses = finances.expenses.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
    }).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    //прибыль
    const profit = income - expenses;
    //средняя загрузка
    const bookings = getData('bookings') || [];
    const rooms = getData('rooms') || [];
    let totalRoomDays = rooms.length * new Date(year, month, 0).getDate();
    let busyRoomDays = 0;
    bookings.forEach(b => {
        const checkin = new Date(b.checkinDate);
        const checkout = new Date(b.checkoutDate);
        if (checkin.getFullYear() === year && (checkin.getMonth() + 1) === month ||
            checkout.getFullYear() === year && (checkout.getMonth() + 1) === month) {
            //считаем только дни в этом месяце
            let start = checkin;
            let end = checkout;
            if (start.getFullYear() < year || (start.getFullYear() === year && (start.getMonth() + 1) < month)) {
                start = new Date(year, month - 1, 1);
            }
            if (end.getFullYear() > year || (end.getFullYear() === year && (end.getMonth() + 1) > month)) {
                end = new Date(year, month, 0);
            }
            busyRoomDays += (end - start) / (1000 * 60 * 60 * 24);
        }
    });
    const occupancy = totalRoomDays ? Math.round((busyRoomDays / totalRoomDays) * 100) : 0;
    // прогноз дохода и расходов (среднее за 3 месяца)
    const incomeSums = getMonthlySums(finances.income, 3);
    const expenseSums = getMonthlySums(finances.expenses, 3);
    const forecastIncome = incomeSums.length ? incomeSums.reduce((a, b) => a + b, 0) / incomeSums.length : 0;
    const forecastExpense = expenseSums.length ? expenseSums.reduce((a, b) => a + b, 0) / expenseSums.length : 0;
    // обновление
    const elIncome = document.getElementById('dashboard-total-income');
    const elExpenses = document.getElementById('dashboard-total-expenses');
    const elProfit = document.getElementById('dashboard-net-profit');
    const elOccupancy = document.getElementById('dashboard-occupancy-rate');
    const elForecastIncome = document.getElementById('dashboard-forecast-income');
    const elForecastExpense = document.getElementById('dashboard-forecast-expenses');
    if (elIncome) elIncome.textContent = income + ' руб.';
    if (elExpenses) elExpenses.textContent = expenses + ' руб.';
    if (elProfit) elProfit.textContent = profit + ' руб.';
    if (elOccupancy) elOccupancy.textContent = occupancy + '%';
    if (elForecastIncome) elForecastIncome.textContent = Math.round(forecastIncome) + ' руб.';
    if (elForecastExpense) elForecastExpense.textContent = Math.round(forecastExpense) + ' руб.';
}

export { 
    initFinancesModule, 
    renderIncomeTable, 
    renderExpenseTable
}; 