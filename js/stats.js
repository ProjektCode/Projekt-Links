/**
 * View Counter using CounterAPI.com
 * Free, no registration required
 */

document.addEventListener('DOMContentLoaded', () => {
    const viewCountEl = document.getElementById('view-count');
    if (!viewCountEl) return;

    // CounterAPI.com endpoint
    // Format: https://counterapi.com/api/{namespace}/{action}/{key}
    const namespace = 'projektcode-links';
    const action = 'view';
    const key = 'page';
    const apiUrl = `https://counterapi.com/api/${namespace}/${action}/${key}`;

    // Fetch and increment view count
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && typeof data.value === 'number') {
                animateCount(viewCountEl, data.value);
            } else {
                viewCountEl.textContent = '--';
            }
        })
        .catch(error => {
            console.warn('View counter unavailable:', error);
            viewCountEl.textContent = '--';
        });
});

/**
 * Animate the count from 0 to target
 */
function animateCount(element, target) {
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }

    requestAnimationFrame(update);
}
