// HOTEL MANAGEMENT SYSTEM - UTILITY FUNCTIONS
const DB_PREFIX = 'hotel_';

function getData(key) {
    const data = localStorage.getItem(DB_PREFIX + key);
    return data ? JSON.parse(data) : [];
}

function saveData(key, data) {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
}

function generateId(prefix = 'ID') {
    return prefix + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5);
}

function generateUserId() {
    let lastId = parseInt(localStorage.getItem('lastUserId') || '0', 10);
    lastId += 1;
    localStorage.setItem('lastUserId', lastId);
    return lastId.toString();
}

function getSettings() {
    return JSON.parse(localStorage.getItem('hotel_settings') || '{}');
}

function saveSettings(settings) {
    localStorage.setItem('hotel_settings', JSON.stringify(settings));
}

//UI утилиты функция
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        //сброс скрытых полей ID
        const hiddenIdField = form.querySelector('input[type="hidden"]');
        if (hiddenIdField) hiddenIdField.value = '';
    }
}

function showFormContainer(containerId, titleId, titleText, formIdToClear = null) {
    const container = document.getElementById(containerId);
    const titleElement = document.getElementById(titleId);
    if (container) container.style.display = 'block';
    if (titleElement) titleElement.textContent = titleText;
    if (formIdToClear) clearForm(formIdToClear);
}

function hideFormContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.style.display = 'none';
}

function showSection(targetId) {
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('header nav ul li a');
    
    sections.forEach(section => {
        if (section.id === targetId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${targetId}`) {
            link.classList.add('active-link');
        } else {
            link.classList.remove('active-link');
        }
    });
}

function showSectionFromNotification(sectionId, itemId) {
    showSection(sectionId); 
    console.log("Переход к секции: " + sectionId + ", элемент: " + itemId);
    //скрыть выпадающий список уведомлений, если он открыт
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    if (notificationsDropdown) notificationsDropdown.style.display = 'none';
}

export { 
    getData, 
    saveData, 
    generateId, 
    generateUserId, 
    getSettings, 
    saveSettings, 
    clearForm, 
    showFormContainer, 
    hideFormContainer, 
    showSection, 
    showSectionFromNotification
}; 