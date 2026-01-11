# 🔗 ProjektCode Links

A modern, dynamic bio links page with GitHub integration, live music streaming, and beautiful animations.

**🌐 Live Site:** [links.projektcode.com](https://links.projektcode.com)

![Preview](images/preview.webp)

## ✨ Features

- **Dynamic GitHub Integration** - Real-time stats, pinned repos, and recent activity
- **LISTEN.moe Music Player** - Live Japanese radio with WebSocket song metadata
- **Galaxy Background** - Animated stars and nebula clouds with dynamic theme colors
- **Color Extraction** - Theme colors dynamically extracted from profile picture
- **Hybrid Status Indicator** - Online during 9AM-11PM LA time, or when coding late (GitHub activity within 30 mins)
- **View Counter** - Tracks page visits via CounterAPI
- **Smooth Animations** - GSAP-powered entrance animations and typing effect

## 🛠️ Tech Stack

- **HTML5 / CSS3 / Vanilla JS** - No frameworks, fast and lightweight
- **GSAP** - Animation library
- **GitHub Actions** - Auto-updates pinned repos daily
- **APIs Used:**
  - GitHub REST & GraphQL API
  - LISTEN.moe WebSocket
  - CounterAPI
  - GitHub Contributions API

## 📁 Project Structure

```
Bio Links/
├── index.html              # Main page
├── styles.css              # All styles
├── images/
│   └── profilepic.png      # Avatar (also used as favicon)
├── js/
│   ├── profile.js          # Main controller
│   ├── animations.js       # GSAP + typing effects
│   ├── colors.js           # Color extraction
│   ├── github.js           # GitHub API
│   ├── github-config.js    # Pinned repos (auto-updated)
│   ├── audio.js            # LISTEN.moe player
│   ├── stats.js            # View counter
│   └── status.js           # Time-based status
└── .github/workflows/
    └── update-pinned-repos.yml  # Daily pinned repo sync
```

## ⚙️ Configuration

### GitHub Pinned Repos
Automatically updated daily via GitHub Actions. To trigger manually:
1. Go to **Actions** tab
2. Select **"Update Pinned Repos"**
3. Click **"Run workflow"**

Requires `PINNED_REPOS` secret (GitHub PAT with `read:user` scope).

### Status Hours
Edit `js/status.js` to change online hours or activity threshold:
```javascript
const ONLINE_START = 9;        // 9 AM LA time
const ONLINE_END = 23;         // 11 PM LA time
const ACTIVITY_THRESHOLD = 30; // Minutes - show online if commit within this time (off-hours)
```

### Music Volume
Edit `js/audio.js`:
```javascript
audio.volume = 0.003;  // 0.3% volume
```

## 🚀 Deployment

Hosted on GitHub Pages. Push to `main` branch to deploy.

## 📄 License

MIT License - Feel free to use this as inspiration for your own links page!

---

Made with ♥ by [ProjektCode](https://github.com/ProjektCode)
