// Import constants and DOM elements
import {
    DEFAULT_TIME_THRESHOLD_MS,
} from './config/constants.js';

import * as dom from './ui/domElements.js';

// Import utility functions
import { getPairingKey } from './utils/utils.js';

// Import level definitions
import { levels } from './core/levels.js';

// Import audio functions
import { playSound } from './utils/audio.js';

// Import state management
import state, { loadState } from './core/state.js';

// Import UI functions
import {
    setInitializeLevel,
    setGenerateProblem,
    setStartNextLevel,
    setGetNextLevelToPlay,
    updatePracticeUI,
    updateHomeScreen,
    showHomeScreen,
    showPracticeScreen,
    handleKeypadInput,
    showFeedback,
    showLevelUpFeedback
} from './ui/ui.js';

// Import core game logic
import {
    initializeLevel,
    generateProblem,
    checkAnswer,
    startNextLevel,
    getNextLevelToPlay
} from './core/gameLogic.js';

function initApp() {
    // Pass core logic functions to UI module
    setInitializeLevel(initializeLevel);
    setGenerateProblem(generateProblem);
    setStartNextLevel(startNextLevel);
    setGetNextLevelToPlay(getNextLevelToPlay);

    // --- Event Listeners ---
    dom.startPracticeButton.addEventListener('click', () => {
        console.log('Start Practice button clicked');
        console.log('Current state:', JSON.stringify(state));
        const levelToStart = getNextLevelToPlay();
        console.log('Level to start:', levelToStart);
        if (initializeLevel(levelToStart)) {
             console.log('Level initialized successfully');
             showPracticeScreen();
        } else {
             console.error('Failed to initialize level', levelToStart);
        }
    });
    dom.backToHomeButton.addEventListener('click', showHomeScreen);

    dom.submitButton.addEventListener('click', checkAnswer);
    dom.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !dom.submitButton.disabled) {
            checkAnswer();
        }
    });

    // Keypad listener
    if (dom.keypadContainer) {
        dom.keypadContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('keypad-button')) {
                const value = e.target.dataset.value;
                handleKeypadInput(value);
            }
        });
    }

    // --- Initialisation ---
    loadState();
    showHomeScreen();

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(registration => {
                console.log('SW registered:', registration);
            }).catch(error => {
                console.log('SW registration failed:', error);
            });
        });
    }
}

// Start the application after the DOM is ready
document.addEventListener('DOMContentLoaded', initApp);