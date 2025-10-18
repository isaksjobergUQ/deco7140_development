// Event detail page functionality
import { fetchGetData } from './modules/getData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

let currentEvent = null;
let allEvents = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize internationalization
    await i18n.init();
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        showError();
        return;
    }
    
    // Load event data
    await loadEvent(eventId);
    
    // Set up bookmark functionality
    setupBookmarkHandler();
});

async function loadEvent(eventId) {
    try {
        allEvents = await fetchGetData('./data/events.json');
        currentEvent = allEvents.find(event => event.id === eventId);
        
        if (!currentEvent) {
            showError();
            return;
        }
        
        renderEvent(currentEvent);
        loadRelatedEvents(currentEvent);
        
    } catch (error) {
        console.error('Error loading event:', error);
        showError();
    }
}

function renderEvent(event) {
    // Hide loading state
    document.getElementById('loading-state').style.display = 'none';
    
    // Show event content
    const eventContent = document.getElementById('event-content');
    eventContent.style.display = 'block';
    
    // Update breadcrumb
    document.getElementById('breadcrumb-type').textContent = event.type;
    document.getElementById('breadcrumb-title').textContent = event.title;
    
    // Update event header
    document.getElementById('event-type').textContent = event.type;
    document.getElementById('event-date').textContent = new Date(event.date).toLocaleDateString();
    document.getElementById('event-organizer').textContent = `by ${event.organizer}`;
    document.getElementById('event-title').textContent = event.title;
    
    // Update event image
    const eventImage = document.getElementById('event-image');
    eventImage.src = event.image;
    eventImage.alt = event.title;
    
    // Update event summary
    document.getElementById('event-summary').textContent = event.summary;
    
    // Update event details
    document.getElementById('event-datetime').textContent = `${new Date(event.date).toLocaleDateString()} at ${event.time}`;
    document.getElementById('event-location').innerHTML = `${event.location}<br><small>${event.address}</small>`;
    document.getElementById('event-price').textContent = event.price;
    document.getElementById('event-capacity').textContent = `${event.capacity} people`;
    document.getElementById('event-contact').innerHTML = `<a href="mailto:${event.contact}">${event.contact}</a>`;
    
    // Update event description
    document.getElementById('event-description-content').innerHTML = event.description;
    
    // Update bookmark button
    updateBookmarkButton();
    
    // Update page title
    document.title = `${event.title} - International Student Platform`;
}

function loadRelatedEvents(currentEvent) {
    const relatedEvents = allEvents
        .filter(event => event.id !== currentEvent.id && event.type === currentEvent.type)
        .slice(0, 3);
    
    const container = document.getElementById('related-events-container');
    
    if (relatedEvents.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No related events available</p>`;
        return;
    }
    
    container.innerHTML = relatedEvents.map(event => `
        <div class="card event-card">
            <div class="card-image">
                <img src="${event.image}" alt="${event.title}" loading="lazy">
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

function setupBookmarkHandler() {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    
    bookmarkBtn.addEventListener('click', () => {
        if (!currentEvent) return;
        
        const isBookmarked = storage.isBookmarked(currentEvent.id);
        
        if (isBookmarked) {
            storage.removeBookmark(currentEvent.id);
        } else {
            storage.addBookmark(currentEvent.id);
        }
        
        updateBookmarkButton();
    });
}

function updateBookmarkButton() {
    if (!currentEvent) return;
    
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const icon = bookmarkBtn.querySelector('.bookmark-icon');
    const text = bookmarkBtn.querySelector('.bookmark-text');
    
    const isBookmarked = storage.isBookmarked(currentEvent.id);
    
    icon.textContent = isBookmarked ? '❤️' : '🤍';
    text.textContent = isBookmarked ? 'Event Saved' : 'Save Event';
    
    bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
}

function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
}
