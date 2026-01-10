/**
 * GitHub API integration module
 * Fetches profile data, stats, repos, and activity from GitHub
 */

import { GITHUB_CONFIG } from './github-config.js';

const GITHUB_API = 'https://api.github.com';

/**
 * Fetch GitHub user profile
 */
export async function fetchGitHubProfile(username) {
    try {
        const response = await fetch(`${GITHUB_API}/users/${username}`);
        if (!response.ok) throw new Error('GitHub API error');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch GitHub profile:', error);
        return null;
    }
}

/**
 * Fetch user's public repositories
 */
export async function fetchRepos(username, options = {}) {
    const { sort = 'updated', perPage = 100 } = options;

    try {
        const response = await fetch(
            `${GITHUB_API}/users/${username}/repos?sort=${sort}&per_page=${perPage}`
        );
        if (!response.ok) throw new Error('GitHub API error');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch repos:', error);
        return [];
    }
}

/**
 * Fetch user's recent activity (events)
 */
export async function fetchRecentActivity(username, limit = 5) {
    try {
        const response = await fetch(`${GITHUB_API}/users/${username}/events/public?per_page=30`);
        if (!response.ok) throw new Error('GitHub API error');

        const events = await response.json();

        // Filter and format interesting events
        const interestingTypes = ['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent', 'WatchEvent'];
        const filtered = events
            .filter(e => interestingTypes.includes(e.type))
            .slice(0, limit);

        return filtered.map(formatEvent);
    } catch (error) {
        console.error('Failed to fetch activity:', error);
        return [];
    }
}

/**
 * Format GitHub event for display
 */
function formatEvent(event) {
    const repoName = event.repo?.name?.split('/')[1] || event.repo?.name || 'unknown';
    const timeAgo = getTimeAgo(new Date(event.created_at));

    switch (event.type) {
        case 'PushEvent':
            // Try commits array first, then size field, then fallback
            const commits = event.payload?.commits?.length ?? event.payload?.size ?? null;
            let pushText;
            if (commits === null || commits === 0) {
                pushText = `Pushed to ${repoName}`;
            } else {
                pushText = `Pushed ${commits} commit${commits !== 1 ? 's' : ''} to ${repoName}`;
            }
            return {
                icon: 'fa-code-commit',
                text: pushText,
                time: timeAgo,
                type: 'push'
            };
        case 'CreateEvent':
            const refType = event.payload?.ref_type || 'repository';
            return {
                icon: 'fa-plus',
                text: `Created ${refType}${refType !== 'repository' ? ` in ${repoName}` : ` ${repoName}`}`,
                time: timeAgo,
                type: 'create'
            };
        case 'PullRequestEvent':
            const prAction = event.payload?.action || 'updated';
            return {
                icon: 'fa-code-pull-request',
                text: `${prAction.charAt(0).toUpperCase() + prAction.slice(1)} PR in ${repoName}`,
                time: timeAgo,
                type: 'pr'
            };
        case 'IssuesEvent':
            const issueAction = event.payload?.action || 'updated';
            return {
                icon: 'fa-circle-dot',
                text: `${issueAction.charAt(0).toUpperCase() + issueAction.slice(1)} issue in ${repoName}`,
                time: timeAgo,
                type: 'issue'
            };
        case 'WatchEvent':
            return {
                icon: 'fa-star',
                text: `Starred ${repoName}`,
                time: timeAgo,
                type: 'star'
            };
        default:
            return {
                icon: 'fa-circle',
                text: `Activity in ${repoName}`,
                time: timeAgo,
                type: 'other'
            };
    }
}

/**
 * Get human-readable time ago string
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = [
        { label: 'y', seconds: 31536000 },
        { label: 'mo', seconds: 2592000 },
        { label: 'd', seconds: 86400 },
        { label: 'h', seconds: 3600 },
        { label: 'm', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count}${interval.label} ago`;
        }
    }

    return 'just now';
}

/**
 * Calculate total stars across all repos
 */
export function calculateTotalStars(repos) {
    return repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
}

/**
 * Fetch actual pinned repositories using GitHub GraphQL API
 */
export async function fetchPinnedRepos(username) {
    const query = `
        query {
            user(login: "${username}") {
                pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                        ... on Repository {
                            name
                            description
                            url
                            stargazerCount
                            forkCount
                            primaryLanguage {
                                name
                                color
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            // GraphQL requires auth, fall back to top starred repos
            console.warn('GraphQL API requires authentication, falling back to top repos');
            return null;
        }

        const data = await response.json();
        const pinnedItems = data?.data?.user?.pinnedItems?.nodes || [];

        return pinnedItems.map(repo => ({
            name: repo.name,
            description: repo.description || 'No description',
            stars: repo.stargazerCount,
            forks: repo.forkCount,
            language: repo.primaryLanguage?.name,
            url: repo.url
        }));
    } catch (error) {
        console.warn('Failed to fetch pinned repos via GraphQL:', error);
        return null;
    }
}

/**
 * Get pinned/featured repositories (fallback: top starred ones)
 */
export function getTopRepos(repos, limit = 4) {
    return repos
        .filter(repo => !repo.fork) // Exclude forks
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, limit)
        .map(repo => ({
            name: repo.name,
            description: repo.description || 'No description',
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            url: repo.html_url
        }));
}

/**
 * Fetch total contributions from external API
 */
export async function fetchTotalContributions(username) {
    try {
        const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        if (!response.ok) throw new Error('Contributions API error');
        const data = await response.json();

        // Sum total contributions
        const total = Object.values(data.total).reduce((a, b) => a + b, 0);
        return total;
    } catch (error) {
        console.error('Failed to fetch contributions:', error);
        return 0;
    }
}

/**
 * Load all GitHub data for a user
 */
export async function loadGitHubData(username) {
    const [profile, repos, contributions] = await Promise.all([
        fetchGitHubProfile(username),
        fetchRepos(username),
        fetchTotalContributions(username)
    ]);

    if (!profile) {
        return null;
    }

    const activity = await fetchRecentActivity(username);

    // Priority: 1. Config file, 2. GraphQL API, 3. Top starred repos
    let pinnedRepos = null;

    // First try config file (manually defined pinned repos)
    if (GITHUB_CONFIG.pinnedRepos && GITHUB_CONFIG.pinnedRepos.length > 0) {
        pinnedRepos = GITHUB_CONFIG.pinnedRepos;
    } else {
        // Then try GraphQL API (requires auth, likely to fail)
        pinnedRepos = await fetchPinnedRepos(username);
    }

    // Finally fallback to top starred repos
    if (!pinnedRepos || pinnedRepos.length === 0) {
        pinnedRepos = getTopRepos(repos);
    }

    const totalStars = calculateTotalStars(repos);

    return {
        profile,
        repos,
        pinnedRepos,
        activity,
        stats: {
            publicRepos: profile.public_repos,
            followers: profile.followers,
            following: profile.following,
            totalStars,
            totalContributions: contributions
        }
    };
}
