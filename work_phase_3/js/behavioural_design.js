/**
 * IMPORTS
 * Keep track of external modules being used
 * */
import { postFormData } from "./modules/postFormData.js";

/**
 * CONSTANTS
 * Define values that don't change e.g. page titles, URLs, etc.
 * */

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

    if (form && feedback) {
        // Listen for form submission
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // Stop normal form submission

            try {
                // Submit form data to API
                const { success, data } = await postFormData(
                    form,
                    "INSERT_API_ENDPOINT", // Replace with actual endpoint
                    {
                        student_number: "s1234567", // Replace with your student number
                        uqcloud_zone_id: "abcd123", // Replace with your UQ Cloud Zone ID
                    }
                );

                if (success) {
                    // Show success message
                    feedback.textContent =
                        data.message || "Thanks for joining the community!";
                    feedback.className = "form-feedback success";
                    form.reset(); // Clear the form
                } else {
                    // Show error message
                    feedback.textContent =
                        data.message ||
                        "There was an error submitting your form. Please try again.";
                    feedback.className = "form-feedback error";
                }
            } catch (error) {
                // Handle unexpected errors
                feedback.textContent =
                    "An unexpected error occurred. Please try again.";
                feedback.className = "form-feedback error";
                console.error("Form submission error:", error);
            }
        });
    }
});
