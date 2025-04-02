// Import constants and DOM elements
import {
    DEFAULT_TIME_THRESHOLD_MS,
} from './config/constants.js';

import * as dom from './ui/domElements.js';

// Import utility functions
import { getPairingKey, triggerHapticFeedback, throttle } from './utils/utils.js';

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
    showExercisesScreen,
    handleKeypadInput,
    showFeedback,
    showLevelCompleteScreen,
    setupUIEventListeners
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

    // Throttle keypad input handler (e.g., allow one call every 100ms)
    const throttledKeypadHandler = throttle(handleKeypadInput, 100);

    // Keypad listener
    if (dom.keypadContainer) {
        dom.keypadContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('keypad-button')) {
                const value = e.target.dataset.value;
                // Use the throttled handler instead of the direct one
                throttledKeypadHandler(value); 
            }
        });
    }
    
    // Setup UI event listeners for new components
    setupUIEventListeners();

    // --- Initialisation ---
    loadState();
    showHomeScreen();

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(registration => {
                console.log('SW registered:', registration);
                
                // Check for service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('New service worker installing:', newWorker);
                    
                    // Listen for state changes on the new worker
                    newWorker.addEventListener('statechange', () => {
                        // If the new service worker is installed, refresh the page to activate it
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New content is available; refreshing page to activate...');
                            window.location.reload();
                        }
                    });
                });
            }).catch(error => {
                console.log('SW registration failed:', error);
            });
            
            // When the page loads, also check for updates by forcing a check
            setTimeout(() => {
                navigator.serviceWorker.getRegistration().then(registration => {
                    if (registration) {
                        registration.update();
                        console.log('Checking for service worker updates...');
                    }
                });
            }, 3000); // Check for updates 3 seconds after page load
        });
        
        // Listen for the controlling service worker changing and reload the page
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }
}

// Start the application after the DOM is ready
document.addEventListener('DOMContentLoaded', initApp);