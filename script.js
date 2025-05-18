//импортируем все необходимые модули
import './js/main.js';

async function loadDatabase() {
    try {
        const response = await fetch('database.json');
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки базы данных:', error);
        return null;
    }
}

//сохранение данных в database.json
async function saveDatabase(data) {
    try {
        const response = await fetch('database.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data, null, 2)
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка сохранения базы данных:', error);
        return null;
    }
}

//обработка формы пользователя
document.getElementById('user-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const database = await loadDatabase();
    if (!database) return;

    const password = document.getElementById('user-password').value;
    const userId = document.getElementById('user-id').value;
    
    if (password) {
        //хешируем пароль перед сохранением
        const hashedPassword = await hashPassword(password);
        
        //находим пользователя или создаем нового
        const userIndex = database.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            database.users[userIndex].password = hashedPassword;
        } else {
            //создаем нового пользователя
            const newUser = {
                id: `USR${String(database.users.length + 1).padStart(3, '0')}`,
                fullname: document.getElementById('user-fullname').value,
                email: document.getElementById('user-email').value,
                phone: document.getElementById('user-phone').value,
                password: hashedPassword,
                registration_date: new Date().toISOString().split('T')[0],
                notes: document.getElementById('user-notes').value
            };
            database.users.push(newUser);
        }
        
        await saveDatabase(database);
    }
});

//обработка формы персонала
document.getElementById('staff-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const database = await loadDatabase();
    if (!database) return;

    const password = document.getElementById('staff-password').value;
    const staffId = document.getElementById('staff-id').value;
    
    if (password) {
        //хешируем пароль перед сохранением
        const hashedPassword = await hashPassword(password);
        
        //находим сотрудника или создаем нового
        const staffIndex = database.staff.findIndex(s => s.id === staffId);
        if (staffIndex !== -1) {
            database.staff[staffIndex].password = hashedPassword;
        } else {
            //создаем нового сотрудника
            const newStaff = {
                id: `EMP${String(database.staff.length + 1).padStart(3, '0')}`,
                fullname: document.getElementById('staff-fullname').value,
                position: document.getElementById('staff-position').value,
                role: document.getElementById('staff-role').value,
                email: document.getElementById('staff-email').value,
                phone: document.getElementById('staff-phone').value,
                login: document.getElementById('staff-login').value,
                password: hashedPassword,
                salary_rate: document.getElementById('staff-salary-rate').value,
                schedule_info: document.getElementById('staff-schedule-info').value,
                notes: document.getElementById('staff-notes').value
            };
            database.staff.push(newStaff);
        }
        
        await saveDatabase(database);
    }
});

//функция проверки пароля при входе
async function verifyLogin(login, password, isStaff = false) {
    const database = await loadDatabase();
    if (!database) return false;

    const users = isStaff ? database.staff : database.users;
    const user = users.find(u => u.login === login || u.email === login);
    
    if (!user) return false;
    
    return await verifyPassword(password, user.password);
}

document.addEventListener('DOMContentLoaded', function() {
});