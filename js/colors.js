/**
 * Color extraction and palette generation module
 * Extracts dominant colors from images and generates harmonious color palettes
 */

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Generate color palette using color theory from a single dominant color
 * Uses ANALOGOUS colors (nearby on color wheel) to avoid clashing
 */
export function generateColorPalette(dominantColor) {
    const hsl = rgbToHsl(dominantColor.r, dominantColor.g, dominantColor.b);

    // Primary: Use the dominant color but ensure good saturation and brightness
    const primary = hslToRgb(
        hsl.h,
        Math.min(Math.max(hsl.s, 40), 70),
        Math.min(Math.max(hsl.l, 35), 55)
    );

    // Secondary: Analogous color (-30° hue shift - warmer direction)
    const secondary = hslToRgb(
        (hsl.h - 30 + 360) % 360,
        Math.min(Math.max(hsl.s, 35), 65),
        Math.min(Math.max(hsl.l, 30), 50)
    );

    // Accent: Analogous color (+40° hue shift - cooler direction)
    const accent = hslToRgb(
        (hsl.h + 40) % 360,
        Math.min(Math.max(hsl.s, 45), 75),
        Math.min(Math.max(hsl.l, 40), 60)
    );

    // Background: Darker, desaturated version of primary
    const background = hslToRgb(
        hsl.h,
        Math.min(hsl.s * 0.3, 20),
        15
    );

    // Background gradient end: Slightly shifted hue (stays in same color family)
    const backgroundAlt = hslToRgb(
        (hsl.h - 20 + 360) % 360,
        Math.min(hsl.s * 0.25, 15),
        10
    );

    return { primary, secondary, accent, background, backgroundAlt };
}

/**
 * Extract dominant color from an image using canvas
 */
export function extractDominantColor(img) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Sample at smaller size for performance
        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        try {
            ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
            const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
            const data = imageData.data;

            // Collect color samples, grouping by similar hues
            const colorBuckets = {};

            for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                if (a < 128) continue; // Skip transparent pixels

                const hsl = rgbToHsl(r, g, b);

                // Skip very dark or very light pixels
                if (hsl.l < 15 || hsl.l > 85) continue;
                // Skip very unsaturated pixels
                if (hsl.s < 20) continue;

                // Bucket by hue (30-degree buckets)
                const hueBucket = Math.floor(hsl.h / 30) * 30;
                const key = hueBucket;

                if (!colorBuckets[key]) {
                    colorBuckets[key] = { count: 0, r: 0, g: 0, b: 0 };
                }

                colorBuckets[key].count++;
                colorBuckets[key].r += r;
                colorBuckets[key].g += g;
                colorBuckets[key].b += b;
            }

            // Find the bucket with most pixels (dominant hue)
            let dominantBucket = null;
            let maxCount = 0;

            for (const key of Object.keys(colorBuckets)) {
                if (colorBuckets[key].count > maxCount) {
                    maxCount = colorBuckets[key].count;
                    dominantBucket = colorBuckets[key];
                }
            }

            if (dominantBucket && dominantBucket.count > 0) {
                resolve({
                    r: Math.round(dominantBucket.r / dominantBucket.count),
                    g: Math.round(dominantBucket.g / dominantBucket.count),
                    b: Math.round(dominantBucket.b / dominantBucket.count)
                });
            } else {
                // Fallback to default purple
                resolve({ r: 168, g: 85, b: 247 });
            }
        } catch (e) {
            console.warn('Could not extract colors:', e);
            resolve(null);
        }
    });
}

/**
 * Apply color palette to CSS variables
 */
export function applyColors(dominantColor) {
    if (!dominantColor) return;

    const palette = generateColorPalette(dominantColor);
    const root = document.documentElement;

    // Convert RGB to CSS
    const toCSS = (c) => `rgb(${c.r}, ${c.g}, ${c.b})`;
    const toGlow = (c) => `rgba(${c.r}, ${c.g}, ${c.b}, 0.4)`;

    // Apply to CSS variables
    root.style.setProperty('--primary', toCSS(palette.primary));
    root.style.setProperty('--primary-glow', toGlow(palette.primary));
    root.style.setProperty('--secondary', toCSS(palette.secondary));
    root.style.setProperty('--secondary-glow', toGlow(palette.secondary));
    root.style.setProperty('--accent', toCSS(palette.accent));
    root.style.setProperty('--accent-glow', toGlow(palette.accent));

    // Apply background gradient
    root.style.setProperty('--bg-gradient-start', toCSS(palette.background));
    root.style.setProperty('--bg-gradient-end', toCSS(palette.backgroundAlt));

    console.log('Applied color palette:', { dominantColor, palette });
}
