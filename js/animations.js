/**
 * UI animations module
 * Handles typing effects, link animations, ripple effects, and GSAP entrance animations
 */

// ============================================================================
// TYPING ANIMATION
// ============================================================================

/**
 * Typing animation with reverse (backspace) effect and persistent cursor
 */
export function startTypingLoop(element, text, options = {}) {
    const {
        typingSpeed = 50,
        deleteSpeed = 30,
        initialDelay = 2000,        // 2s delay before typing starts
        pauseBeforeDelete = 10000,   // 10s pause after typing, before deleting
        pauseAfterDelete = 5000     // 5s pause after deleting, before retyping
    } = options;

    // Clear existing content
    element.innerHTML = '';

    // Create container for text
    const textContainer = document.createElement('span');
    element.appendChild(textContainer);

    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    element.appendChild(cursor);

    let isDeleting = false;
    let charIndex = 0;

    function animate() {
        if (!isDeleting) {
            // Typing phase
            if (charIndex < text.length) {
                textContainer.textContent = text.substring(0, charIndex + 1);
                charIndex++;
                setTimeout(animate, typingSpeed);
            } else {
                // Finished typing, pause then start deleting
                isDeleting = true;
                setTimeout(animate, pauseBeforeDelete);
            }
        } else {
            // Deleting phase
            if (charIndex > 0) {
                charIndex--;
                textContainer.textContent = text.substring(0, charIndex);
                setTimeout(animate, deleteSpeed);
            } else {
                // Finished deleting, pause then start typing again
                isDeleting = false;
                setTimeout(animate, pauseAfterDelete);
            }
        }
    }

    // Start with initial delay
    setTimeout(animate, initialDelay);
}

// ============================================================================
// LINK ANIMATIONS
// ============================================================================

/**
 * Add staggered animation to link buttons on page load
 */
export function animateLinks() {
    const links = document.querySelectorAll('.link-btn');

    links.forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(20px)';
        link.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        setTimeout(() => {
            link.style.opacity = '1';
            link.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
}

/**
 * Add ripple effect to buttons on click
 */
export function addRippleEffect() {
    const buttons = document.querySelectorAll('.link-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.className = 'ripple';

            // Position the ripple
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            // Add ripple to button
            this.appendChild(ripple);

            // Remove ripple after animation
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    });
}

// ============================================================================
// GSAP ENTRANCE ANIMATIONS
// ============================================================================

/**
 * Initialize GSAP entrance animations
 * One-time animations that play when the page loads
 */
export function initEntranceAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, entrance animations disabled');
        return;
    }

    // Master timeline for sequenced animations
    const tl = gsap.timeline({
        defaults: {
            ease: 'power3.out',
            duration: 0.8
        }
    });

    // Initial states (hidden)
    gsap.set('.card', { opacity: 0, scale: 0.95, y: 30 });
    gsap.set('.avatar', { opacity: 0, scale: 0.5 });
    gsap.set('.profile-info', { opacity: 0, x: 30 });
    gsap.set('.stat-item', { opacity: 0, y: 20 });
    gsap.set('.link-btn', { opacity: 0, y: 25, scale: 0.95 });
    gsap.set('.github-section', { opacity: 0, y: 20 });

    // Animation sequence
    tl
        // Card entrance
        .to('.card', {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        })

        // Avatar pop-in with elastic bounce
        .to('.avatar', {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'elastic.out(1, 0.5)'
        }, '-=0.3')

        // Avatar glow pulse
        .to('.avatar', {
            boxShadow: '0 0 30px var(--primary-glow), 0 0 60px var(--primary-glow)',
            duration: 0.4,
            ease: 'power2.out'
        }, '-=0.3')
        .to('.avatar', {
            boxShadow: '0 0 0px transparent',
            duration: 0.6,
            ease: 'power2.inOut'
        })

        // Profile info slide in
        .to('.profile-info', {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.8')

        // Stats stagger in
        .to('.stat-item', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'back.out(1.5)'
        }, '-=0.4')

        // Links stagger up from bottom
        .to('.link-btn', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: {
                amount: 0.4,
                from: 'start'
            },
            ease: 'back.out(1.2)'
        }, '-=0.3')

        // GitHub sections fade in
        .to('.github-section', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.15,
            ease: 'power2.out'
        }, '-=0.3');
}

/**
 * Initialize GSAP hover micro-interactions
 */
export function initHoverEffects() {
    if (typeof gsap === 'undefined') return;

    // Link buttons hover
    document.querySelectorAll('.link-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.05,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1,
                duration: 0.3,
                ease: 'elastic.out(1, 0.5)'
            });
        });
        // Reset scale on click - fixes stuck hover state when opening new tabs
        btn.addEventListener('click', () => {
            gsap.to(btn, {
                scale: 1,
                duration: 0.15,
                ease: 'power2.out'
            });
        });
    });

    // Reset button scales when returning to page (fixes stuck hover state after back navigation)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            document.querySelectorAll('.link-btn').forEach(btn => {
                gsap.set(btn, { scale: 1 });
            });
        }
    });

    // Avatar hover
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.addEventListener('mouseenter', () => {
            gsap.to(avatar, {
                scale: 1.08,
                boxShadow: '0 0 25px var(--primary-glow)',
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        avatar.addEventListener('mouseleave', () => {
            gsap.to(avatar, {
                scale: 1,
                boxShadow: '0 0 0px transparent',
                duration: 0.4,
                ease: 'power2.inOut'
            });
        });
    }

    // Stats hover
    document.querySelectorAll('.stat-item').forEach(stat => {
        stat.addEventListener('mouseenter', () => {
            gsap.to(stat, {
                y: -3,
                scale: 1.05,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        stat.addEventListener('mouseleave', () => {
            gsap.to(stat, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}
