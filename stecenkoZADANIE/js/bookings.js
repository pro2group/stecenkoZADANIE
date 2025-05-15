// HOTEL MANAGEMENT SYSTEM - BOOKINGS MODULE (API VERSION)
import { generateId, showFormContainer, hideFormContainer } from './utils.js';

let bookings = [];
let users = [];
let services = [];
let currentBookingServices = [];
const API_URL = 'http://localhost:3001/api';

async function fetchBookings() {
    const res = await fetch(`${API_URL}/bookings`);
    bookings = await res.json();
    return bookings;
}

async function fetchUsers() {
    const res = await fetch(`${API_URL}/clients`);
    users = await res.json();
    return users;
}

async function fetchServices() {
    const res = await fetch(`${API_URL}/services`);
    services = await res.json();
    return services;
}

function fillServicesSelect() {
    const selectServiceToAdd = document.getElementById('select-service-to-add');
    if (!selectServiceToAdd) return;
    selectServiceToAdd.innerHTML = '<option value="">Выберите услугу...</option>';
    services.forEach(svc => {
        selectServiceToAdd.innerHTML += `<option value="${svc.id}" data-price="${svc.price}" data-unit="${svc.unit}">${svc.name}</option>`;
    });
}

function renderAttachedServices() {
    const attachedServicesList = document.getElementById('attached-services-list');
    const totalServicesPriceSpan = document.getElementById('total-services-price');
    if (!attachedServicesList) return;
    attachedServicesList.innerHTML = '';
    if (!Array.isArray(currentBookingServices) || currentBookingServices.length === 0) {
        attachedServicesList.innerHTML = '<p><em>Услуги не добавлены.</em></p>';
    } else {
        currentBookingServices.forEach((svc, idx) => {
            attachedServicesList.innerHTML += `<div class="attached-service-item" data-idx="${idx}">
                <span>${svc.name} (x${svc.quantity}) - ${svc.price * svc.quantity} руб.</span>
                <button type="button" class="btn btn-xs btn-danger remove-attached-service-btn" data-idx="${idx}">Удалить</button>
            </div>`;
        });
    }
    const total = (Array.isArray(currentBookingServices) ? currentBookingServices : []).reduce((sum, svc) => sum + svc.price * svc.quantity, 0);
    if (totalServicesPriceSpan) totalServicesPriceSpan.textContent = total;
}

async function renderBookingsTable() {
    await fetchBookings();
    await fetchUsers();
    const bookingsTableBody = document.querySelector('#manage-bookings table tbody');
    if (!bookingsTableBody) return;
    bookingsTableBody.innerHTML = '';
    bookings.forEach(booking => {
        const user = users.find(u => u.id === booking.userId);
        bookingsTableBody.innerHTML += `
        <tr>
            <td data-label="ID Брони">${booking.id}</td>
            <td data-label="Клиент">${user ? user.fullname + ' (' + user.id + ')' : booking.userId}</td>
            <td data-label="Даты">${booking.checkinDate} - ${booking.checkoutDate}</td>
            <td data-label="Номер">${booking.roomType}</td>
            <td data-label="Гости (В/Д)">${booking.adults} / ${booking.children}</td>
            <td data-label="Статус"><span class="status-${booking.status}">${booking.status}</span></td>
            <td data-label="Стоимость">${booking.price} руб.</td>
            <td data-label="Действия">
                <button class="btn btn-sm btn-info edit-booking-admin-btn" data-id="${booking.id}">Просмотр/Редакт.</button>
                <button class="btn btn-sm btn-success confirm-booking-btn" data-id="${booking.id}">Подтвердить</button>
                <button class="btn btn-sm btn-danger cancel-booking-admin-btn" data-id="${booking.id}">Отменить</button>
            </td>
        </tr>`;
    });
}

function initBookingsModule() {
    //инициализация данных
    fetchBookings().then(() => {
        fetchUsers().then(() => {
            fetchServices().then(() => {
                currentBookingServices = [];
                renderBookingsTable();
            });
        });
    });

    const addNewBookingBtn = document.getElementById('add-new-booking-admin-btn');
    const bookingFormContainer = document.getElementById('booking-form-admin-container');
    const bookingForm = document.getElementById('booking-form-admin');
    const bookingFormTitle = document.getElementById('booking-form-admin-title');
    const cancelBookingFormBtn = document.getElementById('cancel-booking-admin-form');
    const checkinGuestBtn = document.getElementById('checkin-guest-btn');
    const checkoutGuestBtn = document.getElementById('checkout-guest-btn');
    const processRefundBtn = document.getElementById('process-refund-btn');
    const selectServiceToAdd = document.getElementById('select-service-to-add');
    const serviceQuantityInput = document.getElementById('service-quantity');
    const addServiceToBookingBtn = document.getElementById('add-service-to-booking-btn');
    const attachedServicesList = document.getElementById('attached-services-list');
    const totalServicesPriceSpan = document.getElementById('total-services-price');

    if (addNewBookingBtn) {
        addNewBookingBtn.addEventListener('click', async () => {
            showFormContainer('booking-form-admin-container', 'booking-form-admin-title', 'Создать новое бронирование', 'booking-form-admin');
            bookingForm.reset();
            document.getElementById('booking-id').value = '';
            document.getElementById('guest-details-fieldset').style.display = 'none';
            checkinGuestBtn.style.display = 'none';
            checkoutGuestBtn.style.display = 'none';
            processRefundBtn.style.display = 'none';
            //динамически заполняем список клиентов
            const clientSelect = document.getElementById('booking-client');
            await fetchUsers();
            if (clientSelect) {
                clientSelect.innerHTML = '<option value="">Выберите клиента...</option>';
                users.filter(u => !u.isAdmin).forEach(u => {
                    clientSelect.innerHTML += `<option value="${u.id}">${u.fullname} (${u.id})</option>`;
                });
            }
            await fetchServices();
            fillServicesSelect();
            currentBookingServices = [];
            renderAttachedServices();
        });
    }
    if (addServiceToBookingBtn) {
        addServiceToBookingBtn.addEventListener('click', () => {
            const svcId = selectServiceToAdd.value;
            const quantity = parseInt(serviceQuantityInput.value) || 1;
            if (!svcId) return;
            const svc = services.find(s => s.id === svcId);
            if (!svc) return;
            //проверка: не добавлять одну и ту же услугу дважды
            const existing = currentBookingServices.find(s => s.id === svcId);
            if (existing) {
                existing.quantity += quantity;
            } else {
                currentBookingServices.push({
                    id: svc.id,
                    name: svc.name,
                    price: svc.price,
                    unit: svc.unit,
                    quantity
                });
            }
            renderAttachedServices();
        });
    }
    if (attachedServicesList) {
        attachedServicesList.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-attached-service-btn')) {
                const idx = parseInt(e.target.dataset.idx);
                if (!isNaN(idx)) {
                    currentBookingServices.splice(idx, 1);
                    renderAttachedServices();
                }
            }
        });
    }
    if (cancelBookingFormBtn) {
        cancelBookingFormBtn.addEventListener('click', () => {
            hideFormContainer('booking-form-admin-container');
        });
    }
    if (bookingForm) {
        bookingForm.onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('booking-id').value || generateId('BRN');
            const booking = {
                id,
                userId: document.getElementById('booking-client').value,
                checkinDate: document.getElementById('admin-checkin-date').value,
                checkoutDate: document.getElementById('admin-checkout-date').value,
                roomType: document.getElementById('admin-room-type').value,
                adults: parseInt(document.getElementById('admin-adults').value) || 1,
                children: parseInt(document.getElementById('admin-children').value) || 0,
                status: document.getElementById('admin-booking-status').value,
                price: parseInt(document.getElementById('admin-booking-price').value) || 0,
                paymentStatus: document.getElementById('payment-status').value,
                paidAmount: parseInt(document.getElementById('paid-amount').value) || 0,
                adminNotes: document.getElementById('admin-booking-notes').value,
                services: currentBookingServices.map(s => ({...s}))
            };
            if (document.getElementById('booking-id').value) {
                //редактирование
                await fetch(`${API_URL}/bookings/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(booking)
                });
            } else {
                //добавление
                await fetch(`${API_URL}/bookings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(booking)
                });
            }
            await renderBookingsTable();
            hideFormContainer('booking-form-admin-container');
        };
    }
    const bookingsTableBody = document.querySelector('#manage-bookings table tbody');
    if (bookingsTableBody) {
        bookingsTableBody.addEventListener('click', async (event) => {
            event.preventDefault();
            const target = event.target;
            const bookingId = target.dataset.id;
            await fetchBookings();
            //редактирование
            if (target.classList.contains('edit-booking-admin-btn')) {
                const booking = bookings.find(b => b.id === bookingId);
                if (booking) {
                    showFormContainer('booking-form-admin-container', 'booking-form-admin-title', 'Редактировать бронирование', 'booking-form-admin');
                    //динамически заполняем список клиентов
                    const clientSelect = document.getElementById('booking-client');
                    await fetchUsers();
                    if (clientSelect) {
                        clientSelect.innerHTML = '<option value="">Выберите клиента...</option>';
                        users.filter(u => !u.isAdmin).forEach(u => {
                            clientSelect.innerHTML += `<option value="${u.id}">${u.fullname} (${u.id})</option>`;
                        });
                    }
                    await fetchServices();
                    fillServicesSelect();
                    document.getElementById('booking-id').value = booking.id;
                    document.getElementById('booking-client').value = booking.userId;
                    document.getElementById('admin-checkin-date').value = booking.checkinDate;
                    document.getElementById('admin-checkout-date').value = booking.checkoutDate;
                    document.getElementById('admin-room-type').value = booking.roomType;
                    document.getElementById('admin-adults').value = booking.adults;
                    document.getElementById('admin-children').value = booking.children;
                    document.getElementById('admin-booking-status').value = booking.status;
                    document.getElementById('admin-booking-price').value = booking.price;
                    document.getElementById('payment-status').value = booking.paymentStatus;
                    document.getElementById('paid-amount').value = booking.paidAmount;
                    document.getElementById('admin-booking-notes').value = booking.adminNotes;
                    currentBookingServices = Array.isArray(booking.services) ? booking.services.map(s => ({...s})) : [];
                    renderAttachedServices();
                }
            }
            //подтвердить
            if (target.classList.contains('confirm-booking-btn')) {
                const booking = bookings.find(b => b.id === bookingId);
                if (booking) {
                    booking.status = 'confirmed';
                    await fetch(`${API_URL}/bookings/${bookingId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(booking)
                    });
                    await renderBookingsTable();
                }
            }
            //отменить
            if (target.classList.contains('cancel-booking-admin-btn')) {
                if (confirm('Отменить это бронирование?')) {
                    await fetch(`${API_URL}/bookings/${bookingId}`, { method: 'DELETE' });
                    await renderBookingsTable();
                }
            }
        });
    }
}

export { initBookingsModule, renderBookingsTable }; 