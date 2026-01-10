/**
 * Profile module - Main entry point
 * Coordinates profile loading, color theming, and GitHub data display
 */

import { extractDominantColor, applyColors } from './colors.js';
import { startTypingLoop, animateLinks, addRippleEffect, initEntranceAnimations, initHoverEffects } from './animations.js';
import { loadGitHubData } from './github.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    githubUsername: 'projektcode',
    typingSpeed: 50,
    deleteSpeed: 30,
    defaultProfile: {
        name: 'ProjektCode',
        bio: 'A beginner programmer, and graphics designer who makes things for fun. Currently learning IT, HomeLab, and Docker.',
        url: 'https://github.com/projektcode'
    }
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
    profilePic: () => document.getElementById('profile-pic'),
    profileName: () => document.getElementById('profile-name'),
    profileBio: () => document.getElementById('profile-bio'),
    profileGithub: () => document.getElementById('profile-github'),
    statsContainer: () => document.getElementById('github-stats'),
    reposContainer: () => document.getElementById('pinned-repos'),
    activityContainer: () => document.getElementById('recent-activity')
};

// ============================================================================
// PROFILE UPDATES
// ============================================================================

/**
 * Safely update the profile UI
 */
function updateProfile({ image, name, bio, url }) {
    const nameEl = elements.profileName();
    const bioEl = elements.profileBio();
    const githubEl = elements.profileGithub();
    const picEl = elements.profilePic();

    if (nameEl && name) nameEl.textContent = name;
    if (githubEl && url) githubEl.href = url;

    // Start typing animation for bio
    if (bioEl && bio) {
        startTypingLoop(bioEl, bio, {
            typingSpeed: CONFIG.typingSpeed,
            deleteSpeed: CONFIG.deleteSpeed
        });
    }

    // Update profile picture and extract colors
    if (picEl && image) {
        picEl.crossOrigin = 'anonymous';
        picEl.onload = async () => {
            try {
                const dominantColor = await extractDominantColor(picEl);
                applyColors(dominantColor);
            } catch (e) {
                console.warn('Color extraction failed:', e);
            }
        };

        // Trigger onload if image already loaded
        if (picEl.complete) {
            picEl.onload();
        } else {
            picEl.src = image;
        }
    }
}

// ============================================================================
// GITHUB STATS DISPLAY
// ============================================================================

/**
 * Render GitHub stats (public repos count)
 */
function renderStats(stats) {
    const container = elements.statsContainer();
    if (!container || !stats) return;

    container.innerHTML = `
        <div class="stat-item">
            <i class="fas fa-folder"></i>
            <span class="stat-value">${stats.publicRepos}</span>
            <span class="stat-label">Repos</span>
        </div>
        <div class="stat-item">
            <i class="fas fa-chart-line"></i>
            <span class="stat-value">${stats.totalContributions}</span>
            <span class="stat-label">Contribs</span>
        </div>
        <div class="stat-item">
            <i class="fas fa-users"></i>
            <span class="stat-value">${stats.followers}</span>
            <span class="stat-label">Followers</span>
        </div>
    `;
}

/**
 * Render pinned/featured repositories
 * Sorts by name length (longest first) for optimal bento-box layout
 */
function renderPinnedRepos(repos) {
    const container = elements.reposContainer();
    if (!container || !repos?.length) return;

    // Sort by name length (longest first to get featured spot)
    const sortedRepos = [...repos].sort((a, b) => b.name.length - a.name.length);

    container.innerHTML = sortedRepos.map((repo, index) => {
        // Assign size class based on name length
        let sizeClass = '';
        if (repo.name.length > 16) {
            sizeClass = 'repo-wide'; // Full width for long names (16+ chars)
        } else if (repo.name.length > 12) {
            sizeClass = 'repo-medium';
        }

        return `
            <a href="${repo.url}" target="_blank" rel="noopener" class="repo-item ${sizeClass}">
                <i class="fas fa-book"></i>
                <span class="repo-name">${repo.name}</span>
            </a>
        `;
    }).join('');
}

/**
 * Render recent activity
 */
function renderActivity(activity) {
    const container = elements.activityContainer();
    if (!container || !activity?.length) return;

    container.innerHTML = activity.map(event => `
        <div class="activity-item">
            <i class="fas ${event.icon} activity-icon"></i>
            <span class="activity-text">${event.text}</span>
            <span class="activity-time">${event.time}</span>
        </div>
    `).join('');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function truncate(str, length) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

function getLanguageColor(language) {
    const colors = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        Java: '#b07219',
        'C#': '#178600',
        'C++': '#f34b7d',
        C: '#555555',
        Go: '#00ADD8',
        Rust: '#dea584',
        Ruby: '#701516',
        PHP: '#4F5D95',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Shell: '#89e051',
        Vue: '#41b883',
        React: '#61dafb'
    };
    return colors[language] || '#8b949e';
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
    // Start GSAP entrance animations
    initEntranceAnimations();
    initHoverEffects();

    // Start CSS animations
    animateLinks();
    addRippleEffect();

    // Apply default profile first
    updateProfile({
        image: elements.profilePic()?.src,
        name: CONFIG.defaultProfile.name,
        bio: CONFIG.defaultProfile.bio,
        url: CONFIG.defaultProfile.url
    });

    // Fetch GitHub data
    try {
        const data = await loadGitHubData(CONFIG.githubUsername);

        if (data) {
            // Update profile with GitHub data
            updateProfile({
                image: data.profile.avatar_url,
                name: data.profile.name || data.profile.login,
                bio: data.profile.bio || CONFIG.defaultProfile.bio,
                url: data.profile.html_url
            });

            // Render GitHub sections
            renderStats(data.stats);
            renderPinnedRepos(data.pinnedRepos);
            renderActivity(data.activity);
        }
    } catch (error) {
        console.error('Failed to load GitHub data:', error);
    }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
