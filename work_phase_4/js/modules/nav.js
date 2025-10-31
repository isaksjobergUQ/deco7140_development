// Navigation helper module to set active nav items
export function setActiveNavItem() {
    // Get current file name from URL
    const currentPath = window.location.pathname;
    let currentFile = currentPath.split('/').pop() || 'index.html';
    
    // Handle case where pathname might be empty or just '/'
    if (!currentFile || currentFile === '' || currentFile === '/') {
        currentFile = 'index.html';
    }
    
    // Map file names to their parent section
    const pageMap = {
        'index.html': 'index.html',
        'tips.html': 'tips.html',
        'tip-detail.html': 'tips.html',
        'events.html': 'events.html',
        'event-detail.html': 'events.html',
        'community.html': 'community.html',
        'language.html': 'language.html',
        'contact.html': 'contact.html',
        'profile.html': 'profile.html',
        'implementation_rationale.html': null, // Don't highlight secondary pages
        'genai_mt_acknowledgement.html': null
    };
    
    const activePage = pageMap[currentFile] || null;
    
    if (!activePage) return; // Don't set active state for secondary pages
    
    // Update desktop nav
    const desktopNav = document.getElementById('nav-desktop');
    if (desktopNav) {
        const desktopLinks = desktopNav.querySelectorAll('.site-nav__links a');
        desktopLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === activePage) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }
    
    // Update mobile nav
    const mobileNav = document.getElementById('nav-mobile');
    if (mobileNav) {
        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === activePage) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }
}

