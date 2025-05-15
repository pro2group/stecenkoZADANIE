const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;
const DB_PATH = './database.json';

app.use((req, res, next) => {
    console.log('Запрос:', req.method, req.url);
    next();
});

//функция для хеширования пароля
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return `${salt}:${hash}`;
}

//функция для проверки пароля
function verifyPassword(password, hashedPassword) {
    //если пароль не хеширован, сравниваем напрямую
    if (!hashedPassword.includes(':')) {
        return password === hashedPassword;
    }
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return hash === verifyHash;
}

app.use(cors());
app.use(bodyParser.json());

//вспомогательная функция для чтения базы
function readDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Ошибка при чтении базы:', err);
        throw err;
    }
}

//вспомогательная функция для записи базы
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

//универсальный CRUD для сущностей
const entities = ['income', 'expenses', 'bookings', 'rooms', 'services'];

entities.forEach(entity => {
    //получить все
    app.get(`/api/${entity}`, (req, res) => {
        const db = readDB();
        res.json(db[entity]);
    });
    //добавить
    app.post(`/api/${entity}`, (req, res) => {
        const db = readDB();
        const newItem = req.body;
        db[entity].push(newItem);
        writeDB(db);
        res.status(201).json(newItem);
    });
    //редактировать
    app.put(`/api/${entity}/:id`, (req, res) => {
        const db = readDB();
        const idx = db[entity].findIndex(item => item.id == req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Not found' });
        db[entity][idx] = req.body;
        writeDB(db);
        res.json(db[entity][idx]);
    });
    //удалить
    app.delete(`/api/${entity}/:id`, (req, res) => {
        const db = readDB();
        const idx = db[entity].findIndex(item => item.id == req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Not found' });
        const deleted = db[entity].splice(idx, 1);
        writeDB(db);
        res.json(deleted[0]);
    });
});

//клиенты
app.get('/api/clients', (req, res) => {
    const db = readDB();
    res.json(db.clients);
});

app.post('/api/clients', (req, res) => {
    const db = readDB();
    const newClient = req.body;
    //если нет id — генерируем числовой
    if (!newClient.id) {
        const maxId = db.clients.reduce((max, c) => {
            const num = parseInt(c.id, 10);
            return (!isNaN(num) && num > max) ? num : max;
        }, 0);
        newClient.id = (maxId + 1).toString();
    }
    if (newClient.password) {
        newClient.password = hashPassword(newClient.password);
    }
    db.clients.push(newClient);
    writeDB(db);
    res.status(201).json(newClient);
});

app.put('/api/clients/:id', (req, res) => {
    const db = readDB();
    const idx = db.clients.findIndex(client => client.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    
    const updatedClient = req.body;
    if (updatedClient.password) {
        updatedClient.password = hashPassword(updatedClient.password);
    }
    
    db.clients[idx] = { ...db.clients[idx], ...updatedClient };
    writeDB(db);
    res.json(db.clients[idx]);
});

app.delete('/api/clients/:id', (req, res) => {
    const db = readDB();
    const idx = db.clients.findIndex(client => client.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db.clients.splice(idx, 1);
    writeDB(db);
    res.json({ success: true });
});

//персонал
app.get('/api/staff', (req, res) => {
    const db = readDB();
    res.json(db.staff);
});

app.post('/api/staff', (req, res) => {
    const db = readDB();
    const newStaff = req.body;
    if (newStaff.password) {
        newStaff.password = hashPassword(newStaff.password);
    }
    db.staff.push(newStaff);
    writeDB(db);
    res.status(201).json(newStaff);
});

app.put('/api/staff/:id', (req, res) => {
    const db = readDB();
    const idx = db.staff.findIndex(staff => staff.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    
    const updatedStaff = req.body;
    if (updatedStaff.password) {
        updatedStaff.password = hashPassword(updatedStaff.password);
    }
    
    db.staff[idx] = { ...db.staff[idx], ...updatedStaff };
    writeDB(db);
    res.json(db.staff[idx]);
});

//эндпоинт для проверки логина
app.post('/api/login', (req, res) => {
    const { email, password, isStaff } = req.body;
    console.log('Login attempt:', { email, isStaff });
    
    const db = readDB();
    //если это вход в админ-панель, ищем только среди персонала
    const users = isStaff ? db.staff : db.clients;
    console.log('Available users:', users.map(u => ({ email: u.email, login: u.login })));
    
    //для админов проверяем и email, и login
    const user = isStaff 
       ? users.find(u => (u.email === email || u.login === email) && u.role === 'admin')
       : users.find(u => u.email === email);
    console.log('Found user:', user ? 'yes' : 'no');
    
    if (!user) {
        return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    const passwordValid = verifyPassword(password, user.password);
    console.log('Password valid:', passwordValid);
    
    if (!passwordValid) {
        return res.status(401).json({ error: 'Неверный пароль' });
    }
    
    //не отправляем пароль в ответе
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Сервер слушает порт, процесс не должен завершаться!');
    setInterval(() => {}, 1000);
}); 