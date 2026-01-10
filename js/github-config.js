/**
 * GitHub Configuration
 * 
 * Since GitHub's REST API doesn't expose pinned repos and GraphQL requires authentication,
 * you can manually configure your pinned repositories here.
 * 
 * To find your pinned repos, go to your GitHub profile and look at the "Pinned" section.
 */

export const GITHUB_CONFIG = {
    username: 'projektcode',

    // Your actual pinned repositories (update these as needed)
    // Set to null to fall back to top-starred repos from API
    pinnedRepos: [
        {
            name: 'Lyuze-3.0',
            description: 'Discord bot using Discord.Net',
            url: 'https://github.com/ProjektCode/Lyuze-3.0',
            language: 'C#'
        },
        {
            name: 'byte86',
            description: 'School 2D Game Dev Project',
            url: 'https://github.com/ProjektCode/byte86',
            language: 'C#'
        }
    ]
};
