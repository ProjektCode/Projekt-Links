/**
 * Stats Module
 * Handles view counter using CountAPI
 */

document.addEventListener('DOMContentLoaded', async () => {
    const viewCountEl = document.getElementById('view-count');
    if (!viewCountEl) return;

    // CountAPI namespace and key (based on your site)
    const namespace = 'projektcode-links';
    const key = 'page-views';

    try {
        // Hit the counter and get current count
        const response = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`);
        const data = await response.json();

        if (data && data.value) {
            // Animate the count
            animateCount(viewCountEl, data.value);
        }
    } catch (error) {
        console.warn('View counter unavailable:', error);
        // Fallback to localStorage-based counter
        fallbackCounter(viewCountEl);
    }
});

/**
 * Animate count from 0 to target
 */
function animateCount(element, target) {
    const duration = 1500; // 1.5 seconds
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Fallback counter using localStorage
 */
function fallbackCounter(element) {
    let count = parseInt(localStorage.getItem('view-count') || '0', 10);
    count++;
    localStorage.setItem('view-count', count.toString());
    animateCount(element, count);
}
