// HOTEL MANAGEMENT SYSTEM - USERS MODULE (API VERSION)
import { generateUserId, showFormContainer, hideFormContainer } from './utils.js';

let users = [];
let bookings = [];
const API_URL = 'http://localhost:3001/api';

async function fetchUsers() {
    const res = await fetch(`${API_URL}/clients`);
    users = await res.json();
    return users;
}

async function fetchBookings() {
    const res = await fetch(`${API_URL}/bookings`);
    bookings = await res.json();
    return bookings;
}

async function renderUsersTable() {
    await fetchUsers();
    const usersTableBody = document.querySelector('#manage-users table tbody');
    if (!usersTableBody) return;
    usersTableBody.innerHTML = '';
    users.filter(u => !u.isAdmin).forEach(user => {
        usersTableBody.innerHTML += `
        <tr>
            <td>${user.id}</td>
            <td>${user.fullname}</td>
            <td>${user.email}</td>
            <td>${user.phone || ''}</td>
            <td>${user.registrationDate || ''}</td>
            <td>
                <button class="btn btn-sm btn-info edit-user-btn" data-id="${user.id}">Редактировать</button>
                <button class="btn btn-sm btn-warning view-history-btn" data-id="${user.id}">История</button>
                <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.id}">Удалить</button>
            </td>
        </tr>`;
    });
}

async function showUserHistory(userId) {
    await fetchBookings();
    const user = users.find(u => u.id === userId);
    const historyDiv = document.getElementById('user-booking-history-admin');
    if (!historyDiv) return;
    const userBookings = bookings.filter(b => b.userId === userId);
    let html = `<h3>История пребываний клиента:</h3>`;
    if (userBookings.length === 0) {
        html += '<p><em>Нет бронирований для этого клиента.</em></p>';
    } else {
        html += `<table><thead><tr><th>ID Брони</th><th>Заезд</th><th>Выезд</th><th>Номер</th><th>Статус</th></tr></thead><tbody>`;
        userBookings.forEach(b => {
            html += `<tr><td>${b.id}</td><td>${b.checkinDate}</td><td>${b.checkoutDate}</td><td>${b.roomType}</td><td>${b.status}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    historyDiv.innerHTML = html;
}

function isValidEmail(email) {
    // Простая регулярка для email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone) {
    // Только цифры, пробелы, +, -, скобки
    return /^([+\d\s\-()]{7,20})$/.test(phone);
}

function initUsersModule() {
    renderUsersTable();

    const addNewUserBtn = document.getElementById('add-new-user-btn');
    const userFormContainer = document.getElementById('user-form-container');
    const userForm = document.getElementById('user-form');
    const userFormTitle = document.getElementById('user-form-title');
    const cancelUserFormBtn = document.getElementById('cancel-user-form');
    const usersTableBody = document.querySelector('#manage-users table tbody');

    if (addNewUserBtn) {
        addNewUserBtn.addEventListener('click', () => {
            showFormContainer('user-form-container', 'user-form-title', 'Добавить нового клиента', 'user-form');
            userForm.reset();
            document.getElementById('user-id').value = '';
            document.getElementById('user-booking-history-admin').innerHTML = '<h3>История пребываний клиента:</h3><p><em>(Здесь будет отображаться история пребываний выбранного клиента)</em></p>';
        });
    }
    if (cancelUserFormBtn) {
        cancelUserFormBtn.addEventListener('click', () => {
            hideFormContainer('user-form-container');
        });
    }
    if (userForm) {
        userForm.onsubmit = async function(e) {
            e.preventDefault();
            // Валидация email и телефона
            const email = document.getElementById('user-email').value.trim();
            const phone = document.getElementById('user-phone').value.trim();
            let errorMsg = '';
            if (!isValidEmail(email)) {
                errorMsg += 'Введите корректный email!\n';
            }
            if (phone && !isValidPhone(phone)) {
                errorMsg += 'Телефон должен содержать только цифры, пробелы, +, -, скобки!\n';
            }
            if (errorMsg) {
                alert(errorMsg);
                return;
            }
            let id = document.getElementById('user-id').value;
            if (!id) {
                id = generateUserId();
            }
            const user = {
                id,
                fullname: document.getElementById('user-fullname').value,
                email,
                phone,
                password: document.getElementById('user-password').value || '',
                registrationDate: document.getElementById('user-id').value ? users.find(u => u.id === id).registrationDate : new Date().toISOString().slice(0,10),
                notes: document.getElementById('user-notes').value || ''
            };
            if (document.getElementById('user-id').value) {
                //редактирование
                await fetch(`${API_URL}/clients/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
            } else {
                //добавление
                await fetch(`${API_URL}/clients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
            }
            await renderUsersTable();
            hideFormContainer('user-form-container');
        };
    }
    if (usersTableBody) {
        usersTableBody.addEventListener('click', async (event) => {
            event.preventDefault();
            const target = event.target;
            const userId = target.dataset.id;
            await fetchUsers();
            //редактировать
            if (target.classList.contains('edit-user-btn')) {
                const user = users.find(u => u.id === userId);
                if (user) {
                    showFormContainer('user-form-container', 'user-form-title', 'Редактировать клиента', 'user-form');
                    document.getElementById('user-id').value = user.id;
                    document.getElementById('user-fullname').value = user.fullname;
                    document.getElementById('user-email').value = user.email;
                    document.getElementById('user-phone').value = user.phone || '';
                    document.getElementById('user-password').value = '';
                    document.getElementById('user-notes').value = user.notes || '';
                    showUserHistory(user.id);
                }
            }
            //история
            if (target.classList.contains('view-history-btn')) {
                showFormContainer('user-form-container', 'user-form-title', 'История клиента', 'user-form');
                const user = users.find(u => u.id === userId);
                if (user) {
                    document.getElementById('user-id').value = user.id;
                    document.getElementById('user-fullname').value = user.fullname;
                    document.getElementById('user-email').value = user.email;
                    document.getElementById('user-phone').value = user.phone || '';
                    document.getElementById('user-password').value = '';
                    document.getElementById('user-notes').value = user.notes || '';
                    showUserHistory(user.id);
                }
            }
            //удалить
            if (target.classList.contains('delete-user-btn')) {
                if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                    await fetch(`${API_URL}/clients/${userId}`, {
                        method: 'DELETE'
                    });
                    await renderUsersTable();
                }
            }
        });
    }
}

export { initUsersModule, renderUsersTable }; 