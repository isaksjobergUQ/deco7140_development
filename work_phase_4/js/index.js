// Homepage functionality
import { fetchGetData } from './modules/getData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize internationalization
    await i18n.init();
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Load featured content
    await loadFeaturedContent();
    
    // Set up bookmark functionality
    setupBookmarkHandlers();
});

async function loadFeaturedContent() {
    try {
        // Load featured tips
        const tips = await fetchGetData('./data/tips.json');
        const featuredTips = tips.filter(tip => tip.featured).slice(0, 3);
        renderFeaturedTips(featuredTips);
        
        // Load upcoming events
        const events = await fetchGetData('./data/events.json');
        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= new Date();
        }).slice(0, 3);
        renderUpcomingEvents(upcomingEvents);
        
    } catch (error) {
        console.error('Error loading featured content:', error);
        showError('featured-tips-container');
        showError('upcoming-events-container');
    }
}

function renderFeaturedTips(tips) {
    const container = document.getElementById('featured-tips-container');
    
    if (tips.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No content available</p>`;
        return;
    }
    
    container.innerHTML = tips.map(tip => `
        <a href="tip-detail.html?id=${tip.id}" class="tip-card" data-tip-id="${tip.id}">
            <div class="card-image">
                <img src="${tip.image}" alt="${tip.title}" loading="lazy">
                <button class="bookmark-btn" aria-label="Bookmark this tip" data-tip-id="${tip.id}">
                    <span class="bookmark-icon">${storage.isBookmarked(tip.id) ? '❤️' : '🤍'}</span>
                </button>
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span class="category">${tip.category}</span>
                </div>
                <h3 class="card-title">${tip.title}</h3>
                <p class="card-summary">${tip.summary}</p>
            </div>
        </a>
    `).join('');
}

function renderUpcomingEvents(events) {
    const container = document.getElementById('upcoming-events-container');
    
    if (events.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No content available</p>`;
        return;
    }
    
    container.innerHTML = events.map(event => `
        <a href="event-detail.html?id=${event.id}" class="event-card" data-event-id="${event.id}">
            <div class="card-image">
                <img src="${event.image}" alt="${event.title}" loading="lazy">
                <button class="bookmark-btn" aria-label="Save this event" data-event-id="${event.id}">
                    <span class="bookmark-icon">${storage.isBookmarked(event.id) ? '❤️' : '🤍'}</span>
                </button>
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span class="type">${event.type}</span>
                </div>
                <h3 class="card-title">${event.title}</h3>
                <p class="card-summary">${event.summary}</p>
                <div class="event-details">
                    <p>📅 ${event.date}</p>
                    <p>📍 ${event.location}</p>
                </div>
            </div>
        </a>
    `).join('');
}

function setupBookmarkHandlers() {
    // Handle tip bookmarks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn[data-tip-id]')) {
            e.preventDefault();
            const tipId = e.target.closest('.bookmark-btn').dataset.tipId;
            toggleBookmark(tipId, 'tip');
        }
        
        if (e.target.closest('.bookmark-btn[data-event-id]')) {
            e.preventDefault();
            const eventId = e.target.closest('.bookmark-btn').dataset.eventId;
            toggleBookmark(eventId, 'event');
        }
    });
}

function toggleBookmark(id, type) {
    const isBookmarked = storage.isBookmarked(id);
    
    if (isBookmarked) {
        storage.removeBookmark(id);
    } else {
        storage.addBookmark(id);
    }
    
    // Update bookmark icon
    const bookmarkBtn = document.querySelector(`[data-${type}-id="${id}"] .bookmark-btn`);
    if (bookmarkBtn) {
        const icon = bookmarkBtn.querySelector('.bookmark-icon');
        icon.textContent = storage.isBookmarked(id) ? '❤️' : '🤍';
    }
}

function showError(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p data-i18n="error_loading">Error loading content</p>`;
}