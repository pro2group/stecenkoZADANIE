// HOTEL MANAGEMENT SYSTEM - SERVICES MODULE (API VERSION)
import { generateId, showFormContainer, hideFormContainer } from './utils.js';

const API_URL = 'http://localhost:3001/api';
let services = [];

async function fetchServices() {
    const res = await fetch(`${API_URL}/services`);
    services = await res.json();
    return services;
}

async function renderServicesTable() {
    await fetchServices();
    const servicesTableBody = document.querySelector('#manage-services table tbody');
    if (!servicesTableBody) return;
    servicesTableBody.innerHTML = '';
    services.forEach(service => {
        servicesTableBody.innerHTML += `
        <tr>
            <td data-label="ID">${service.id}</td>
            <td data-label="Наименование">${service.name}</td>
            <td data-label="Категория">${service.category}</td>
            <td data-label="Цена">${service.price}</td>
            <td data-label="Ед. изм.">${service.unit}</td>
            <td data-label="Действия">
                <button class="btn btn-sm btn-info edit-service-btn" data-id="${service.id}">Редактировать</button>
                <button class="btn btn-sm btn-danger delete-service-btn" data-id="${service.id}">Удалить</button>
            </td>
        </tr>`;
    });
}

function initServicesModule() {
    renderServicesTable();
    const addNewServiceBtn = document.getElementById('add-new-service-btn');
    const serviceFormContainer = document.getElementById('service-form-container');
    const serviceForm = document.getElementById('service-form');
    const serviceFormTitle = document.getElementById('service-form-title');
    const cancelServiceFormBtn = document.getElementById('cancel-service-form');
    const servicesTableBody = document.querySelector('#manage-services table tbody');

    if (addNewServiceBtn) {
        addNewServiceBtn.addEventListener('click', () => {
            showFormContainer('service-form-container', 'service-form-title', 'Добавить новую услугу', 'service-form');
            serviceForm.reset();
            document.getElementById('service-id').value = '';
        });
    }
    if (cancelServiceFormBtn) {
        cancelServiceFormBtn.addEventListener('click', () => {
            hideFormContainer('service-form-container');
        });
    }
    if (serviceForm) {
        serviceForm.onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('service-id').value || generateId('SVC');
            const service = {
                id,
                name: document.getElementById('service-name').value,
                description: document.getElementById('service-description').value,
                category: document.getElementById('service-category').value,
                price: parseInt(document.getElementById('service-price').value) || 0,
                unit: document.getElementById('service-unit').value
            };
            if (document.getElementById('service-id').value) {
                //редактирование
                await fetch(`${API_URL}/services/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(service)
                });
            } else {
                //добавление
                await fetch(`${API_URL}/services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(service)
                });
            }
            await renderServicesTable();
            hideFormContainer('service-form-container');
        };
    }
    if (servicesTableBody) {
        servicesTableBody.addEventListener('click', async (event) => {
            event.preventDefault();
            const target = event.target;
            const serviceId = target.dataset.id;
            await fetchServices();
            //редактирование
            if (target.classList.contains('edit-service-btn')) {
                const service = services.find(s => s.id === serviceId);
                if (service) {
                    showFormContainer('service-form-container', 'service-form-title', 'Редактировать услугу', 'service-form');
                    document.getElementById('service-id').value = service.id;
                    document.getElementById('service-name').value = service.name;
                    document.getElementById('service-description').value = service.description || '';
                    document.getElementById('service-category').value = service.category;
                    document.getElementById('service-price').value = service.price;
                    document.getElementById('service-unit').value = service.unit;
                }
            }
            //удалить
            if (target.classList.contains('delete-service-btn')) {
                if (confirm('Удалить эту услугу?')) {
                    await fetch(`${API_URL}/services/${serviceId}`, { method: 'DELETE' });
                    await renderServicesTable();
                }
            }
        });
    }
}

//функция для заполнения выпадающего списка услуг
function fillServicesSelect() {
    //перенести соответствующий код из script.js
}

function renderAttachedServices() {
    //перенести соответствующий код из script.js // неактуал но оставил выше также
}
export { 
    initServicesModule, 
    renderServicesTable, 
    fillServicesSelect, 
    renderAttachedServices 
}; 