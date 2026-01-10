/**
 * Status Controller
 * Time-based online status using Los Angeles timezone
 */

document.addEventListener('DOMContentLoaded', () => {
    const statusDot = document.querySelector('.status-dot');
    const statusIndicator = document.querySelector('.status-indicator');

    if (!statusDot || !statusIndicator) return;

    // Online hours in LA time (24-hour format)
    const ONLINE_START = 9;  // 9 AM
    const ONLINE_END = 23;   // 11 PM

    function updateStatus() {
        // Get current time in Los Angeles
        const laTime = new Date().toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
            hour: 'numeric',
            hour12: false
        });
        const currentHour = parseInt(laTime, 10);

        // Check if within online hours
        const isOnline = currentHour >= ONLINE_START && currentHour < ONLINE_END;

        if (isOnline) {
            statusDot.style.background = '#22c55e';
            statusDot.style.boxShadow = '0 0 8px #22c55e, 0 0 16px #22c55e';
            statusIndicator.title = 'Online';
        } else {
            statusDot.style.background = '#6b7280';
            statusDot.style.boxShadow = '0 0 4px rgba(107, 114, 128, 0.5)';
            statusDot.style.animation = 'none';
            statusIndicator.title = 'Away';
        }
    }

    // Initial check
    updateStatus();

    // Check every minute
    setInterval(updateStatus, 60000);
});
