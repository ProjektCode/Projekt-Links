# 🤖 AGENTS.md - Project Documentation for AI Agents

> **Purpose**: This document provides comprehensive project context for AI agents working on this codebase. It contains architectural details, file responsibilities, configuration options, and maintenance guidelines.

---

## 📋 Project Overview

**Project Name**: ProjektCode Links  
**Type**: Personal bio links page (similar to Linktree)  
**Live URL**: [links.projektcode.com](https://links.projektcode.com)  
**Hosting**: GitHub Pages  
**Tech Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+ modules), GSAP

### What This Project Does

A modern, feature-rich bio links page that:
1. Displays profile information with social links (GitHub, Behance, YouTube, Fiverr)
2. Shows real-time GitHub stats (repos, contributions, followers)
3. Displays pinned repositories and recent GitHub activity
4. Plays Japanese radio via LISTEN.moe integration
5. Features dynamic theming based on profile picture colors
6. Renders an animated galaxy/starfield background
7. Shows online status based on time of day and GitHub activity

---

## 🏗️ Architecture

### File Structure

```
Bio Links/
├── index.html              # Main HTML entry point
├── styles.css              # Complete styling (871+ lines)
├── AGENTS.md               # This file - AI agent documentation
├── README.md               # User-facing documentation
├── CNAME                   # Custom domain config
├── LICENSE                 # MIT License
├── .gitignore
│
├── images/
│   └── profilepic.png      # Profile avatar (favicon + theme source)
│
├── js/
│   ├── profile.js          # Main controller (ES6 module entry point)
│   ├── animations.js       # GSAP + typing effects
│   ├── colors.js           # Color extraction from images
│   ├── github.js           # GitHub REST/GraphQL API integration
│   ├── github-config.js    # Auto-generated pinned repos (DO NOT EDIT)
│   ├── audio.js            # LISTEN.moe player + WebSocket
│   ├── stats.js            # View counter (CounterAPI)
│   ├── status.js           # Time-based online status
│   └── galaxy.js           # Canvas starfield background
│
└── .github/workflows/
    └── update-pinned-repos.yml  # Daily pinned repo sync
```

---

## 📁 File Responsibilities

### Core Files

| File | Purpose | Module Type |
|------|---------|-------------|
| `index.html` | Page structure, meta tags, external resources | N/A |
| `styles.css` | All CSS including variables, components, responsive design, animations | N/A |

### JavaScript Modules

| File | Purpose | Exports | Dependencies |
|------|---------|---------|--------------|
| `profile.js` | **Main entry point** - Orchestrates everything | None (self-initializing) | `colors.js`, `animations.js`, `github.js` |
| `colors.js` | Extracts colors from images, generates palettes | `extractDominantColor`, `applyColors`, `rgbToHsl`, `hslToRgb`, `generateColorPalette` | None |
| `animations.js` | Typing effect, GSAP animations, ripple effects | `startTypingLoop`, `animateLinks`, `addRippleEffect`, `initEntranceAnimations`, `initHoverEffects` | GSAP (CDN) |
| `github.js` | GitHub API calls with caching | `loadGitHubData` | `github-config.js` |
| `github-config.js` | Static pinned repos data | `GITHUB_CONFIG` | **AUTO-GENERATED** |
| `audio.js` | LISTEN.moe streaming + WebSocket | None (self-initializing) | None |
| `stats.js` | View counter via CounterAPI | None (self-initializing) | None |
| `status.js` | Online status logic | None (self-initializing) | None |
| `galaxy.js` | Animated canvas background | None (self-initializing) | None |

---

## ⚙️ Configurable Values

### `js/status.js` - Online Status
```javascript
const ONLINE_START = 9;        // 9 AM LA time - start of "online" hours
const ONLINE_END = 23;         // 11 PM LA time - end of "online" hours
const ACTIVITY_THRESHOLD = 30; // Minutes - show online if GitHub commit within this time (off-hours)
const GITHUB_USERNAME = 'projektcode';
```

### `js/profile.js` - Profile Configuration
```javascript
const CONFIG = {
    githubUsername: 'projektcode',
    typingSpeed: 50,         // ms per character typed
    deleteSpeed: 30,         // ms per character deleted
    defaultProfile: {
        name: 'ProjektCode',
        bio: 'A beginner programmer...',
        url: 'https://github.com/projektcode'
    }
};
```

### `js/audio.js` - Audio Settings
```javascript
audio.volume = 0.003;  // 0.3% volume (very subtle)
```

### `js/stats.js` - View Counter
```javascript
const namespace = 'projektcode-links';  // CounterAPI namespace
```

### `styles.css` - CSS Variables (Lines 7-52)
All colors, spacing, radii, and transitions are defined as CSS custom properties and can be modified. Note that the color variables are dynamically overwritten by `colors.js` based on the profile picture.

---

## 🔌 External APIs & Services

| Service | Purpose | Rate Limits | Caching |
|---------|---------|-------------|---------|
| GitHub REST API | Profile, repos, events | 60 req/hour (unauth) | 1 hour (localStorage) |
| GitHub GraphQL API | Pinned repos (via Actions) | Via PAT | Daily sync |
| github-contributions.now.sh | Total contributions | Unknown | 1 hour |
| LISTEN.moe WebSocket | Live song metadata | Unlimited | None |
| CounterAPI.com | Page view counter | Unknown | None |

---

## 🛠️ GitHub Actions

### `update-pinned-repos.yml`
- **Schedule**: Daily at 6 AM UTC
- **Triggers**: Manual, push to main
- **Secret Required**: `PINNED_REPOS` (GitHub PAT with `read:user` scope)
- **Output**: Regenerates `js/github-config.js`

⚠️ **Never manually edit `js/github-config.js`** - it will be overwritten by the workflow.

---

## 🎨 Key CSS Patterns

### Glassmorphism
```css
.card {
    background: var(--glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
}
```

### Bento Grid Layout
The `.links` container uses a 2-column grid. The `.repos-grid` also uses bento-style layout with `.repo-wide` for spanning full width.

### Z-Index Layer Hierarchy
```
z-index: -3  → Galaxy canvas (stars, nebula, shooting stars)
z-index: -2  → bg-gradient (animated glow blobs overlay)
z-index: -1  → noise-overlay (subtle grain texture)
z-index: auto → Main content (card, buttons, etc.)
```

### Hybrid Status Logic
The status indicator uses a hybrid approach:
1. **During online hours (9AM-11PM LA)**: Always shows "Online"
2. **Outside online hours**: Checks GitHub for recent activity
   - If commit within 30 minutes → Shows "Online - Coding late"
   - Otherwise → Shows "Away"
3. GitHub activity check is cached for 5 minutes to avoid rate limits

### Focus State Fix
Link buttons have a specific fix for focus persistence when opening new tabs:
```javascript
// In index.html
btn.addEventListener('click', function() {
    setTimeout(() => this.blur(), 100);
});
```

---

## 🐛 Known Issues & Solutions

### Issue: Button expands when clicked and returning to tab
**Cause**: Focus state with `transform: scale()` persists when opening new tabs with `target="_blank"`.
**Solution**: Added JavaScript blur after click and separated `:focus` from `:active` CSS states.

### Issue: GitHub API rate limiting on GitHub Pages
**Cause**: Public GitHub API allows only 60 requests/hour per IP. On GitHub Pages, all visitors share the same IP.
**Solution**: All API responses are cached in localStorage for 1 hour.

### Issue: Color extraction fails on some images
**Solution**: Falls back to default purple palette `{ r: 168, g: 85, b: 247 }`.

### Issue: Layout shifts on mobile during bio animation
**Cause**: Profile info container width changed as bio text animated.
**Solution**: Added `width: 100%` to `.profile-info`, `.bio`, and `.music-player` elements.

### Issue: Galaxy background not visible
**Cause**: `.bg-gradient` with `z-index: -2` was covering the galaxy canvas at `z-index: -3`.
**Solution**: Made the bg-gradient an overlay (transparent) instead of solid gradient.

### Issue: Music doesn't autoplay on first visit
**Cause**: Browser autoplay policies require user interaction before playing audio.
**Solution**: Music attempts to autoplay but gracefully falls back. User preference is saved to localStorage.

---

## 🧪 Testing Locally

```bash
# Using any static server
npx http-server . -p 8080 -c-1

# Then open http://localhost:8080
```

The `-c-1` flag disables caching for development.

---

## 📝 Maintenance Policy

> **IMPORTANT FOR AI AGENTS**

This `AGENTS.md` file should be updated when:

1. **New JavaScript files are added** - Add to file structure and responsibilities tables
2. **New external APIs are integrated** - Add to APIs table with rate limits
3. **Configuration options change** - Update the configurable values section
4. **New GitHub Actions workflows are added** - Document in the workflow section
5. **Major architectural changes** - Update the architecture section
6. **New CSS patterns or components** - Add to CSS patterns section
7. **Bugs are discovered and fixed** - Add to known issues section

### How to Update
When making significant changes:
1. Update this file with relevant sections
2. Ensure `README.md` is also kept in sync for user-facing changes
3. Add clear commit messages referencing the documentation update

---

## 📊 Quick Reference

| Need to... | Edit file |
|------------|-----------|
| Change online hours | `js/status.js` |
| Modify profile info | `js/profile.js` |
| Add new link button | `index.html` + `styles.css` |
| Change colors | `js/colors.js` or swap profile picture |
| Adjust animations | `js/animations.js` |
| Modify galaxy effect | `js/galaxy.js` |
| Update pinned repos | Push to main (auto-updates daily) |
| Add new GitHub feature | `js/github.js` |

---

*Last updated: 2026-01-12*
