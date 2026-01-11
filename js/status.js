/**
 * Hybrid Status Controller
 * Shows "online" during active hours (9AM-11PM LA time)
 * OR if there's recent GitHub activity (within 30 mins) during off-hours
 */

document.addEventListener('DOMContentLoaded', () => {
    const statusDot = document.querySelector('.status-dot');
    const statusIndicator = document.querySelector('.status-indicator');

    if (!statusDot || !statusIndicator) return;

    // Configuration
    const ONLINE_START = 9;        // 9 AM LA time
    const ONLINE_END = 23;         // 11 PM LA time
    const ACTIVITY_THRESHOLD = 30; // Minutes - show online if commit within this time (off-hours only)
    const CHECK_INTERVAL = 60000;  // Check every minute

    // GitHub username
    const GITHUB_USERNAME = 'projektcode';

    /**
     * Check if current LA time is within online hours
     */
    function isWithinOnlineHours() {
        const laTime = new Date().toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
            hour: 'numeric',
            hour12: false
        });
        const currentHour = parseInt(laTime, 10);
        return currentHour >= ONLINE_START && currentHour < ONLINE_END;
    }

    /**
     * Check GitHub for recent activity (used during off-hours)
     */
    async function hasRecentActivity() {
        try {
            // Check cache first to avoid rate limits
            const cached = localStorage.getItem('gh_recent_activity');
            if (cached) {
                const { hasActivity, timestamp } = JSON.parse(cached);
                // Use cached result for 5 minutes
                if (Date.now() - timestamp < 5 * 60 * 1000) {
                    return hasActivity;
                }
            }

            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=1`
            );

            if (!response.ok) {
                // If rate limited, assume no recent activity
                cacheResult(false);
                return false;
            }

            const events = await response.json();
            if (!events || events.length === 0) {
                cacheResult(false);
                return false;
            }

            // Check if the most recent event was within the threshold
            const lastEventTime = new Date(events[0].created_at);
            const minutesAgo = (Date.now() - lastEventTime.getTime()) / (1000 * 60);
            const hasActivity = minutesAgo <= ACTIVITY_THRESHOLD;

            cacheResult(hasActivity);
            return hasActivity;
        } catch (error) {
            console.warn('Failed to check GitHub activity:', error);
            return false;
        }
    }

    /**
     * Cache the activity result
     */
    function cacheResult(hasActivity) {
        localStorage.setItem('gh_recent_activity', JSON.stringify({
            hasActivity,
            timestamp: Date.now()
        }));
    }

    /**
     * Update the status indicator UI
     */
    function setStatus(isOnline, reason = '') {
        if (isOnline) {
            statusDot.style.background = '#22c55e';
            statusDot.style.boxShadow = '0 0 8px #22c55e, 0 0 16px #22c55e';
            statusDot.style.animation = 'statusPulse 2s ease-in-out infinite';
            statusIndicator.title = reason || 'Online';
        } else {
            statusDot.style.background = '#6b7280';
            statusDot.style.boxShadow = '0 0 4px rgba(107, 114, 128, 0.5)';
            statusDot.style.animation = 'none';
            statusIndicator.title = 'Away';
        }
    }

    /**
     * Main status check
     */
    async function updateStatus() {
        // Always online during active hours
        if (isWithinOnlineHours()) {
            setStatus(true, 'Online');
            return;
        }

        // Off-hours: check for recent GitHub activity
        const recentActivity = await hasRecentActivity();
        if (recentActivity) {
            setStatus(true, 'Online - Coding late');
        } else {
            setStatus(false);
        }
    }

    // Initial check
    updateStatus();

    // Check periodically
    setInterval(updateStatus, CHECK_INTERVAL);
});
