// HOTEL MANAGEMENT SYSTEM - OCCUPANCY MODULE
import { getData } from './utils.js';

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function renderOccupancyCalendar() {
    const calendarContainer = document.getElementById('occupancy-calendar-container');
    const dateInput = document.getElementById('occupancy-view-date');
    if (!calendarContainer || !dateInput) return;

    //получаем выбранный месяц и год
    let date = new Date();
    if (dateInput.value) {
        date = new Date(dateInput.value + '-01');
    }
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    //получаем данные
    const rooms = getData('rooms') || [];
    const bookings = getData('bookings') || [];

    //строим таблицу
    let html = '<table class="occupancy-calendar"><thead><tr><th>Номер</th>';
    for (let d = 1; d <= daysInMonth; d++) {
        html += `<th>${d}</th>`;
    }
    html += '</tr></thead><tbody>';
    rooms.forEach(room => {
        html += `<tr><td>${room.type} (${room.id})</td>`;
        for (let d = 1; d <= daysInMonth; d++) {
            const cellDate = new Date(year, month, d);
            //проверяем, есть ли бронь на этот день для этого номера
            const booking = bookings.find(b => b.roomType === room.type &&
                new Date(b.checkinDate) <= cellDate && cellDate < new Date(b.checkoutDate)
            );
            if (booking) {
                //если ID числовой — показываем полностью, если строка — последние 4 символа
                let shortId = booking.id;
                if (typeof shortId === 'string' && isNaN(Number(shortId))) {
                    shortId = booking.id.slice(-4);
                }
                html += `<td style="background:#2196f3;color:#fff;cursor:pointer;" title="Бронь: ${booking.id}\nЗаезд: ${booking.checkinDate}\nВыезд: ${booking.checkoutDate}">${shortId}</td>`;
            } else {
                html += '<td style="background:#fff;"></td>';
            }
        }
        html += '</tr>';
    });
    html += '</tbody></table>';
    calendarContainer.innerHTML = html;
}

function initOccupancyModule() {
    console.log('Initializing occupancy module...');
    const dateInput = document.getElementById('occupancy-view-date');
    const calendarContainer = document.getElementById('occupancy-calendar-container');
    
    if (!dateInput) {
        console.error('Element with ID "occupancy-view-date" not found');
        return;
    }
    if (!calendarContainer) {
        console.error('Element with ID "occupancy-calendar-container" not found');
        return;
    }
    
    //устанавливаем текущий месяц и год в input
    const now = new Date();
    dateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    dateInput.addEventListener('change', renderOccupancyCalendar);
    renderOccupancyCalendar();
    console.log('Occupancy module initialized successfully');
}

export { initOccupancyModule }; 