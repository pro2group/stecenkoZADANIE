// HOTEL MANAGEMENT SYSTEM - SETTINGS MODULE
import { getSettings, saveSettings, getData, saveData } from './utils.js';

//функция для настройки формы с настройками системы
function initSettings() {
    const settingsForm = document.getElementById('system-settings-form');
    const settingsMsg = document.getElementById('system-settings-message');
    const exportSettingsBtn = document.getElementById('export-settings-btn');
    const importSettingsBtn = document.getElementById('import-settings-btn');
    const importSettingsInput = document.getElementById('import-settings-input');
    const resetSystemBtn = document.getElementById('reset-system-btn');

    function fillSettingsForm() {
        const s = getSettings();
        document.getElementById('hotel-name').value = s.hotelName || '';
        document.getElementById('hotel-address').value = s.hotelAddress || '';
        document.getElementById('hotel-phone').value = s.hotelPhone || '';
        document.getElementById('hotel-email').value = s.hotelEmail || '';
        document.getElementById('checkin-time').value = s.checkinTime || '';
        document.getElementById('checkout-time').value = s.checkoutTime || '';
        document.getElementById('currency').value = s.currency || 'руб.';
        document.getElementById('min-booking-days').value = s.minBookingDays || 1;
        document.getElementById('max-booking-days').value = s.maxBookingDays || 30;
        document.getElementById('allow-online-booking').checked = !!s.allowOnlineBooking;
        document.getElementById('notify-email').value = s.notifyEmail || '';
        document.getElementById('enable-notifications').checked = !!s.enableNotifications;
    }

    if (settingsForm) {
        fillSettingsForm();
        settingsForm.onsubmit = function(e) {
            e.preventDefault();
            const s = {
                hotelName: document.getElementById('hotel-name').value,
                hotelAddress: document.getElementById('hotel-address').value,
                hotelPhone: document.getElementById('hotel-phone').value,
                hotelEmail: document.getElementById('hotel-email').value,
                checkinTime: document.getElementById('checkin-time').value,
                checkoutTime: document.getElementById('checkout-time').value,
                currency: document.getElementById('currency').value,
                minBookingDays: parseInt(document.getElementById('min-booking-days').value) || 1,
                maxBookingDays: parseInt(document.getElementById('max-booking-days').value) || 30,
                allowOnlineBooking: document.getElementById('allow-online-booking').checked,
                notifyEmail: document.getElementById('notify-email').value,
                enableNotifications: document.getElementById('enable-notifications').checked
            };
            saveSettings(s);
            settingsMsg.textContent = 'Настройки сохранены!';
            setTimeout(()=>settingsMsg.textContent='', 2000);
        };
    }

    if (exportSettingsBtn) {
        exportSettingsBtn.onclick = function() {
            const allData = {
                settings: getSettings(),
                users: getData('users'),
                bookings: getData('bookings'),
                rooms: getData('rooms'),
                services: getData('services'),
                staff: getData('staff'),
                finances: getData('finances')
            };
            const blob = new Blob([JSON.stringify(allData, null, 2)], {type:'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'hotel_backup.json'; a.click();
            URL.revokeObjectURL(url);
        };
    }

    if (importSettingsBtn && importSettingsInput) {
        importSettingsBtn.onclick = () => importSettingsInput.click();
        importSettingsInput.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (data.settings) saveSettings(data.settings);
                    if (data.users) saveData('users', data.users);
                    if (data.bookings) saveData('bookings', data.bookings);
                    if (data.rooms) saveData('rooms', data.rooms);
                    if (data.services) saveData('services', data.services);
                    if (data.staff) saveData('staff', data.staff);
                    if (data.finances) saveData('finances', data.finances);
                    fillSettingsForm();
                    settingsMsg.textContent = 'Данные успешно импортированы!';
                    setTimeout(()=>settingsMsg.textContent='', 2000);
                    location.reload();
                } catch (err) {
                    alert('Ошибка при импорте: ' + err);
                }
            };
            reader.readAsText(file);
        };
    }

    if (resetSystemBtn) {
        resetSystemBtn.onclick = function() {
            if (confirm('Вы уверены, что хотите полностью очистить все данные системы?')) {
                localStorage.clear();
                settingsMsg.textContent = 'Все данные удалены! Страница будет перезагружена.';
                setTimeout(()=>location.reload(), 1200);
            }
        };
    }
}

export { initSettings }; 