// GitHub username for dynamic profile content
const githubUsername = 'projektcode';

// Default / fallback profile values
const defaultProfile = {
    image: 'images/profilepic.png',
    name: 'ProjektCode',
    bio: 'A weeb programmer and graphic designer who makes things for fun. Learning IT and Docker.',
    url: `https://github.com/${githubUsername}`
};

/**
 * Safely update the profile UI.
 * Accepts a single object so it's easy to extend later.
 */
function updateProfile({ image, name, bio, url }) {
    const imageEl = document.getElementById('profile-pic');
    const nameEl = document.getElementById('profile-name');
    const bioEl = document.getElementById('profile-bio');
    const githubLinkEl = document.getElementById('profile-github');

    if (!imageEl || !nameEl || !bioEl || !githubLinkEl) {
        console.warn('Profile elements not found in DOM; skipping profile update.');
        return;
    }

    imageEl.src = image;
    imageEl.alt = name || defaultProfile.name;
    nameEl.textContent = name;
    bioEl.textContent = bio;
    githubLinkEl.setAttribute('href', url);
}

/**
 * Fetch GitHub profile information and update the UI.
 * Uses async/await and handles non-OK responses gracefully.
 */
async function loadGitHubProfile() {
    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}`);

        if (!response.ok) {
            throw new Error(`GitHub API responded with status ${response.status}`);
        }

        const data = await response.json();

        const profile = {
            image: data.avatar_url || defaultProfile.image,
            name: data.name ? `${data.name} | ${data.login || githubUsername}` : defaultProfile.name,
            bio: data.bio || defaultProfile.bio,
            url: data.html_url || defaultProfile.url
        };

        updateProfile(profile);
    } catch (error) {
        console.error('Error fetching GitHub profile:', error);
        // Fall back to default profile values
        updateProfile(defaultProfile);
    }
}

// Kick off profile loading as soon as this script runs
loadGitHubProfile();
