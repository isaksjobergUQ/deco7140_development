// Events page functionality
import { fetchGetData } from './modules/getData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

let allEvents = [];
let filteredEvents = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize internationalization
    await i18n.init();
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Load events
    await loadEvents();
    
    // Set up filter functionality
    setupFilters();
    
    // Set up bookmark functionality
    setupBookmarkHandlers();
});

async function loadEvents() {
    try {
        allEvents = await fetchGetData('./data/events.json');
        // Sort events by date (upcoming first)
        allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        filteredEvents = [...allEvents];
        renderEvents(filteredEvents);
    } catch (error) {
        console.error('Error loading events:', error);
        showError();
    }
}

function renderEvents(events) {
    const container = document.getElementById('events-container');
    
    if (events.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No events available for this category</p>`;
        return;
    }
    
    container.innerHTML = events.map(event => `
        <div class="card event-card" data-event-id="${event.id}" data-type="${event.type}">
            <div class="card-image">
                <img src="${event.image}" alt="${event.title}" loading="lazy">
                <button class="bookmark-btn" aria-label="Save this event" data-event-id="${event.id}">
                    <span class="bookmark-icon">${storage.isBookmarked(event.id) ? '❤️' : '🤍'}</span>
                </button>
                <div class="event-date-badge">
                    <span class="month">${new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
                    <span class="day">${new Date(event.date).getDate()}</span>
                </div>
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span class="type">${event.type}</span>
                    <span class="date">${new Date(event.date).toLocaleDateString()}</span>
                </div>
                <h3 class="card-title">${event.title}</h3>
                <p class="card-summary">${event.summary}</p>
                <div class="event-details">
                    <p><strong>📍 Location:</strong> ${event.location}</p>
                    <p><strong>🕒 Time:</strong> ${event.time}</p>
                    <p><strong>💰 Price:</strong> ${event.price}</p>
                </div>
                <a href="event-detail.html?id=${event.id}" class="btn btn-secondary" data-i18n="read_more">Read More</a>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter events
            const filter = button.dataset.filter;
            if (filter === 'all') {
                filteredEvents = [...allEvents];
            } else {
                filteredEvents = allEvents.filter(event => event.type === filter);
            }
            
            renderEvents(filteredEvents);
        });
    });
}

function setupBookmarkHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn')) {
            e.preventDefault();
            const eventId = e.target.closest('.bookmark-btn').dataset.eventId;
            toggleBookmark(eventId);
        }
    });
}

function toggleBookmark(eventId) {
    const isBookmarked = storage.isBookmarked(eventId);
    
    if (isBookmarked) {
        storage.removeBookmark(eventId);
    } else {
        storage.addBookmark(eventId);
    }
    
    // Update bookmark icon
    const bookmarkBtn = document.querySelector(`[data-event-id="${eventId}"] .bookmark-btn`);
    if (bookmarkBtn) {
        const icon = bookmarkBtn.querySelector('.bookmark-icon');
        icon.textContent = storage.isBookmarked(eventId) ? '❤️' : '🤍';
    }
}

function showError() {
    const container = document.getElementById('events-container');
    container.innerHTML = `<p data-i18n="error_loading">Error loading events</p>`;
}
