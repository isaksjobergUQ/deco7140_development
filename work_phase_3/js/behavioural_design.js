/**
 * IMPORTS
 * Keep track of external modules being used
 * */
import { postFormData } from "./modules/postFormData.js";

/**
 * CONSTANTS
 * Define values that don't change e.g. page titles, URLs, etc.
 * */
const API_ENDPOINT = "https://api.example.com/api/community/"; // Replace with actual API endpoint
const STUDENT_NUMBER = "s1234567"; // Replace with your actual student number
const UQ_CLOUD_ZONE_ID = "abcd123"; // Replace with your actual UQ Cloud Zone ID

/**
 * VARIABLES
 * Define values that will change e.g. user inputs, counters, etc.
 * */

/**
 * FUNCTIONS
 * Group code into functions to make it reusable
 * */

/**
 * EVENT LISTENERS
 * The code that runs when a user interacts with the page
 * */

// when the page fully loads
document.addEventListener("DOMContentLoaded", () => {
    // Initialize behavioural design functionality
    console.log("Behavioural Design page loaded");

    // Get form and feedback elements
    const form = document.getElementById("community-form");
    const feedback = document.getElementById("form-feedback");

    console.log("Form element:", form);
    console.log("Feedback element:", feedback);

    if (form && feedback) {
        console.log("Form and feedback elements found - setting up event listener");
        
        // Listen for form submission
        form.addEventListener("submit", async (e) => {
            console.log("Form submitted - preventing default behavior");
            e.preventDefault(); // Stop normal form submission

            // Clear previous feedback
            feedback.textContent = "";
            feedback.className = "form-feedback";

            console.log("Attempting to submit form data...");

            try {
                // Submit form data to API
                const { success, data } = await postFormData(
                    form,
                    API_ENDPOINT,
                    {
                        student_number: STUDENT_NUMBER,
                        uqcloud_zone_id: UQ_CLOUD_ZONE_ID,
                    }
                );

                console.log("API response:", { success, data });

                if (success) {
                    // Show success message
                    feedback.textContent =
                        data.message || "Thanks for joining the community!";
                    feedback.className = "form-feedback success";
                    form.reset(); // Clear the form
                    console.log("Form submitted successfully!");
                } else {
                    // Show error message
                    feedback.textContent =
                        data.message ||
                        "There was an error submitting your form. Please try again.";
                    feedback.className = "form-feedback error";
                    console.log("Form submission failed:", data.message);
                }
            } catch (error) {
                // Handle unexpected errors
                feedback.textContent =
                    "An unexpected error occurred. Please try again.";
                feedback.className = "form-feedback error";
                console.error("Form submission error:", error);
            }
        });

        // Add real-time validation feedback
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });
        });
        
        // Add file input validation
        const fileInput = form.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.addEventListener('change', () => {
                validateField(fileInput);
            });
        }
    } else {
        console.log("Form or feedback element not found!");
        console.log("Available elements with IDs:", document.querySelectorAll('[id]'));
    }
});

/**
 * Validate individual form field
 * @param {HTMLElement} field - The input field to validate
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldGroup = field.closest('.form-group');
    let errorElement = fieldGroup.querySelector('.field-error');
    
    // Remove existing error message
    if (errorElement) {
        errorElement.remove();
    }
    
    // Check if field is required and empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(fieldGroup, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(fieldGroup, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Name validation (minimum 2 characters)
    if (field.name === 'name' && value && value.length < 2) {
        showFieldError(fieldGroup, 'Name must be at least 2 characters long');
        return false;
    }
    
    // File validation
    if (field.type === 'file' && field.files.length > 0) {
        const file = field.files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        
        if (file.size > maxSize) {
            showFieldError(fieldGroup, 'File size must be less than 5MB');
            return false;
        }
        
        if (!file.type.startsWith('image/')) {
            showFieldError(fieldGroup, 'Please select an image file');
            return false;
        }
    }
    
    return true;
}

/**
 * Show error message for a specific field
 * @param {HTMLElement} fieldGroup - The form group containing the field
 * @param {string} message - The error message to display
 */
function showFieldError(fieldGroup, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    fieldGroup.appendChild(errorElement);
}
