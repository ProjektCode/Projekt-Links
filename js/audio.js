/**
 * LISTEN.moe Audio Controller
 * Handles audio playback and WebSocket connection for live song metadata
 */

document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('listen-moe-audio');
    const toggleBtn = document.getElementById('player-toggle');
    const icon = document.getElementById('player-icon');
    const songEl = document.getElementById('player-song');
    const artistEl = document.getElementById('player-artist');

    if (!audio || !toggleBtn) return;

    // Audio settings
    audio.volume = 0.003; // Very subtle volume

    let isPlaying = false;
    let ws = null;
    let heartbeatInterval = null;

    // Update UI
    function updateUI(playing) {
        isPlaying = playing;
        if (playing) {
            icon.className = 'fas fa-pause';
            toggleBtn.classList.add('playing');
            toggleBtn.title = 'Pause';
        } else {
            icon.className = 'fas fa-play';
            toggleBtn.classList.remove('playing');
            toggleBtn.title = 'Play';
        }
    }

    // Update song display
    function updateSongInfo(data) {
        if (!data || !data.song) return;

        const song = data.song;
        const title = song.title || 'Unknown Title';
        const artists = song.artists?.map(a => a.name).join(', ') || 'Unknown Artist';

        if (songEl) songEl.textContent = title;
        if (artistEl) artistEl.textContent = artists;
    }

    // WebSocket heartbeat
    function heartbeat(interval) {
        heartbeatInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: 9 }));
            }
        }, interval);
    }

    // Connect to LISTEN.moe WebSocket for song metadata
    function connectWebSocket() {
        ws = new WebSocket('wss://listen.moe/gateway_v2');

        ws.onopen = () => {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        };

        ws.onmessage = (message) => {
            if (!message.data.length) return;

            let response;
            try {
                response = JSON.parse(message.data);
            } catch (error) {
                return;
            }

            switch (response.op) {
                case 0: // Hello
                    ws.send(JSON.stringify({ op: 9 }));
                    heartbeat(response.d.heartbeat);
                    break;
                case 1: // Data update
                    if (response.t === 'TRACK_UPDATE' || response.t === 'TRACK_UPDATE_REQUEST') {
                        updateSongInfo(response.d);
                    }
                    break;
            }
        };

        ws.onclose = () => {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
            if (ws) {
                ws = null;
            }
            // Reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = () => {
            ws.close();
        };
    }

    // Toggle playback
    toggleBtn.addEventListener('click', async () => {
        try {
            if (audio.paused) {
                await audio.play();
                updateUI(true);
                localStorage.setItem('music-playing', 'true');
            } else {
                audio.pause();
                updateUI(false);
                localStorage.setItem('music-playing', 'false');
            }
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    });

    // Start WebSocket connection for metadata
    connectWebSocket();

    // Autoplay on page load (respects browser autoplay policies)
    // If user previously paused, respect that choice
    const userPaused = localStorage.getItem('music-playing') === 'false';

    if (!userPaused) {
        // Try to autoplay
        audio.play().then(() => {
            updateUI(true);
            localStorage.setItem('music-playing', 'true');
        }).catch(() => {
            // Autoplay blocked by browser, stay paused
            updateUI(false);
        });
    }
});
