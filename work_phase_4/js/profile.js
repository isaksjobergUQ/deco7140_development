// Profile page functionality
import { fetchGetData } from './modules/getData.js';
import { storage } from './modules/storage.js';
import { i18n } from './modules/i18n.js';

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    await i18n.init();
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Load user data
    await loadProfileData();
    
    // Set up name editing
    setupNameEditor();
});

function setupNameEditor() {
    const nameInput = document.getElementById('user-name');
    const saveBtn = document.getElementById('save-name-btn');
    const feedback = document.getElementById('name-feedback');
    
    // Load current name only if it exists and is not the default
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        nameInput.value = savedName;
    }
    
    saveBtn.addEventListener('click', () => {
        const newName = nameInput.value.trim();
        if (newName) {
            storage.setUserName(newName);
            feedback.textContent = 'Name saved!';
            feedback.className = 'form-feedback success';
            setTimeout(() => {
                feedback.textContent = '';
                feedback.className = 'form-feedback';
            }, 2000);
        }
    });
}

async function loadProfileData() {
    try {
        // Load all tips and events to match with bookmarks
        const [tips, events] = await Promise.all([
            fetchGetData('./data/tips.json'),
            fetchGetData('./data/events.json')
        ]);
        
        // Get bookmarks
        const bookmarks = storage.getBookmarks();
        const bookmarkedItems = [];
        
        // Find bookmarked tips and events
        tips.forEach(tip => {
            if (bookmarks.includes(tip.id)) {
                bookmarkedItems.push({ ...tip, type: 'tip' });
            }
        });
        
        events.forEach(event => {
            if (bookmarks.includes(event.id)) {
                bookmarkedItems.push({ ...event, type: 'event' });
            }
        });
        
        renderBookmarks(bookmarkedItems);
        
        // Load user posts
        const userPosts = storage.getUserPosts();
        renderMyPosts(userPosts);
        
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

function renderBookmarks(items) {
    const container = document.getElementById('bookmarks-container');
    
    if (items.length === 0) {
        container.innerHTML = '<p>No bookmarks yet. Start bookmarking tips and events you like!</p>';
        return;
    }
    
    container.innerHTML = items.map(item => {
        if (item.type === 'tip') {
            return `
                <a href="tip-detail.html?id=${item.id}" class="card tip-card">
                    <div class="card-image">
                        <img src="${item.image}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer">
                    </div>
                    <div class="card-content">
                        <div class="card-meta">
                            <span class="category">${item.category}</span>
                        </div>
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-summary">${item.summary}</p>
                    </div>
                </a>
            `;
        } else {
            return `
                <a href="event-detail.html?id=${item.id}" class="card event-card">
                    <div class="card-image">
                        <img src="${item.image}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer">
                    </div>
                    <div class="card-content">
                        <div class="card-meta">
                            <span class="type">${item.type}</span>
                        </div>
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-summary">${item.summary}</p>
                    </div>
                </a>
            `;
        }
    }).join('');
}

function renderMyPosts(posts) {
    const container = document.getElementById('my-posts-container');
    
    if (posts.length === 0) {
        container.innerHTML = '<p>You haven\'t created any posts yet. <a href="community.html">Create your first post</a>!</p>';
        return;
    }
    
    container.innerHTML = posts.reverse().map(post => `
        <div class="card forum-thread">
            <div class="card-content">
                <div class="card-meta">
                    <span class="category">${post.category}</span>
                    <span class="date">${new Date(post.date).toLocaleDateString()}</span>
                </div>
                <h3 class="card-title">${post.title}</h3>
                <div class="thread-content">${post.content}</div>
                <div class="thread-footer">
                    <span>💬 ${post.replies} replies</span>
                    <span>❤️ ${post.likes} likes</span>
                </div>
            </div>
        </div>
    `).join('');
}

