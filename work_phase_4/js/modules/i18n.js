// Internationalization (i18n) module
let currentLanguage = 'en';
let translations = {};

export const i18n = {
    async init() {
        currentLanguage = localStorage.getItem('language') || 'en';
        await this.loadLanguage(currentLanguage);
        this.updatePageContent();
    },

    async loadLanguage(lang) {
        try {
            const response = await fetch(`./data/lang/${lang}.json`);
            translations = await response.json();
            currentLanguage = lang;
            localStorage.setItem('language', lang);
        } catch (error) {
            console.error('Error loading language:', error);
            // Fallback to English
            if (lang !== 'en') {
                await this.loadLanguage('en');
            }
        }
    },

    t(key) {
        return translations[key] || key;
    },

    updatePageContent() {
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.placeholder) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update page title
        document.title = this.t('site_title');

        // Update meta description if it exists
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = this.t('hero_subtitle');
        }
    },

    async switchLanguage(lang) {
        await this.loadLanguage(lang);
        this.updatePageContent();
        
        // Dispatch custom event for other modules to listen
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
    },

    getCurrentLanguage() {
        return currentLanguage;
    },

    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'zh', name: '中文' },
            { code: 'es', name: 'Español' },
            { code: 'fr', name: 'Français' },
            { code: 'de', name: 'Deutsch' },
            { code: 'ja', name: '日本語' },
            { code: 'ko', name: '한국어' }
        ];
    }
};
