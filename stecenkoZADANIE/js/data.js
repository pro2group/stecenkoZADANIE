// ===================================================================================
// HOTEL MANAGEMENT SYSTEM - DATA MODULE
// ===================================================================================

import { getData, saveData, generateId } from './utils.js';
function initDemoData() {
    //сбросить lastUserId для корректной генерации новых ID // это был как тест если что до тех пор пока я json базу не подключил
    localStorage.setItem('lastUserId', '3');
    if (getData('users').length === 0) {
        const demoUsers = [
            { id: '1', fullname: 'Иванов Иван Иванович', email: 'ivanov@example.com', phone: '+7 (999) 123-45-67', password: 'password123', registrationDate: '2023-01-15', notes: 'VIP клиент' },
            { id: '2', fullname: 'Петрова Мария Сергеевна', email: 'petrova@example.com', phone: '+7 (988) 765-43-21', password: 'password123', registrationDate: '2023-02-20', notes: '' },
            { id: '3', fullname: 'Администратор Системы', email: 'admin@hotel.system', phone: '', password: 'admin', registrationDate: '2023-01-01', notes: 'Системный администратор', isAdmin: true }
        ];
        saveData('users', demoUsers);
    }
    if (getData('rooms').length === 0) {
        const demoRooms = [
            { id: '101', type: 'standard', floor: 1, status: 'available', price: 3000 },
            { id: '102', type: 'standard', floor: 1, status: 'available', price: 3000 },
            { id: '201', type: 'superior', floor: 2, status: 'available', price: 4500 },
            { id: '202', type: 'superior', floor: 2, status: 'available', price: 4500 },
            { id: '301', type: 'deluxe', floor: 3, status: 'available', price: 6000 },
            { id: '302', type: 'deluxe', floor: 3, status: 'available', price: 6000 },
            { id: '401', type: 'suite', floor: 4, status: 'available', price: 9000 },
            { id: '402', type: 'suite', floor: 4, status: 'available', price: 9000 },
            { id: '501', type: 'family', floor: 5, status: 'available', price: 7500 },
            { id: '502', type: 'family', floor: 5, status: 'available', price: 7500 }
        ];
        saveData('rooms', demoRooms);
    }
    if (getData('services').length === 0) {
        const demoServices = [
            { id: 'SVC001', name: 'Завтрак "Шведский стол"', category: 'food', price: 800, unit: 'за чел.', description: 'Разнообразный завтрак.' },
            { id: 'SVC002', name: 'Трансфер Аэропорт-Отель', category: 'transfer', price: 2500, unit: 'за услугу', description: 'Встреча в аэропорту и доставка до отеля.' },
            { id: 'SVC003', name: 'Парковка', category: 'other', price: 500, unit: 'за сутки', description: 'Охраняемая парковка.'}
        ];
        saveData('services', demoServices);
    }
    if (getData('bookings').length === 0) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const demoBookings = [
            { id: generateId('BRN'), userId: 'USR001', checkinDate: new Date(currentYear, currentMonth, 2).toISOString().split('T')[0], checkoutDate: new Date(currentYear, currentMonth, 5).toISOString().split('T')[0], roomType: 'standard', adults: 1, children: 0, status: 'checked_out', price: 9000, notes: 'Ранний заезд оплачен' },
            { id: generateId('BRN'), userId: 'USR002', checkinDate: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0], checkoutDate: new Date(currentYear, currentMonth, 15).toISOString().split('T')[0], roomType: 'deluxe', adults: 2, children: 1, status: 'confirmed', price: 25000, notes: '' },
            { id: generateId('BRN'), userId: 'USR001', checkinDate: new Date(currentYear, currentMonth, 20).toISOString().split('T')[0], checkoutDate: new Date(currentYear, currentMonth, 22).toISOString().split('T')[0], roomType: 'suite', adults: 2, children: 0, status: 'checked_in', price: 18000, notes: 'Просили тихий номер' },
            { id: generateId('BRN'), userId: 'USR002', checkinDate: new Date(currentYear, currentMonth -1, 25).toISOString().split('T')[0], checkoutDate: new Date(currentYear, currentMonth -1, 28).toISOString().split('T')[0], roomType: 'standard', adults: 1, children: 0, status: 'checked_out', price: 7500, notes: 'Прошлый месяц' }, // Booking from last month
            { id: generateId('BRN'), userId: 'USR001', checkinDate: new Date(currentYear, currentMonth + 1, 5).toISOString().split('T')[0], checkoutDate: new Date(currentYear, currentMonth +1, 10).toISOString().split('T')[0], roomType: 'deluxe', adults: 2, children: 0, status: 'confirmed', price: 22000, notes: 'Следующий месяц' } // Booking for next month
        ];
        saveData('bookings', demoBookings);
    }

    const financeData = getData('finances');
    if (!financeData.expenses || financeData.expenses.length === 0) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const demoExpenses = [
            { id: generateId('EXP'), date: new Date(currentYear, currentMonth, 3).toISOString().split('T')[0], category: 'Зарплата', description: 'Аванс персоналу', amount: 20000 },
            { id: generateId('EXP'), date: new Date(currentYear, currentMonth, 7).toISOString().split('T')[0], category: 'Коммунальные', description: 'Электроэнергия', amount: 15000 },
            { id: generateId('EXP'), date: new Date(currentYear, currentMonth, 12).toISOString().split('T')[0], category: 'Закупка', description: 'Продукты для кухни', amount: 10000 },
            { id: generateId('EXP'), date: new Date(currentYear, currentMonth -1, 15).toISOString().split('T')[0], category: 'Реклама', description: 'Онлайн продвижение', amount: 5000 }, // Last month
        ];
        const updatedFinanceData = typeof financeData === 'object' && !Array.isArray(financeData) ? financeData : { income: [], expenses: [] };
        updatedFinanceData.expenses = demoExpenses;
        if (!updatedFinanceData.income) {
            updatedFinanceData.income = [];
        }
        saveData('finances', updatedFinanceData);
    }
}

export { initDemoData }; 