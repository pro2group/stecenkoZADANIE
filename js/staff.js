// HOTEL MANAGEMENT SYSTEM - STAFF MODULE (API VERSION)
import { generateId, showFormContainer, hideFormContainer } from './utils.js';

let currentScheduleStaffId = null;
const API_URL = 'http://localhost:3001/api';
let staff = [];

async function fetchStaff() {
    const res = await fetch(`${API_URL}/staff`);
    staff = await res.json();
    return staff;
}

async function renderStaffTable() {
    await fetchStaff();
    const staffTableBody = document.querySelector('#manage-staff table tbody');
    if (!staffTableBody) return;
    staffTableBody.innerHTML = '';
    staff.forEach(emp => {
        staffTableBody.innerHTML += `
        <tr>
            <td data-label="ID">${emp.id}</td>
            <td data-label="ФИО">${emp.fullname}</td>
            <td data-label="Должность">${emp.position}</td>
            <td data-label="Роль">${emp.role}</td>
            <td data-label="Email">${emp.email || '-'}</td>
            <td data-label="Телефон">${emp.phone || '-'}</td>
            <td data-label="Действия">
                <button class="btn btn-sm btn-info edit-staff-btn" data-id="${emp.id}">Редактировать</button>
                <button class="btn btn-sm btn-warning manage-schedule-btn" data-id="${emp.id}">График</button>
                <button class="btn btn-sm btn-danger delete-staff-btn" data-id="${emp.id}">Удалить</button>
            </td>
        </tr>`;
    });
}

function initStaffModule() {
    renderStaffTable();
    const addNewStaffBtn = document.getElementById('add-new-staff-btn');
    const staffFormContainer = document.getElementById('staff-form-container');
    const staffForm = document.getElementById('staff-form');
    const staffFormTitle = document.getElementById('staff-form-title');
    const cancelStaffFormBtn = document.getElementById('cancel-staff-form');
    const staffTableBody = document.querySelector('#manage-staff table tbody');

    if (addNewStaffBtn) {
        addNewStaffBtn.addEventListener('click', () => {
            showFormContainer('staff-form-container', 'staff-form-title', 'Добавить нового сотрудника', 'staff-form');
            staffForm.reset();
            document.getElementById('staff-id').value = '';
        });
    }
    if (cancelStaffFormBtn) {
        cancelStaffFormBtn.addEventListener('click', () => {
            hideFormContainer('staff-form-container');
        });
    }
    if (staffForm) {
        staffForm.onsubmit = async function(e) {
            e.preventDefault();
            // Валидация email и телефона
            const email = document.getElementById('staff-email').value.trim();
            const phone = document.getElementById('staff-phone').value.trim();
            let errorMsg = '';
            if (email && !isValidEmail(email)) {
                errorMsg += 'Введите корректный email!\n';
            }
            if (phone && !isValidPhone(phone)) {
                errorMsg += 'Телефон должен содержать только цифры, пробелы, +, -, скобки!\n';
            }
            if (errorMsg) {
                alert(errorMsg);
                return;
            }
            const id = document.getElementById('staff-id').value || generateId('EMP');
            const emp = {
                id,
                fullname: document.getElementById('staff-fullname').value,
                position: document.getElementById('staff-position').value,
                role: document.getElementById('staff-role').value,
                email,
                phone,
                login: document.getElementById('staff-login').value,
                password: document.getElementById('staff-password').value,
                salary_rate: document.getElementById('staff-salary-rate').value,
                schedule_info: document.getElementById('staff-schedule-info').value,
                notes: document.getElementById('staff-notes').value
            };
            if (document.getElementById('staff-id').value) {
                //редактирование
                await fetch(`${API_URL}/staff/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(emp)
                });
            } else {
                //добавление
                await fetch(`${API_URL}/staff`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(emp)
                });
            }
            await renderStaffTable();
            hideFormContainer('staff-form-container');
        };
    }
    if (staffTableBody) {
        staffTableBody.addEventListener('click', async (event) => {
            event.preventDefault();
            const target = event.target;
            const staffId = target.dataset.id;
            await fetchStaff();
            //редактировать
            if (target.classList.contains('edit-staff-btn')) {
                const emp = staff.find(s => s.id === staffId);
                if (emp) {
                    showFormContainer('staff-form-container', 'staff-form-title', 'Редактировать сотрудника', 'staff-form');
                    document.getElementById('staff-id').value = emp.id;
                    document.getElementById('staff-fullname').value = emp.fullname;
                    document.getElementById('staff-position').value = emp.position;
                    document.getElementById('staff-role').value = emp.role;
                    document.getElementById('staff-email').value = emp.email;
                    document.getElementById('staff-phone').value = emp.phone;
                    document.getElementById('staff-login').value = emp.login;
                    document.getElementById('staff-password').value = '';
                    document.getElementById('staff-salary-rate').value = emp.salary_rate;
                    document.getElementById('staff-schedule-info').value = emp.schedule_info;
                    document.getElementById('staff-notes').value = emp.notes;
                }
            }
            //удалить
            if (target.classList.contains('delete-staff-btn')) {
                if (confirm('Удалить этого сотрудника?')) {
                    await fetch(`${API_URL}/staff/${staffId}`, { method: 'DELETE' });
                    await renderStaffTable();
                }
            }
            //график
            if (target.classList.contains('manage-schedule-btn')) {
                openStaffScheduleModal(staffId);
            }
        });
    }
}

//функция для открытия модального окна с расписанием сотрудника
function openStaffScheduleModal(staffId) {
    const modal = document.getElementById('staff-schedule-modal');
    const closeBtn = document.getElementById('close-staff-schedule-modal');
    if (!modal || !closeBtn) return;
    currentScheduleStaffId = staffId;
    renderStaffSchedule();
    modal.style.display = 'flex';
    closeBtn.onclick = () => { modal.style.display = 'none'; };
}

function renderStaffSchedule() {
    const infoDiv = document.getElementById('staff-schedule-info');
    if (!infoDiv || !currentScheduleStaffId) return;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone) {
    return /^([+\d\s\-()]{7,20})$/.test(phone);
}

export { initStaffModule, renderStaffTable }; 