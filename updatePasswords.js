const fs = require('fs');
const { hashPassword } = require('./passwordUtils');

//читаем database.json
const database = JSON.parse(fs.readFileSync('./stecenkoZADANIE/database.json', 'utf8'));

//хешируем пароли клиентов
if (database.clients) {
    database.clients = database.clients.map(client => {
        if (client.password) {
            client.password = hashPassword(client.password);
        }
        return client;
    });
}

//хешируем пароли персонала
if (database.staff) {
    database.staff = database.staff.map(staff => {
        if (staff.password) {
            staff.password = hashPassword(staff.password);
        }
        return staff;
    });
}

//сохраняем обновленный database.json
fs.writeFileSync('./stecenkoZADANIE/database.json', JSON.stringify(database, null, 2));

console.log('Пароли успешно хешированы!'); 