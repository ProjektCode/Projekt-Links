/**
 * Dynamic Galaxy Background
 * Creates a starfield with twinkling stars and nebula effects
 * Colors adapt to the extracted theme from profile picture
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'galaxy-bg';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -3;
        pointer-events: none;
    `;
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    let nebulaClouds = [];

    // Get dynamic colors from CSS variables
    function getThemeColors() {
        const style = getComputedStyle(document.documentElement);
        return {
            primary: style.getPropertyValue('--primary').trim() || '#8b5cf6',
            secondary: style.getPropertyValue('--secondary').trim() || '#06b6d4',
            accent: style.getPropertyValue('--accent').trim() || '#f43f5e',
            bgStart: style.getPropertyValue('--bg-gradient-start').trim() || '#1a1025',
            bgEnd: style.getPropertyValue('--bg-gradient-end').trim() || '#0f0f1a'
        };
    }

    // Parse hex/rgb color to RGB values
    function parseColor(color) {
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16)
            };
        }
        const match = color.match(/\d+/g);
        if (match) {
            return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
        }
        return { r: 139, g: 92, b: 246 }; // Fallback purple
    }

    // Resize canvas
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initStars();
        initNebula();
    }

    // Initialize stars
    function initStars() {
        stars = [];
        const starCount = Math.floor((canvas.width * canvas.height) / 3000);

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
                colored: Math.random() < 0.15 // 15% of stars are colored
            });
        }
    }

    // Initialize nebula clouds
    function initNebula() {
        nebulaClouds = [];
        const colors = getThemeColors();
        const cloudColors = [colors.primary, colors.secondary, colors.accent];

        for (let i = 0; i < 5; i++) {
            nebulaClouds.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 300 + 150,
                color: cloudColors[i % cloudColors.length],
                opacity: Math.random() * 0.08 + 0.02,
                driftX: (Math.random() - 0.5) * 0.1,
                driftY: (Math.random() - 0.5) * 0.1
            });
        }
    }

    // Create shooting star
    function createShootingStar() {
        if (shootingStars.length < 2 && Math.random() < 0.002) {
            shootingStars.push({
                x: Math.random() * canvas.width,
                y: 0,
                length: Math.random() * 80 + 50,
                speed: Math.random() * 8 + 6,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
                opacity: 1
            });
        }
    }

    // Draw everything
    function draw() {
        const colors = getThemeColors();

        // Clear with gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, colors.bgStart);
        gradient.addColorStop(1, colors.bgEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw nebula clouds
        nebulaClouds.forEach(cloud => {
            const rgb = parseColor(cloud.color);
            const nebulaGradient = ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.radius
            );
            nebulaGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${cloud.opacity})`);
            nebulaGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = nebulaGradient;
            ctx.fillRect(cloud.x - cloud.radius, cloud.y - cloud.radius, cloud.radius * 2, cloud.radius * 2);

            // Drift the clouds slowly
            cloud.x += cloud.driftX;
            cloud.y += cloud.driftY;

            // Wrap around
            if (cloud.x < -cloud.radius) cloud.x = canvas.width + cloud.radius;
            if (cloud.x > canvas.width + cloud.radius) cloud.x = -cloud.radius;
            if (cloud.y < -cloud.radius) cloud.y = canvas.height + cloud.radius;
            if (cloud.y > canvas.height + cloud.radius) cloud.y = -cloud.radius;
        });

        // Draw stars
        stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
            const opacity = 0.3 + twinkle * 0.7;

            if (star.colored) {
                const rgb = parseColor(colors.primary);
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw shooting stars
        shootingStars.forEach((star, index) => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
                star.x - Math.cos(star.angle) * star.length,
                star.y - Math.sin(star.angle) * star.length
            );
            ctx.stroke();

            // Move shooting star
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            star.opacity -= 0.01;

            // Remove if off screen or faded
            if (star.opacity <= 0 || star.y > canvas.height || star.x > canvas.width) {
                shootingStars.splice(index, 1);
            }
        });

        createShootingStar();
        requestAnimationFrame(draw);
    }

    // Initialize
    window.addEventListener('resize', resize);
    resize();
    draw();

    // Re-initialize nebula when colors change (after profile pic loads)
    const observer = new MutationObserver(() => {
        initNebula();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
});
