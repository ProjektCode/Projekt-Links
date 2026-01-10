/**
 * UI animations module
 * Handles typing effects, link animations, and ripple effects
 */

/**
 * Typing animation with reverse (backspace) effect and persistent cursor
 */
export function startTypingLoop(element, text, options = {}) {
    const {
        typingSpeed = 50,
        deleteSpeed = 30,
        pauseBeforeDelete = 3000,
        pauseAfterDelete = 500
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

    animate();
}

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
