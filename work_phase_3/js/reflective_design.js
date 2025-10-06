/**
 * IMPORTS
 * Keep track of external modules being used
 * */
import { fetchGetData } from './modules/getData.js';

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
document.addEventListener('DOMContentLoaded', () => {
    // Initialize reflective design page functionality
    console.log('Reflective Design page loaded');
    
    // Load community data dynamically
    loadCommunityData();
});

/**
 * Load community data from API and display it
 */
async function loadCommunityData() {
    const container = document.getElementById('community-list');
    
    if (!container) {
        console.error('Community list container not found');
        return;
    }
    
    try {
        // Replace with actual API endpoint and headers
        const data = await fetchGetData(
            'INSERT_API_ENDPOINT', // Replace with actual endpoint
            {
                'student_number': 's1234567', // Replace with your student number
                'uqcloud_zone_id': 'abcd123'  // Replace with your UQ Cloud Zone ID
            }
        );
        
        if (!data) {
            showErrorMessage(container, 'Unable to load community stories at this time. Please try again later.');
            return;
        }
        
        if (data.length === 0) {
            showEmptyMessage(container);
            return;
        }
        
        displayCommunityData(container, data);
        
    } catch (error) {
        console.error('Error loading community data:', error);
        showErrorMessage(container, 'There was an error loading community stories. Please try again later.');
    }
}

/**
 * Display community data as cards
 */
function displayCommunityData(container, data) {
    // Clear loading message
    container.innerHTML = '';
    
    // Create cards for each community member
    data.forEach(member => {
        const card = document.createElement('div');
        card.className = 'community-card';
        
        const name = member.name || 'Anonymous';
        const message = member.message || 'No message provided';
        
        card.innerHTML = `
            <h4>${escapeHtml(name)}</h4>
            <p>${escapeHtml(message)}</p>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Show error message
 */
function showErrorMessage(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

/**
 * Show empty state message
 */
function showEmptyMessage(container) {
    container.innerHTML = `
        <div class="loading-message">
            <p>No community stories available yet. Be the first to share your experience!</p>
        </div>
    `;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
