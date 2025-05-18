//утилиты для хеширования паролей
const crypto = require('crypto');

//функция для хеширования пароля
function hashPassword(password) {
    //генерируем случайную соль
    const salt = crypto.randomBytes(16).toString('hex');
    
    //создаем хеш с использованием SHA-256
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    
    //возвращаем соль и хеш в формате "соль:хеш"
    return `${salt}:${hash}`;
}

//функция для проверки пароля
function verifyPassword(password, hashedPassword) {
    //разделяем соль и хеш // соль - строка входных данных
    const [salt, hash] = hashedPassword.split(':');
    
    //создаем хеш введенного пароля с той же солью
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    
    //сравниваем хеши
    return hash === verifyHash;
}
module.exports = {
    hashPassword,
    verifyPassword
}; 