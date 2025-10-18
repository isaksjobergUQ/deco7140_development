// Tip detail page functionality
import { fetchGetData } from './modules/getData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

let currentTip = null;
let allTips = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize internationalization
    await i18n.init();
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Get tip ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tipId = urlParams.get('id');
    
    if (!tipId) {
        showError();
        return;
    }
    
    // Load tip data
    await loadTip(tipId);
    
    // Set up bookmark functionality
    setupBookmarkHandler();
});

async function loadTip(tipId) {
    try {
        allTips = await fetchGetData('./data/tips.json');
        currentTip = allTips.find(tip => tip.id === tipId);
        
        if (!currentTip) {
            showError();
            return;
        }
        
        renderTip(currentTip);
        loadRelatedTips(currentTip);
        
    } catch (error) {
        console.error('Error loading tip:', error);
        showError();
    }
}

function renderTip(tip) {
    // Hide loading state
    document.getElementById('loading-state').style.display = 'none';
    
    // Show tip content
    const tipContent = document.getElementById('tip-content');
    tipContent.style.display = 'block';
    
    // Update breadcrumb
    document.getElementById('breadcrumb-category').textContent = tip.category;
    document.getElementById('breadcrumb-title').textContent = tip.title;
    
    // Update tip header
    document.getElementById('tip-category').textContent = tip.category;
    document.getElementById('tip-date').textContent = new Date(tip.date).toLocaleDateString();
    document.getElementById('tip-author').textContent = `by ${tip.author}`;
    document.getElementById('tip-title').textContent = tip.title;
    
    // Update tip image
    const tipImage = document.getElementById('tip-image');
    tipImage.src = tip.image;
    tipImage.alt = tip.title;
    
    // Update tip summary
    document.getElementById('tip-summary').textContent = tip.summary;
    
    // Update tip body content
    document.getElementById('tip-body-content').innerHTML = tip.content;
    
    // Update tip tags
    const tagsContainer = document.getElementById('tip-tags-container');
    tagsContainer.innerHTML = tip.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    // Update bookmark button
    updateBookmarkButton();
    
    // Update page title
    document.title = `${tip.title} - International Student Platform`;
}

function loadRelatedTips(currentTip) {
    const relatedTips = allTips
        .filter(tip => tip.id !== currentTip.id && tip.category === currentTip.category)
        .slice(0, 3);
    
    const container = document.getElementById('related-tips-container');
    
    if (relatedTips.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No related tips available</p>`;
        return;
    }
    
    container.innerHTML = relatedTips.map(tip => `
        <div class="card tip-card">
            <div class="card-image">
                <img src="${tip.image}" alt="${tip.title}" loading="lazy">
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span class="category">${tip.category}</span>
                    <span class="date">${new Date(tip.date).toLocaleDateString()}</span>
                </div>
                <h3 class="card-title">${tip.title}</h3>
                <p class="card-summary">${tip.summary}</p>
                <a href="tip-detail.html?id=${tip.id}" class="btn btn-secondary" data-i18n="read_more">Read More</a>
            </div>
        </div>
    `).join('');
}

function setupBookmarkHandler() {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    
    bookmarkBtn.addEventListener('click', () => {
        if (!currentTip) return;
        
        const isBookmarked = storage.isBookmarked(currentTip.id);
        
        if (isBookmarked) {
            storage.removeBookmark(currentTip.id);
        } else {
            storage.addBookmark(currentTip.id);
        }
        
        updateBookmarkButton();
    });
}

function updateBookmarkButton() {
    if (!currentTip) return;
    
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const icon = bookmarkBtn.querySelector('.bookmark-icon');
    const text = bookmarkBtn.querySelector('.bookmark-text');
    
    const isBookmarked = storage.isBookmarked(currentTip.id);
    
    icon.textContent = isBookmarked ? '❤️' : '🤍';
    text.textContent = isBookmarked ? 'Bookmarked' : 'Bookmark';
    
    bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
}

function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
}
