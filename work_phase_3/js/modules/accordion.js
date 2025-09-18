// Accordion module

export function initAccordion(accordionId = 'site-map-accordion') {
    const accordion = document.getElementById(accordionId);
    if (!accordion) {
        console.warn(`Accordion with ID "${accordionId}" not found`);
        return;
    }

    const accordionHeaders = accordion.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach((header) => {
        header.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAccordionItem(header);
        });

        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAccordionItem(header);
            }
        });
    });
}

function toggleAccordionItem(header) {
    const accordionItem = header.closest('.accordion-item');
    const content = accordionItem.querySelector('.accordion-content');
    const toggle = header.querySelector('.accordion-toggle');
    const isOpen = content.classList.contains('open');

    if (isOpen) {
        closeAccordionItem(accordionItem, content, toggle, header);
    } else {
        openAccordionItem(accordionItem, content, toggle, header);
    }
}

function openAccordionItem(item, content, toggle, header) {
    // Close other accordion items in the same parent accordion
    const parentAccordion = item.closest('.accordion');
    const siblingItems = parentAccordion.querySelectorAll('.accordion-item');
    
    siblingItems.forEach(otherItem => {
        if (otherItem !== item) {
            const otherContent = otherItem.querySelector('.accordion-content');
            const otherToggle = otherItem.querySelector('.accordion-toggle');
            const otherHeader = otherItem.querySelector('.accordion-header');
            closeAccordionItem(otherItem, otherContent, otherToggle, otherHeader);
        }
    });

    // Open current item
    item.classList.add('active');
    content.classList.add('open');
    toggle.textContent = '−';
    header.setAttribute('aria-expanded', 'true');
}

function closeAccordionItem(item, content, toggle, header) {
    item.classList.remove('active');
    content.classList.remove('open');
    toggle.textContent = '+';
    header.setAttribute('aria-expanded', 'false');
}
