// Contact page functionality
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize internationalization
    await i18n.init();
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Set up form handling
    setupContactForm();
});

function setupContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Client-side validation
        if (!data.name || !data.email || !data.subject || !data.message) {
            showFormFeedback('Please fill in all required fields.', 'error');
            return;
        }
        
        if (!isValidEmail(data.email)) {
            showFormFeedback('Please enter a valid email address.', 'error');
            return;
        }
        
        try {
            // Save to localStorage (simulating form submission)
            storage.saveFormSubmission(data);
            
            // Show success message
            showFormFeedback('Thank you for your message! We\'ll get back to you soon.', 'success');
            
            // Reset form
            form.reset();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showFormFeedback('Sorry, there was an error sending your message. Please try again.', 'error');
        }
    });
}

function showFormFeedback(message, type) {
    const feedback = document.getElementById('form-feedback');
    feedback.textContent = message;
    feedback.className = `form-feedback ${type}`;
    
    // Clear feedback after 5 seconds
    setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'form-feedback';
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

