// HOTEL MANAGEMENT SYSTEM - NAVIGATION MODULE
import { showSection } from './utils.js';

function initNavigation() {
    const navLinks = document.querySelectorAll('header nav ul li a');
    const sections = document.querySelectorAll('main section');

    if (navLinks.length > 0 && sections.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); 
                const targetId = link.getAttribute('href').substring(1); //гет айди
                showSection(targetId);
            });
        });

        const initialActiveSection = document.querySelector('main section.active');
        if (initialActiveSection) {
            showSection(initialActiveSection.id);
        } else if (sections.length > 0) {
            showSection(sections[0].id);
        }
    }
}

export { initNavigation }; 