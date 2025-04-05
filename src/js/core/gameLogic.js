// Import dependencies
import state, { saveState } from './state.js';
import { levels } from './levels.js';
import { getPairingKey, shuffleArray, triggerHapticFeedback } from '../utils/utils.js';
import {
    DEFAULT_TIME_THRESHOLD_MS,
    QUESTIONS_PER_SESSION,
    STAR_THRESHOLDS
} from '../config/constants.js';
import { playSound } from '../utils/audio.js';
import {
    updatePracticeUI,
    showFeedback,
    showHomeScreen,
    resetProblemUI,
    showLevelCompleteScreen,
    showPracticeScreen
} from '../ui/ui.js';
import * as dom from '../ui/domElements.js';

// Helper: Shuffle array ensuring no consecutive duplicates based on a key function
function shuffleWithNoConsecutiveDuplicates(array, getKey) {
    let shuffled = shuffleArray([...array]); // Use imported basic shuffle
    for (let i = 1; i < shuffled.length; i++) {
        if (getKey(shuffled[i]) === getKey(shuffled[i - 1])) {
            // Find the next element different from the previous one
            let swapIndex = -1;
            for (let j = i + 1; j < shuffled.length; j++) {
                if (getKey(shuffled[j]) !== getKey(shuffled[i - 1])) {
                    swapIndex = j;
                    break;
                }
            }
            // If no different element found later, search earlier
            if (swapIndex === -1) {
                for (let j = 0; j < i - 1; j++) {
                    if (getKey(shuffled[j]) !== getKey(shuffled[i - 1])) {
                         swapIndex = j;
                         break;
                    }
                }
            }
            // Perform the swap if a suitable index was found
            if (swapIndex !== -1) {
                [shuffled[i], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i]];
            } else {
                // This should be rare if the array has variety, but log if it happens
                console.warn("Could not find non-consecutive element to swap for index", i);
            }
        }
    }
    return shuffled;
}

// --- Core Logic Functions ---
export function initializeLevel(levelKey) {
    if (!levels[levelKey] || levelKey === 'END') {
        showHomeScreen();
        return false;
    }
    state.currentLevelKey = levelKey;
    const levelConfig = levels[state.currentLevelKey];

    // Generate unique pairs, duplicate, shuffle ensuring no immediate repeats
    const uniquePairings = levelConfig.generatePairings();
    if (!uniquePairings || uniquePairings.length === 0) {
        console.error("Level generator returned no pairings for key:", levelKey);
        showHomeScreen(); // Go home if level is broken
        return false;
    }
    let sessionPairingsRaw = uniquePairings.concat(uniquePairings); // Each pair appears twice

    // Shuffle with the non-consecutive constraint based on pairing key
    state.sessionPairings = shuffleWithNoConsecutiveDuplicates(sessionPairingsRaw, (pair) => getPairingKey(pair.op1, pair.op2))
                                .slice(0, QUESTIONS_PER_SESSION); // Ensure exactly 20 questions

    if (state.sessionPairings.length !== QUESTIONS_PER_SESSION) {
         console.warn(`Generated pairings length (${state.sessionPairings.length}) !== QUESTIONS_PER_SESSION (${QUESTIONS_PER_SESSION}) for level ${levelKey}. Adjusting...`);
         // Adjust if needed, though duplication and slice should handle it
         if (state.sessionPairings.length < QUESTIONS_PER_SESSION) {
             // Add more random pairs? For now, just proceed with fewer.
         }
         state.sessionPairings = state.sessionPairings.slice(0, QUESTIONS_PER_SESSION);
    }

    // Reset session state
    state.sessionCurrentIndex = 0;
    state.sessionQuestionsAnswered = 0;
    state.sessionCorrectAnswers = 0;
    state.sessionStartTime = performance.now(); // Record session start time

    console.log(`Starting level ${levelKey} with ${state.sessionPairings.length} questions.`);
    return true;
}

export function generateProblem() {
    resetProblemUI(); // Reset UI elements (feedback, input) first

    if (state.sessionCurrentIndex >= state.sessionPairings.length) {
         console.error("generateProblem called but session index is out of bounds.");
         // Should have been caught by session completion check in checkAnswer
         calculateAndShowResults(); // Try to finalize results anyway
         return;
    }

    state.currentQuestionPair = state.sessionPairings[state.sessionCurrentIndex];
    if (!state.currentQuestionPair) {
        console.error("Current question pair is undefined at index:", state.sessionCurrentIndex);
        calculateAndShowResults(); // Try to finalize
        return;
    }

    state.currentCorrectAnswer = state.currentQuestionPair.op1 + state.currentQuestionPair.op2;
    updatePracticeUI(); // Update level title, progress bar (maybe?), and operands
    state.questionStartTime = performance.now(); // Record question start time
}

export function checkAnswer() {
    const questionEndTime = performance.now();
    const userAnswer = parseInt(dom.answerInput.value, 10);

    dom.answerInput.disabled = true;
    dom.submitButton.disabled = true;

    const isCorrect = !isNaN(userAnswer) && userAnswer === state.currentCorrectAnswer;

    // Update session stats
    state.sessionQuestionsAnswered++;
    if (isCorrect) {
        state.sessionCorrectAnswers++;
        playSound('correct');
        triggerHapticFeedback('CORRECT'); // Haptic feedback for correct answer
        showFeedback("Correto!", 'correct', '', ''); 
    } else {
        playSound('wrong');
        triggerHapticFeedback('INCORRECT'); // Haptic feedback for incorrect answer
        showFeedback(`Incorreto. A resposta era ${state.currentCorrectAnswer}.`, 'incorrect', '', '');
    }

    // Check for session completion
    if (state.sessionQuestionsAnswered >= state.sessionPairings.length) {
        playSound('levelup'); 
        // Level complete haptic is handled in showLevelCompleteScreen
        calculateAndShowResults();
    } else {
        // Move to next question
        state.sessionCurrentIndex++;
        setTimeout(generateProblem, 1200); 
    }
}

function calculateAndSaveStars(levelKey, accuracy, avgTime) {
    let achievedStars = 0;
    for (const threshold of STAR_THRESHOLDS) {
        if (accuracy >= threshold.accuracy && avgTime <= threshold.avgTime) {
            achievedStars = threshold.stars;
            break; // Stop at the first (highest) tier met
        }
    }

    const currentStars = state.levelProgress[levelKey] || 0;
    if (achievedStars > currentStars) {
        console.log(`Level ${levelKey}: New record! ${achievedStars} stars (previously ${currentStars})`);
        state.levelProgress[levelKey] = achievedStars;
        saveState(); // Save the new progress
        return achievedStars; // Return the new star count
    } else {
        console.log(`Level ${levelKey}: Completed with ${achievedStars} stars (current record ${currentStars})`);
        return currentStars; // Return the current stars instead of -1
    }
}

function calculateAndShowResults() {
    const sessionEndTime = performance.now();
    const totalTimeMs = sessionEndTime - state.sessionStartTime;
    const totalQuestions = state.sessionQuestionsAnswered; // Should be == sessionPairings.length
    const accuracy = totalQuestions > 0 ? state.sessionCorrectAnswers / totalQuestions : 0;
    const avgTimeSec = totalQuestions > 0 ? (totalTimeMs / 1000) / totalQuestions : 0;

    console.log(`Session Complete: ${state.sessionCorrectAnswers}/${totalQuestions} correct. Avg time: ${avgTimeSec.toFixed(2)}s`);

    const newStars = calculateAndSaveStars(state.currentLevelKey, accuracy * 100, avgTimeSec);

    // Pass stats to the completion screen
    showLevelCompleteScreen(state.currentLevelKey, accuracy, avgTimeSec, newStars);
}

// NEW function to determine the next level to play
export function getNextLevelToPlay() {
    console.log('getNextLevelToPlay called');
    console.log('Current level progress:', state.levelProgress);
    
    for (const levelKey in levels) {
        if (levelKey === 'END') continue;
        const stars = state.levelProgress[levelKey] || 0;
        console.log(`Level ${levelKey}: ${stars} stars`);
        if (stars < 4) { // Assuming 4 stars (crown) is mastery
            console.log(`Returning level ${levelKey} as next to play`);
            return levelKey; // Return the first level not fully mastered
        }
    }
    console.log('All levels mastered, returning A1');
    return 'A1'; // If all are mastered, default to A1 for restart
}

// Function called by the 'Continue' button on the level complete screen
export function startNextLevel() {
    const currentLevelConfig = levels[state.currentLevelKey];
    const nextLevelKey = currentLevelConfig?.next;

    if (nextLevelKey && levels[nextLevelKey] && nextLevelKey !== 'END') {
        // Initialize the *next* level
        if (initializeLevel(nextLevelKey)) {
            showPracticeScreen();
        } else {
             console.error("Failed to initialize next level:", nextLevelKey);
             showHomeScreen();
        }
    } else {
        console.warn("startNextLevel called but no next level exists.");
        showHomeScreen();
    }
} 