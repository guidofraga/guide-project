export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Creates a unique string key for a pairing (order independent)
export function getPairingKey(op1, op2) {
    return [op1, op2].sort((a, b) => a - b).join('+');
    // Or, if order matters (e.g., 1+2 is different from 2+1):
    // return `${op1}+${op2}`;
}

// --- Haptic Feedback Utility ---

// Vibration patterns
const HAPTIC_PATTERNS = {
    CORRECT: 50, // Short buzz for correct
    INCORRECT: [80, 40, 80], // Double buzz for incorrect
    LEVEL_COMPLETE: [100, 50, 100, 50, 100] // Longer pattern for level complete
};

/**
 * Triggers haptic feedback if supported by the browser.
 * @param {keyof HAPTIC_PATTERNS} patternName - The name of the vibration pattern to use.
 */
export function triggerHapticFeedback(patternName) {
    if (navigator.vibrate && window.navigator.vibrate) { // Check for support
        const pattern = HAPTIC_PATTERNS[patternName];
        if (pattern) {
            try {
                navigator.vibrate(pattern);
            } catch (error) {
                console.warn("Haptic feedback failed:", error);
            }
        } else {
            console.warn("Unknown haptic pattern name:", patternName);
        }
    } else {
        // console.log("Haptic feedback not supported on this browser.");
    }
}

// --- Throttling Utility ---

/**
 * Throttles a function to ensure it's called at most once within a specified time limit.
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The throttle time limit in milliseconds.
 * @returns {Function} - The throttled function.
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Function to generate a simple random string (for avatar seeds)
export function generateRandomSeed() {
    return Math.random().toString(36).substring(2, 15);
}

// Export all functions 