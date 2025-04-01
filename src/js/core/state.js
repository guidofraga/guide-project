// import { levels } from './levels.js'; // No longer needed directly for loadState structure
// import { getPairingKey } from './utils.js'; // No longer needed here

// Encapsulated state
const state = {
    currentLevelKey: 'A1',      // The level the user is currently on or was last playing
    levelProgress: {},          // Stores highest stars achieved per level key, e.g., {'A1': 2, 'A2': 0}

    // Current session/practice state (volatile, reset on level start)
    sessionPairings: [],        // The list of 20 questions for the current session
    sessionCurrentIndex: 0,     // Index into sessionPairings
    sessionStartTime: 0,
    sessionQuestionsAnswered: 0,
    sessionCorrectAnswers: 0,

    // State needed during a single question (volatile)
    currentQuestionPair: null,  // The {op1, op2} object for the current question
    currentCorrectAnswer: 0,    // The correct answer for the current question
    questionStartTime: 0        // Start time for the individual question (was `startTime`)
};

// --- Local Storage ---
export function saveState() {
    localStorage.setItem('guiaMathCurrentLevelKey', state.currentLevelKey);
    localStorage.setItem('guiaLevelProgress', JSON.stringify(state.levelProgress));
    // We don't save volatile session state
    // Remove old items if they exist
    localStorage.removeItem('guiaCompletedLevels');
    // Potentially remove old mastery status items in a loop or leave them?
    // Let's leave them for now, they won't interfere.
}

export function loadState() {
    const savedLevelKey = localStorage.getItem('guiaMathCurrentLevelKey');
    const savedLevelProgress = localStorage.getItem('guiaLevelProgress');

    state.levelProgress = savedLevelProgress ? JSON.parse(savedLevelProgress) : {};

    // Restore current level key if valid, otherwise default to A1
    // We no longer need to pass initializeLevelFunc here, as level isn't started on load,
    // only the key is restored.
    if (savedLevelKey) { // Check if levels[savedLevelKey] is needed? Assume key is reliable for now.
         state.currentLevelKey = savedLevelKey;
    } else {
         state.currentLevelKey = 'A1'; // Default starting level
    }

    // Reset session state explicitly on load
    state.sessionPairings = [];
    state.sessionCurrentIndex = 0;
    state.sessionStartTime = 0;
    state.sessionQuestionsAnswered = 0;
    state.sessionCorrectAnswers = 0;
    state.currentQuestionPair = null;
    state.currentCorrectAnswer = 0;
    state.questionStartTime = 0;
}

// Export the state object directly
export default state; 