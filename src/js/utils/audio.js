let audioCtx = null; // Initialize lazily

// --- Audio Functions ---
function initAudioContext() {
    if (!audioCtx) {
        try {
            // Use the standard AudioContext or the webkit prefix for older Safari versions
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            // Optionally, provide feedback to the user that audio won't work
        }
    }
    return audioCtx;
}

export function playSound(type) {
    const ctx = initAudioContext();
    if (!ctx) return; // Exit if AudioContext is not available or failed to initialize

    // Prevent issues if the context is suspended (e.g., after page load before user interaction)
    if (ctx.state === 'suspended') {
        ctx.resume().catch(err => console.error("AudioContext resume failed:", err)); // Resume might fail
    }

    // Short delay to allow context to resume if needed
    setTimeout(() => {
        // Check context state again after attempting resume
        if (ctx.state !== 'running') {
            console.warn('AudioContext is not running, cannot play sound.');
            return;
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now); // Start silent

        switch (type) {
            case 'correct':
                oscillator.type = 'sine'; // A clean, pleasant tone
                oscillator.frequency.setValueAtTime(880, now); // A5 note frequency
                gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Quick fade in to volume 0.3
                gainNode.gain.linearRampToValueAtTime(0, now + 0.2);    // Quick fade out (total duration 0.2s)
                break;
            case 'correct_slow': // New sound for correct but slow
                oscillator.type = 'triangle'; // Softer tone
                oscillator.frequency.setValueAtTime(659.25, now); // E5 note (a bit lower than correct)
                gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05); // Fade in to volume 0.25
                gainNode.gain.linearRampToValueAtTime(0, now + 0.25);   // Slightly longer fade out
                break;
            case 'wrong':
                oscillator.type = 'square'; // A slightly harsher, buzzing tone
                oscillator.frequency.setValueAtTime(164.81, now); // E3 note (low)
                 // Optional: Add a slight pitch drop for a 'womp' sound
                oscillator.frequency.linearRampToValueAtTime(144, now + 0.15);
                gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05); // Fade in to volume 0.2
                gainNode.gain.linearRampToValueAtTime(0, now + 0.25);   // Slightly longer fade out (total duration 0.25s)
                break;
            case 'levelup':
                // Simple ascending arpeggio: C4 - E4 - G4 - C5
                const baseFreq = 261.63; // C4
                const times = [0, 0.1, 0.2, 0.3]; // Timing of notes starts relative to 'now'
                const freqs = [baseFreq, baseFreq * 5/4, baseFreq * 3/2, baseFreq * 2]; // Frequencies for major chord + octave

                oscillator.type = 'triangle'; // A softer tone than sine or square
                gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02); // Gentle start, volume 0.25
                times.forEach((time, index) => {
                    // Schedule frequency changes at specific times
                    oscillator.frequency.setValueAtTime(freqs[index], now + time);
                });
                // Fade out slightly after the last note starts
                gainNode.gain.linearRampToValueAtTime(0, now + times[times.length - 1] + 0.15);
                break;
            default:
                 console.warn('Unknown sound type:', type);
                 return; // Don't play if type is unknown
        }

        oscillator.start(now);
        // Schedule the oscillator to stop automatically after the sound should have finished playing
        // Use a reasonable max duration, e.g., 0.5 seconds
        oscillator.stop(now + 0.5);
    }, 50); // Small delay (50ms) to allow context resume
} 