// Community page functionality
import { fetchGetData } from './modules/getData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

let allThreads = [];
let allGroups = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize internationalization
    await i18n.init();
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Load community data
    await loadCommunityData();
    
    // Set up interactive features
    setupLikeHandlers();
    setupGroupHandlers();
    
    // Set up new post form handlers
    setupNewPostForm();
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
        
        // Merge user-generated posts with JSON data
        const userPosts = storage.getUserPosts();
        // User posts should appear first (most recent at top)
        allThreads = [...userPosts.reverse(), ...threads];
        
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
                    <button class="join-btn ${isMember ? 'joined' : ''}" data-group-id="${group.id}" aria-label="${isMember ? 'Leave group' : 'Join group'}: ${group.name}">
                        ${isMember ? 'Leave Group' : 'Join Group'}
                    </button>
                    <span class="contact">Contact: ${group.contact}</span>
                </div>
            </div>
        `;
    }).join('');
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

function showError(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p data-i18n="error_loading">Error loading content</p>`;
}

function setupNewPostForm() {
    const newPostBtn = document.getElementById('new-post-btn');
    const formContainer = document.getElementById('new-post-form-container');
    const cancelBtn = document.getElementById('cancel-post-btn');
    const form = document.getElementById('new-post-form');
    
    // Show/hide form
    newPostBtn.addEventListener('click', () => {
        formContainer.style.display = 'block';
        // Smooth scroll to form
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    
    cancelBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        form.reset();
    });
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const title = formData.get('title').trim();
        const content = formData.get('content').trim();
        const category = formData.get('category');
        const author = 'You'; // Could be replaced with actual user name if logged in
        
        // Validate
        if (!title || !content) {
            alert('Please fill in both title and content.');
            return;
        }
        
        // Create new post
        const newPost = storage.addUserPost({
            title: title,
            content: `<p>${content}</p>`,
            author: author,
            category: category
        });
        
        // Add to allThreads array at the beginning
        allThreads.unshift(newPost);
        
        // Re-render forums
        renderForums(allThreads);
        
        // Hide form and reset
        formContainer.style.display = 'none';
        form.reset();
        
        // Scroll to the new post
        setTimeout(() => {
            const newPostElement = document.querySelector(`[data-thread-id="${newPost.id}"]`);
            if (newPostElement) {
                newPostElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a highlight effect
                newPostElement.style.backgroundColor = '#e8f5e9';
                setTimeout(() => {
                    newPostElement.style.backgroundColor = '';
                }, 2000);
            }
        }, 100);
    });
}
