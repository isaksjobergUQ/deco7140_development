// Community page functionality
import { fetchGetData } from './modules/getData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';
import { initAccordion } from './modules/accordion.js';

let allThreads = [];
let allGroups = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize internationalization
    await i18n.init();
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Initialize accordions
    initAccordion('forums-accordion');
    initAccordion('groups-accordion');
    initAccordion('contact-accordion');
    
    // Load community data
    await loadCommunityData();
    
    // Set up form handling
    setupContactForm();
    
    // Set up interactive features
    setupLikeHandlers();
    setupGroupHandlers();
});

async function loadCommunityData() {
    try {
        // Load forums and groups in parallel
        const [threads, groups] = await Promise.all([
            fetchGetData('./data/threads.json'),
            fetchGetData('./data/groups.json')
        ]);
        
        allThreads = threads;
        allGroups = groups;
        
        renderForums(allThreads);
        renderGroups(allGroups);
        
    } catch (error) {
        console.error('Error loading community data:', error);
        showError('forums-container');
        showError('groups-container');
    }
}

function renderForums(threads) {
    const container = document.getElementById('forums-container');
    
    if (threads.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No discussions available</p>`;
        return;
    }
    
    container.innerHTML = threads.map(thread => `
        <div class="forum-thread" data-thread-id="${thread.id}">
            <div class="thread-header">
                <h3 class="thread-title">${thread.title}</h3>
                <div class="thread-meta">
                    <span class="author">by ${thread.author}</span>
                    <span class="date">${new Date(thread.date).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="thread-content">
                <p>${thread.content}</p>
            </div>
            <div class="thread-footer">
                <button class="like-btn" data-thread-id="${thread.id}" aria-label="Like this thread">
                    <span class="like-icon">${storage.isLiked(thread.id) ? '❤️' : '🤍'}</span>
                    <span class="like-count">${thread.likes + (storage.isLiked(thread.id) ? 1 : 0)}</span>
                </button>
                <span class="replies-count">${thread.replies} replies</span>
                <span class="category">${thread.category}</span>
            </div>
        </div>
    `).join('');
}

function renderGroups(groups) {
    const container = document.getElementById('groups-container');
    
    if (groups.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No study groups available</p>`;
        return;
    }
    
    container.innerHTML = groups.map(group => {
        const isMember = storage.isGroupMember(group.id);
        const currentMembers = group.members + (isMember ? 1 : 0);
        
        return `
            <div class="study-group" data-group-id="${group.id}">
                <div class="group-header">
                    <h3 class="group-name">${group.name}</h3>
                    <div class="group-meta">
                        <span class="category">${group.category}</span>
                        <span class="members">${currentMembers}/${group.max_members} members</span>
                    </div>
                </div>
                <div class="group-content">
                    <p class="group-description">${group.description}</p>
                    <div class="group-details">
                        <p><strong>Meeting Day:</strong> ${group.meeting_day}</p>
                        <p><strong>Meeting Time:</strong> ${group.meeting_time}</p>
                        <p><strong>Location:</strong> ${group.location}</p>
                    </div>
                </div>
                <div class="group-footer">
                    <button class="join-btn ${isMember ? 'joined' : ''}" data-group-id="${group.id}">
                        ${isMember ? 'Leave Group' : 'Join Group'}
                    </button>
                    <span class="contact">Contact: ${group.contact}</span>
                </div>
            </div>
        `;
    }).join('');
}

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

function setupLikeHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn')) {
            const threadId = e.target.closest('.like-btn').dataset.threadId;
            toggleLike(threadId);
        }
    });
}

function setupGroupHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.join-btn')) {
            const groupId = e.target.closest('.join-btn').dataset.groupId;
            toggleGroupMembership(groupId);
        }
    });
}

function toggleLike(threadId) {
    const isLiked = storage.toggleLike(threadId);
    
    // Update like button
    const likeBtn = document.querySelector(`[data-thread-id="${threadId}"] .like-btn`);
    if (likeBtn) {
        const icon = likeBtn.querySelector('.like-icon');
        const count = likeBtn.querySelector('.like-count');
        
        icon.textContent = isLiked ? '❤️' : '🤍';
        
        // Update count
        const originalCount = allThreads.find(t => t.id === threadId).likes;
        count.textContent = originalCount + (isLiked ? 1 : 0);
    }
}

function toggleGroupMembership(groupId) {
    const isMember = storage.isGroupMember(groupId);
    
    if (isMember) {
        storage.leaveGroup(groupId);
    } else {
        storage.joinGroup(groupId);
    }
    
    // Update group display
    const group = document.querySelector(`[data-group-id="${groupId}"]`);
    if (group) {
        const joinBtn = group.querySelector('.join-btn');
        const membersSpan = group.querySelector('.members');
        
        const newIsMember = storage.isGroupMember(groupId);
        const originalGroup = allGroups.find(g => g.id === groupId);
        const currentMembers = originalGroup.members + (newIsMember ? 1 : 0);
        
        joinBtn.textContent = newIsMember ? 'Leave Group' : 'Join Group';
        joinBtn.classList.toggle('joined', newIsMember);
        membersSpan.textContent = `${currentMembers}/${originalGroup.max_members} members`;
    }
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

function showError(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p data-i18n="error_loading">Error loading content</p>`;
}
