// HOTEL MANAGEMENT SYSTEM - MAIN APP MODULE
import { initDemoData } from './data.js';
import { initNavigation } from './navigation.js';
import { initThemeSwitcher, initNotifications } from './theme.js';
import { initSettings } from './settings.js';
import { getData, saveData } from './utils.js';
import { initBookingsModule } from './bookings.js';
import { initRoomsModule } from './rooms.js';
import { initUsersModule } from './users.js';
import { initOccupancyModule } from './occupancy.js';
import { initServicesModule } from './services.js';
import { initStaffModule } from './staff.js';
import { initFinancesModule } from './finances.js';

//глобальные переменные данных для использования в разных модулях
let users = [];
let bookings = [];
let rooms = [];
let services = [];
let staff = [];
let finances = { income: [], expenses: [] };
let currentUser = null; //для отслеживания залогиненного пользователя так как если пользователь регнулся сам то оно не считывается почему-то и пршилось сделать так

document.addEventListener('DOMContentLoaded', () => { //просто загрузка демо данных если их нет
    initDemoData();

    users = getData('users');//локалсторедж
    bookings = getData('bookings');
    rooms = getData('rooms') || [];
    services = getData('services');
    staff = getData('staff') || [];
    finances = getData('finances');
    
    //инициализация модулей
    initNavigation();
    initThemeSwitcher();
    initNotifications();
    initSettings();
    initBookingsModule();
    initRoomsModule();
    initUsersModule();
    initOccupancyModule();
    initServicesModule();
    initStaffModule();
    initFinancesModule();
});

//экспорт глобальных переменных данных для использования в других модулях
export {
    users,
    bookings,
    rooms,
    services,
    staff,
    finances,
    currentUser
}; 