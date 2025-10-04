// Viewer module (accessible + keyboard support)
export function initViewer(gallerySelector, viewerSelector) {
    const gallery = document.querySelector(gallerySelector);
    const viewer = document.querySelector(viewerSelector);
    if (!gallery || !viewer) return;

    const viewerImg = viewer.querySelector('#viewer-img');
    const viewerCaption = viewer.querySelector('#viewer-caption');
    const closeBtn = viewer.querySelector('#close-viewer');

    let lastFocused = null;

    function openViewerFrom(imgEl) {
        if (!imgEl) return;
        lastFocused = document.activeElement;

        viewerImg.src = imgEl.src;
        viewerImg.alt = imgEl.alt || '';
        viewerCaption.textContent = imgEl.alt || '';

        viewer.classList.add('open');
        viewer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');

        // Move focus to close button for accessibility
        closeBtn.focus();

        // ESC to close
        document.addEventListener('keydown', onKeydown);
    }

    function closeViewer() {
        viewer.classList.remove('open');
        viewer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        document.removeEventListener('keydown', onKeydown);

        // Restore focus
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    function onKeydown(e) {
        if (e.key === 'Escape') closeViewer();
        // Optional: trap focus within viewer
        if (e.key === 'Tab') {
            const focusables = viewer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (!focusables.length) return;

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        }
    }

    // Click: thumbnails
    gallery.addEventListener('click', (e) => {
        const img = e.target.closest('img');
        if (img) openViewerFrom(img);
    });

    // Keyboard: Enter/Space on thumbnails
    gallery.addEventListener('keydown', (e) => {
        const img = e.target.closest('img');
        if (!img) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openViewerFrom(img);
        }
    });

    // Close interactions
    closeBtn.addEventListener('click', closeViewer);
    viewer.addEventListener('click', (e) => {
        // Click empty area (not the image/caption/button) to close
        if (e.target === viewer) closeViewer();
    });
}
