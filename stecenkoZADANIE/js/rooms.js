// HOTEL MANAGEMENT SYSTEM - ROOMS MODULE (API VERSION)
import { generateId, showFormContainer, hideFormContainer } from './utils.js';

let rooms = [];
const API_URL = 'http://localhost:3001/api';

async function fetchRooms() {
    const res = await fetch(`${API_URL}/rooms`);
    rooms = await res.json();
    return rooms;
}

async function renderRoomsTable() {
    await fetchRooms();
    const roomsTableBody = document.querySelector('#manage-rooms table tbody');
    if (!roomsTableBody) return;
    roomsTableBody.innerHTML = '';
    rooms.forEach(room => {
        roomsTableBody.innerHTML += `
        <tr>
            <td data-label="ID">${room.id}</td>
            <td data-label="Тип">${room.type}</td>
            <td data-label="Статус">${room.status}</td>
            <td data-label="Вместимость">${room.capacity}</td>
            <td data-label="Цена">${room.price}</td>
            <td data-label="Описание">${room.description || ''}</td>
            <td data-label="Действия">
                <button class="btn btn-sm btn-info edit-room-btn" data-id="${room.id}">Редактировать</button>
                <button class="btn btn-sm btn-danger delete-room-btn" data-id="${room.id}">Удалить</button>
            </td>
        </tr>`;
    });
}

function initRoomsModule() {
    renderRoomsTable();
    const addNewRoomBtn = document.getElementById('add-new-room-btn');
    const roomFormContainer = document.getElementById('room-form-container');
    const roomForm = document.getElementById('room-form');
    const roomFormTitle = document.getElementById('room-form-title');
    const cancelRoomFormBtn = document.getElementById('cancel-room-form');

    if (addNewRoomBtn) {
        addNewRoomBtn.addEventListener('click', () => {
            showFormContainer('room-form-container', 'room-form-title', 'Добавить новый номер', 'room-form');
            roomForm.reset();
            document.getElementById('room-id').value = '';
        });
    }
    if (cancelRoomFormBtn) {
        cancelRoomFormBtn.addEventListener('click', () => {
            hideFormContainer('room-form-container');
        });
    }
    if (roomForm) {
        roomForm.onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('room-id').value || generateId('ROOM');
            const room = {
                id,
                type: document.getElementById('room-type').value,
                status: document.getElementById('room-status').value,
                capacity: parseInt(document.getElementById('room-capacity').value) || 1,
                price: parseInt(document.getElementById('room-price').value) || 0,
                description: document.getElementById('room-description').value
            };
            if (document.getElementById('room-id').value) {
                //редактирование
                await fetch(`${API_URL}/rooms/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(room)
                });
            } else {
                //добавление
                await fetch(`${API_URL}/rooms`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(room)
                });
            }
            await renderRoomsTable();
            hideFormContainer('room-form-container');
        };
    }
    const roomsTableBody = document.querySelector('#manage-rooms table tbody');
    if (roomsTableBody) {
        roomsTableBody.addEventListener('click', async (event) => {
            event.preventDefault();
            const target = event.target;
            const roomId = target.dataset.id;
            await fetchRooms();
            //редактирование
            if (target.classList.contains('edit-room-btn')) {
                const room = rooms.find(r => r.id === roomId);
                if (room) {
                    showFormContainer('room-form-container', 'room-form-title', 'Редактировать номер', 'room-form');
                    document.getElementById('room-id').value = room.id;
                    document.getElementById('room-type').value = room.type;
                    document.getElementById('room-status').value = room.status;
                    document.getElementById('room-capacity').value = room.capacity;
                    document.getElementById('room-price').value = room.price;
                    document.getElementById('room-description').value = room.description || '';
                }
            }
            //удалить
            if (target.classList.contains('delete-room-btn')) {
                if (confirm('Удалить этот номер?')) {
                    await fetch(`${API_URL}/rooms/${roomId}`, { method: 'DELETE' });
                    await renderRoomsTable();
                }
            }
        });
    }
}

//динамический календарь занятости номеров (только для существующих номеров)
async function renderOccupancyCalendar(year, month) {
    //получаем все номера и бронирования
    const resRooms = await fetch('http://localhost:3001/api/rooms');
    const rooms = await resRooms.json();
    const resBookings = await fetch('http://localhost:3001/api/bookings');
    const bookings = await resBookings.json();

    //определяем количество дней в месяце
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDiv = document.getElementById('occupancy-calendar');
    if (!calendarDiv) return;

    let html = '<table class="occupancy-calendar-table"><thead><tr><th>Номер</th>';
    for (let d = 1; d <= daysInMonth; d++) {
        html += `<th>${d}</th>`;
    }
    html += '</tr></thead><tbody>';

    rooms.forEach(room => {
        html += `<tr><td>${room.type} (${room.id})</td>`;
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isOccupied = bookings.some(b =>
                (b.roomType === room.type || b.roomId === room.id) &&
                b.checkinDate <= dateStr &&
                b.checkoutDate >= dateStr
            );
            html += `<td style="background:${isOccupied ? '#ffb3b3' : '#b3ffb3'}">${isOccupied ? 'Занят' : ''}</td>`;
        }
        html += '</tr>';
    });
    html += '</tbody></table>';
    calendarDiv.innerHTML = html;
}

//экспорт функций для использования в других модулях
export { initRoomsModule, renderRoomsTable, renderOccupancyCalendar }; 