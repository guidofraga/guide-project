// export const REQUIRED_CORRECT_FAST_ANSWERS = 3; // No longer used
export const DEFAULT_TIME_THRESHOLD_MS = 4000; // Still potentially useful? Or remove?
export const FASTER_TIME_THRESHOLD_MS = 3000;  // Still potentially useful? Or remove?

export const QUESTIONS_PER_SESSION = 20;

export const STAR_THRESHOLDS = [
    // Order from highest to lowest for easier checking
    { stars: 4, accuracy: 100, avgTime: 3.0 }, // Crown
    { stars: 3, accuracy: 90,  avgTime: 3.5 },
    { stars: 2, accuracy: 85,  avgTime: 4.0 },
    { stars: 1, accuracy: 80,  avgTime: 5.0 }
]; 