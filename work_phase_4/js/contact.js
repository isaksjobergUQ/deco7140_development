// Contact page functionality
import { postFormData } from './modules/postFormData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

// API Configuration
const API_BASE_URL = 'https://damp-castle-86239-1b70ee448fbd.herokuapp.com/decoapi/';
const API_ENDPOINT = `${API_BASE_URL}communitymembersimple/`;
const STUDENT_NUMBER = '4978714';
const UQ_CLOUD_ZONE_ID = '435eba26';

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
    
    if (!form || !feedback) {
        console.error('Form or feedback element not found');
        return;
    }
    
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
        
        // Show submitting message
        feedback.textContent = 'Submitting...';
        feedback.className = 'form-feedback';
        
        try {
            // Map to Simple Community (name, email, message). Combine subject+message into message
            const apiForm = document.createElement('form');
            const nameInput = document.createElement('input');
            nameInput.type = 'hidden';
            nameInput.name = 'name';
            nameInput.value = data.name;
            apiForm.appendChild(nameInput);

            const emailInput = document.createElement('input');
            emailInput.type = 'hidden';
            emailInput.name = 'email';
            emailInput.value = data.email;
            apiForm.appendChild(emailInput);

            const messageInput = document.createElement('input');
            messageInput.type = 'hidden';
            messageInput.name = 'message';
            messageInput.value = `Subject: ${data.subject}\n\n${data.message}`;
            apiForm.appendChild(messageInput);
            
            // Submit to API
            const { success, data: responseData } = await postFormData(
                apiForm,
                API_ENDPOINT,
                {
                    'student_number': STUDENT_NUMBER,
                    'uqcloud_zone_id': UQ_CLOUD_ZONE_ID,
                }
            );
            
            if (success) {
                // Also save to localStorage as backup
                storage.saveFormSubmission(data);
                
                // Show success message from API or default
                showFormFeedback(
                    responseData.message || 'Thank you for your message! We\'ll get back to you soon.',
                    'success'
                );
                
                // Reset form
                form.reset();
            } else {
                // API failed, save to localStorage as fallback
                storage.saveFormSubmission(data);
                
                // Show success message
                showFormFeedback(
                    'Thank you for your message! We\'ll get back to you soon.',
                    'success'
                );
                
                // Reset form
                form.reset();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            // Fallback to localStorage
            storage.saveFormSubmission(data);
            showFormFeedback('Thank you for your message! We\'ll get back to you soon.', 'success');
            
            // Reset form
            form.reset();
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

