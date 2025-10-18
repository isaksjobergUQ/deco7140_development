// localStorage helper module
export const storage = {
    // Bookmarks for tips and events
    getBookmarks() {
        const bookmarks = localStorage.getItem('bookmarks');
        return bookmarks ? JSON.parse(bookmarks) : [];
    },

    addBookmark(id) {
        const bookmarks = this.getBookmarks();
        if (!bookmarks.includes(id)) {
            bookmarks.push(id);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        }
    },

    removeBookmark(id) {
        const bookmarks = this.getBookmarks();
        const filtered = bookmarks.filter(bookmark => bookmark !== id);
        localStorage.setItem('bookmarks', JSON.stringify(filtered));
    },

    isBookmarked(id) {
        const bookmarks = this.getBookmarks();
        return bookmarks.includes(id);
    },

    // Study group memberships
    getGroupMemberships() {
        const memberships = localStorage.getItem('groupMemberships');
        return memberships ? JSON.parse(memberships) : {};
    },

    joinGroup(groupId) {
        const memberships = this.getGroupMemberships();
        memberships[groupId] = true;
        localStorage.setItem('groupMemberships', JSON.stringify(memberships));
    },

    leaveGroup(groupId) {
        const memberships = this.getGroupMemberships();
        delete memberships[groupId];
        localStorage.setItem('groupMemberships', JSON.stringify(memberships));
    },

    isGroupMember(groupId) {
        const memberships = this.getGroupMemberships();
        return !!memberships[groupId];
    },

    // Forum likes
    getLikes() {
        const likes = localStorage.getItem('likes');
        return likes ? JSON.parse(likes) : {};
    },

    toggleLike(threadId) {
        const likes = this.getLikes();
        likes[threadId] = !likes[threadId];
        localStorage.setItem('likes', JSON.stringify(likes));
        return likes[threadId];
    },

    isLiked(threadId) {
        const likes = this.getLikes();
        return !!likes[threadId];
    },

    // Language preference
    getLanguage() {
        return localStorage.getItem('language') || 'en';
    },

    setLanguage(lang) {
        localStorage.setItem('language', lang);
    },

    // Form submissions
    saveFormSubmission(formData) {
        const submissions = this.getFormSubmissions();
        submissions.push({
            ...formData,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('formSubmissions', JSON.stringify(submissions));
    },

    getFormSubmissions() {
        const submissions = localStorage.getItem('formSubmissions');
        return submissions ? JSON.parse(submissions) : [];
    }
};
