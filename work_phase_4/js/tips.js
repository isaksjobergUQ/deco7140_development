// Tips page functionality
import { fetchGetData } from './modules/getData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

let allTips = [];
let filteredTips = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize internationalization
    await i18n.init();
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Load tips
    await loadTips();
    
    // Set up filter functionality
    setupFilters();
    
    // Set up bookmark functionality
    setupBookmarkHandlers();
});

async function loadTips() {
    try {
        allTips = await fetchGetData('./data/tips.json');
        filteredTips = [...allTips];
        renderTips(filteredTips);
    } catch (error) {
        console.error('Error loading tips:', error);
        showError();
    }
}

function renderTips(tips) {
    const container = document.getElementById('tips-container');
    
    if (tips.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No tips available for this category</p>`;
        return;
    }
    
    container.innerHTML = tips.map(tip => `
        <div class="card tip-card" data-tip-id="${tip.id}" data-category="${tip.category}">
            <div class="card-image">
                <img src="${tip.image}" alt="${tip.title}" loading="lazy">
                <button class="bookmark-btn" aria-label="Bookmark this tip" data-tip-id="${tip.id}">
                    <span class="bookmark-icon">${storage.isBookmarked(tip.id) ? '❤️' : '🤍'}</span>
                </button>
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span class="category">${tip.category}</span>
                    <span class="date">${new Date(tip.date).toLocaleDateString()}</span>
                </div>
                <h3 class="card-title">${tip.title}</h3>
                <p class="card-summary">${tip.summary}</p>
                <div class="card-tags">
                    ${tip.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="tip-detail.html?id=${tip.id}" class="btn btn-secondary" data-i18n="read_more">Read More</a>
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
            
            // Filter tips
            const filter = button.dataset.filter;
            if (filter === 'all') {
                filteredTips = [...allTips];
            } else {
                filteredTips = allTips.filter(tip => tip.category === filter);
            }
            
            renderTips(filteredTips);
        });
    });
}

function setupBookmarkHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn')) {
            e.preventDefault();
            const tipId = e.target.closest('.bookmark-btn').dataset.tipId;
            toggleBookmark(tipId);
        }
    });
}

function toggleBookmark(tipId) {
    const isBookmarked = storage.isBookmarked(tipId);
    
    if (isBookmarked) {
        storage.removeBookmark(tipId);
    } else {
        storage.addBookmark(tipId);
    }
    
    // Update bookmark icon
    const bookmarkBtn = document.querySelector(`[data-tip-id="${tipId}"] .bookmark-btn`);
    if (bookmarkBtn) {
        const icon = bookmarkBtn.querySelector('.bookmark-icon');
        icon.textContent = storage.isBookmarked(tipId) ? '❤️' : '🤍';
    }
}

function showError() {
    const container = document.getElementById('tips-container');
    container.innerHTML = `<p data-i18n="error_loading">Error loading tips</p>`;
}
