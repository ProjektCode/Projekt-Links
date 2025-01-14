// Updated GitHub username
const githubUsername = 'projektcode';

// Default values
const defaultImage = 'images/profilepic.png'; // Path to your default profile image
const defaultName = 'ProjektCode';
const defaultBio = 'A weeb programmer and graphic designer who makes things for fun. Learning IT and Docker.';
const defaultGitHubUrl = `https://github.com/${githubUsername}`;

// Function to update the profile with data or defaults
function updateProfile(image, name, bio, url) {
    document.getElementById('profile-pic').src = image;
    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-bio').textContent = bio;
    document.getElementById('profile-github').setAttribute('href', url);
}

// Fetch GitHub profile information
fetch(`https://api.github.com/users/${githubUsername}`)
    .then(response => response.json())
    .then(data => {
        // Update the profile with GitHub data if available
        const profileImage = data.avatar_url || defaultImage;
        const profileName = (data.name ? `${data.name} | ${data.login}` : defaultName);
        const profileBio = data.bio || defaultBio;
        const profileUrl = `https://github.com/${data.login}`;

        updateProfile(profileImage, profileName, profileBio, profileUrl);
    })
    .catch(error => {
        console.error('Error fetching GitHub profile:', error);
        // Update the profile with default values
        updateProfile(defaultImage, defaultName, defaultBio, defaultGitHubUrl);
    });
