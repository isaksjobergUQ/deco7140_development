// Language page functionality
import { fetchGetData } from './modules/getData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize internationalization
    await i18n.init();
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Set up language switcher
    setupLanguageSwitcher();
    
    // Load language learning resources
    await loadLanguageResources();
    
    // Update current language display
    updateCurrentLanguageDisplay();
});

function setupLanguageSwitcher() {
    const languageSelect = document.getElementById('language-select');
    const applyButton = document.getElementById('apply-language');
    
    // Set current language in select
    const currentLang = i18n.getCurrentLanguage();
    languageSelect.value = currentLang;
    
    // Handle language change
    applyButton.addEventListener('click', async () => {
        const selectedLang = languageSelect.value;
        await i18n.switchLanguage(selectedLang);
        updateCurrentLanguageDisplay();
        
        // Show success message
        showLanguageChangeMessage(`Language changed to ${getLanguageName(selectedLang)}`);
    });
    
    // Also allow direct selection
    languageSelect.addEventListener('change', async () => {
        const selectedLang = languageSelect.value;
        await i18n.switchLanguage(selectedLang);
        updateCurrentLanguageDisplay();
    });
}

function updateCurrentLanguageDisplay() {
    const currentLang = i18n.getCurrentLanguage();
    const displayElement = document.getElementById('current-lang-display');
    displayElement.textContent = getLanguageName(currentLang);
}

function getLanguageName(langCode) {
    const languageNames = {
        'en': 'English',
        'zh': '中文 (Chinese)',
        'es': 'Español (Spanish)',
        'fr': 'Français (French)',
        'de': 'Deutsch (German)',
        'ja': '日本語 (Japanese)',
        'ko': '한국어 (Korean)'
    };
    return languageNames[langCode] || 'English';
}

async function loadLanguageResources() {
    try {
        // Load language-related tips from the tips data
        const tips = await fetchGetData('./data/tips.json');
        const languageTips = tips.filter(tip => 
            tip.category === 'Academic' && 
            (tip.tags.includes('language-learning') || tip.title.toLowerCase().includes('language'))
        );
        
        renderLanguageTips(languageTips);
        
    } catch (error) {
        console.error('Error loading language resources:', error);
        showError();
    }
}

function renderLanguageTips(tips) {
    const container = document.getElementById('language-tips-container');
    
    if (tips.length === 0) {
        // Show some general language learning tips if no specific ones found
        container.innerHTML = `
            <div class="card">
                <div class="card-content">
                    <h3>📚 Academic Writing Tips</h3>
                    <p>Learn about academic integrity, proper citations, and essay structure to improve your academic writing skills.</p>
                    <a href="tips.html?filter=Academic" class="btn btn-secondary">View Academic Tips</a>
                </div>
            </div>
            
            <div class="card">
                <div class="card-content">
                    <h3>🗣️ Communication Skills</h3>
                    <p>Develop your English communication skills through practice, cultural exchange, and language learning resources.</p>
                    <a href="community.html" class="btn btn-secondary">Join Language Exchange</a>
                </div>
            </div>
            
            <div class="card">
                <div class="card-content">
                    <h3>📖 Study Strategies</h3>
                    <p>Effective study techniques and time management strategies to help you succeed in your academic journey.</p>
                    <a href="tips.html?filter=Academic" class="btn btn-secondary">View Study Tips</a>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tips.map(tip => `
        <div class="card">
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
                <div class="card-tags">
                    ${tip.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="tip-detail.html?id=${tip.id}" class="btn btn-secondary">Read More</a>
            </div>
        </div>
    `).join('');
}

function showLanguageChangeMessage(message) {
    // Create a temporary message element
    const messageEl = document.createElement('div');
    messageEl.className = 'language-change-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
}

function showError() {
    const container = document.getElementById('language-tips-container');
    container.innerHTML = `<p data-i18n="error_loading">Error loading language resources</p>`;
}

// Add CSS animations for the language change message
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
