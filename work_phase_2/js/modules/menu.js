// menu.js — progressive enhancement for the CSS hamburger nav
// Exports a setup function to wire up ARIA and basic interactions.

export function setupMenu() {
  try {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    const toggle = /** @type {HTMLInputElement|null} */ (document.getElementById('nav-toggle'));
    const toggleBtn = /** @type {HTMLElement|null} */ (nav.querySelector('label.nav-toggle-btn[for="nav-toggle"]'));
    const links = /** @type {HTMLElement|null} */ (nav.querySelector('.site-nav__links'));

    if (!toggle || !toggleBtn || !links) return;

    // Ensure links container has an ID for aria-controls
    if (!links.id) links.id = 'site-nav-links';
    toggleBtn.setAttribute('aria-controls', links.id);

    function setExpanded() {
      const expanded = !!toggle.checked;
      toggleBtn.setAttribute('aria-expanded', String(expanded));
    }

    // Sync on load and on change
    setExpanded();
    toggle.addEventListener('change', setExpanded);

    // Close on Escape (mobile states)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.checked) {
        toggle.checked = false;
        setExpanded();
      }
    });

    // Click outside to close (mobile)
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (toggle.checked && target instanceof Node && !nav.contains(target)) {
        toggle.checked = false;
        setExpanded();
      }
    });
  } catch (err) {
    // Fail silently — CSS handles core behavior
    // console.error('setupMenu error', err);
  }
}
