// HOTEL MANAGEMENT SYSTEM - THEME & NOTIFICATIONS MODULE
//функция для инициализации переключателя темы
function initThemeSwitcher() {
    const themeSwitcher = document.getElementById('theme-switcher');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (themeSwitcher) {
            themeSwitcher.textContent = currentTheme === 'dark' ? 'Светлая тема' : 'Темная тема';
        }
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeSwitcher) {
            themeSwitcher.textContent = 'Темная тема';
        }
    }

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeSwitcher.textContent = 'Темная тема';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeSwitcher.textContent = 'Светлая тема';
            }
        });
    }
}

//функция для инициализации уведомлений
function initNotifications() {
    const notificationsToggle = document.getElementById('notifications-toggle');
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    const notificationCount = document.getElementById('notification-count');

    //показать/скрыть выпадающий список уведомлений
    if (notificationsToggle && notificationsDropdown) {
        notificationsToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Предотвратить закрытие при клике на саму кнопку
            notificationsDropdown.style.display = notificationsDropdown.style.display === 'none' ? 'block' : 'none';
            if (notificationsDropdown.style.display === 'block' && notificationCount) {
                notificationCount.style.display = 'none'; // Скрыть счетчик при открытии
            }
        });

        //закрыть выпадающий список при клике вне его
        document.addEventListener('click', (event) => {
            if (notificationsDropdown.style.display === 'block' && 
                !notificationsDropdown.contains(event.target) && 
                !notificationsToggle.contains(event.target)) {
                notificationsDropdown.style.display = 'none';
            }
        });
    }

    //пример: показать счетчик уведомлений
    if (notificationCount) {
        //в реальном приложении это значение будет приходить с бэкенда
        const unreadNotifications = 3; 
        if (unreadNotifications > 0) {
            notificationCount.textContent = unreadNotifications;
            notificationCount.style.display = 'inline-block';
        }
    }
}

export { initThemeSwitcher, initNotifications }; 