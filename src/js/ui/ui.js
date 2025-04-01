import state from '../core/state.js';
import { levels, stages } from '../core/levels.js';
import { getPairingKey } from '../utils/utils.js'; // Needed for updatePracticeUI calculation
import * as dom from './domElements.js';
import { QUESTIONS_PER_SESSION } from '../config/constants.js'; // Remove REQUIRED_CORRECT_FAST_ANSWERS

// Keep track of functions needed from main/gameLogic module
let initializeLevelFunc = null;
let generateProblemFunc = null;
let startNextLevelFunc = null;
let getNextLevelToPlayFunc = null; // Add this variable

// Setter functions for dependency injection
export function setInitializeLevel(func) {
    initializeLevelFunc = func;
}

export function setGenerateProblem(func) {
    generateProblemFunc = func;
}

export function setStartNextLevel(func) {
    startNextLevelFunc = func;
}

export function setGetNextLevelToPlay(func) { // Add setter
    console.log('setGetNextLevelToPlay called', func);
    getNextLevelToPlayFunc = func;
}

// --- UI Update Functions ---
export function updatePracticeUI() {
    const levelConfig = levels[state.currentLevelKey];
    if (!levelConfig) return;

    // Update title with level ID only (simplified)
    dom.practiceLevelTitleEl.textContent = `Nível ${state.currentLevelKey}`;
    
    // Update progress bar based on question number
    const questionNumber = state.sessionCurrentIndex + 1; // Current question number (1-based)
    const totalQuestions = state.sessionPairings.length; // Total questions in this session
    const progressPercentage = (questionNumber / totalQuestions) * 100;
    dom.progressBar.style.width = `${progressPercentage}%`;

    // Update problem display numbers
    if (state.currentQuestionPair) {
        dom.operand1El.textContent = state.currentQuestionPair.op1;
        dom.operand2El.textContent = state.currentQuestionPair.op2;
    } else {
        // Handle case where pair is not yet set (e.g., initial load)
        dom.operand1El.textContent = '?';
        dom.operand2El.textContent = '?';
    }
}

// NEW function to reset UI for a new problem
export function resetProblemUI() {
    dom.feedbackEl.textContent = '';
    dom.feedbackEl.className = 'feedback-message';
    dom.lastAnswerTimeEl.textContent = '';
    dom.lastAnswerTimeEl.className = 'time-feedback';
    dom.answerInput.value = '';
    dom.answerInput.disabled = false;
    dom.submitButton.disabled = false;
    dom.answerInput.focus(); // Focus input when resetting for new problem
}

// Function to generate star icons based on count
function getStarRating(stars) {
    if (stars === 4) return '👑'; // Crown for 4 stars
    let icons = '';
    for (let i = 0; i < stars; i++) icons += '★';
    for (let i = stars; i < 3; i++) icons += '☆'; // Show 3 stars max + crown
    return icons;
}

export function updateHomeScreen() {
    console.log('updateHomeScreen called');
    const stageContainer = dom.stageSelectionContainerEl; // Use the correct DOM element
    if (!stageContainer) {
        console.error("Stage selection container not found!");
        return;
    }
    stageContainer.innerHTML = ''; // Clear previous content

    // Determine the next level to play
    const nextLevelKey = getNextLevelToPlayFunc();
    const allMastered = nextLevelKey === 'A1' && (state.levelProgress['A1'] || 0) === 4;
    dom.startPracticeButton.textContent = allMastered ? "Começar de Novo?" : "Continuar Jornada";

    // Group levels by stage
    const levelsByStage = {};
    Object.keys(levels).forEach(key => {
        if (key === 'END') return;
        const level = levels[key];
        if (!level.stage) return;
        if (!levelsByStage[level.stage]) {
            levelsByStage[level.stage] = [];
        }
        levelsByStage[level.stage].push(key);
    });

    // Generate HTML for each stage accordion
    Object.keys(stages).forEach(stageKey => {
        const stageInfo = stages[stageKey];
        const stageLevels = levelsByStage[stageKey] || [];
        if (stageLevels.length === 0) return; // Don't show empty stages

        const stageElement = document.createElement('details');
        stageElement.className = 'stage-accordion';

        // Determine if this stage contains the next level to play
        const isNextStage = stageLevels.includes(nextLevelKey);
        if (isNextStage && !allMastered) {
             stageElement.open = true; // Open the accordion if it contains the next level
        }

        // Calculate stage progress
        let totalStarsPossible = stageLevels.length * 4; // Max 4 stars per level
        let totalStarsEarned = 0;
        stageLevels.forEach(levelKey => {
            totalStarsEarned += state.levelProgress[levelKey] || 0;
        });
        const stageProgressPercent = totalStarsPossible > 0 ? (totalStarsEarned / totalStarsPossible) * 100 : 0;

        // Create the summary (header) for the accordion
        const summary = document.createElement('summary');
        summary.className = 'stage-summary';
        summary.innerHTML = `
            <div class="stage-header-content">
                <div class="stage-title">
                    <h3>${stageInfo.name}</h3>
                    <p>${stageInfo.description}</p>
                </div>
                <div class="stage-progress">
                     <span class="progress-text">${stageProgressPercent.toFixed(0)}%</span>
                    <progress class="stage-progress-bar" value="${stageProgressPercent}" max="100"></progress>
                </div>
            </div>
        `;

        // Create the container for level cards within this stage
        const levelGrid = document.createElement('div');
        levelGrid.className = 'level-grid-inner';

        // Populate the level grid for the stage
        stageLevels.forEach(levelKey => {
            const levelConfig = levels[levelKey];
            const stars = state.levelProgress[levelKey] || 0;

            const card = document.createElement('div');
            card.className = 'level-card';
            if (levelKey === nextLevelKey && !allMastered) {
                card.classList.add('next-level');
            }

            const title = document.createElement('h4'); // Use h4 for level title inside stage
            title.textContent = `Nível ${levelKey}`; // Keep simplified title

            const shortDesc = document.createElement('p');
            shortDesc.className = 'level-short-desc';
            shortDesc.textContent = levelConfig.name; // Show the short name (+1, +2 etc)

            const starDisplay = document.createElement('div');
            starDisplay.className = 'star-rating';
            starDisplay.textContent = getStarRating(stars);

            const button = document.createElement('button');
            button.className = 'button-secondary small';
            button.textContent = 'Praticar';
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent details closing on button click
                if (initializeLevelFunc(levelKey)) {
                    showPracticeScreen();
                }
            });

            card.appendChild(title);
            card.appendChild(shortDesc);
            card.appendChild(starDisplay);
            card.appendChild(button);
            levelGrid.appendChild(card);
        });

        stageElement.appendChild(summary);
        stageElement.appendChild(levelGrid);
        stageContainer.appendChild(stageElement);
    });
}

// Shows feedback after answer checking
export function showFeedback(feedbackText, feedbackClass, timeText, timeClass) {
    dom.feedbackEl.textContent = feedbackText;
    dom.feedbackEl.className = `feedback-message ${feedbackClass}`.trim();
    dom.lastAnswerTimeEl.textContent = timeText;
    dom.lastAnswerTimeEl.className = `time-feedback ${timeClass}`.trim();
}

// Shows level up feedback (called via timeout usually)
export function showLevelUpFeedback() {
   // No longer needed as we have a dedicated screen
   // const levelConfig = levels[state.currentLevelKey];
   // if (!levelConfig) return;
   // dom.feedbackEl.textContent = `Nível ${levelConfig.name} Dominado! Subindo de nível... 🚀`;
   // dom.feedbackEl.className = 'feedback-message correct';
}

// --- Screen Navigation ---
function hideAllScreens() {
    dom.homeScreen.classList.remove('active');
    dom.practiceScreen.classList.remove('active');
    dom.levelCompleteScreen.classList.remove('active');
}

export function showHomeScreen() {
    hideAllScreens();
    dom.homeScreen.classList.add('active');
    updateHomeScreen(); // Update data when showing home
}

export function showPracticeScreen() {
    // Ensure the level is properly initialized before showing
    if (!levels[state.currentLevelKey] || state.currentLevelKey === 'END') {
        if (!initializeLevelFunc('A1')) return; // Start from A1 if END or invalid
    } else if (!state.sessionPairings || state.sessionPairings.length === 0) {
        // If returning to a level, ensure its data is loaded/re-initialized
        if (!initializeLevelFunc(state.currentLevelKey)) return;
    }

    hideAllScreens();
    
    // Reset progress bar
    dom.progressBar.style.width = '0%';
    
    // Show practice screen
    dom.practiceScreen.classList.add('active');
    generateProblemFunc(); // Start the practice session using the passed function
}

// NEW function for level complete screen
export function showLevelCompleteScreen(completedLevelKey, accuracy, avgTimeSec, newStars) {
    hideAllScreens();
    const levelConfig = levels[completedLevelKey];

    // Update level name
    if (levelConfig) {
        dom.completedLevelNameEl.textContent = `Nível ${completedLevelKey}`;
        // Reset the main message in case it was changed for the final level
        dom.levelCompleteMessageEl.innerHTML = `Parabéns! Você completou o <strong>Nível ${completedLevelKey}</strong>!`;
    } else {
        dom.completedLevelNameEl.textContent = `Nível ${completedLevelKey}`;
        dom.levelCompleteMessageEl.innerHTML = `Parabéns! Você completou o <strong>Nível ${completedLevelKey}</strong>!`;
    }

    // Update stats display
    dom.levelAccuracyStatEl.textContent = `${accuracy.toFixed(1)}%`;
    dom.levelAvgTimeStatEl.textContent = `${avgTimeSec.toFixed(2)}s`;

    // Display new stars message if applicable
    if (newStars > 0) {
        let starIcons = '';
        for(let i = 0; i < newStars; i++) starIcons += '★'; // Simple star icons
        for(let i = newStars; i < 4; i++) starIcons += '☆'; // Simple empty star icons
        if (newStars === 4) starIcons = '👑'; // Crown for 4 stars

        dom.levelNewStarsMessageEl.textContent = `Novo Recorde: ${starIcons} Desbloqueado!`;
        dom.levelNewStarsMessageEl.style.display = ''; // Make sure it's visible
    } else {
        dom.levelNewStarsMessageEl.textContent = ''; // Clear message if no new record
        dom.levelNewStarsMessageEl.style.display = 'none'; // Hide it
    }

    // Check if there is a next level
    const nextLevelKey = levels[completedLevelKey]?.next;
    const hasNextLevel = nextLevelKey && levels[nextLevelKey] && nextLevelKey !== 'END';

    // Update button text/visibility based on whether there's a next level
    if (hasNextLevel) {
        dom.continueNextLevelButton.textContent = "Próximo Nível";
        dom.continueNextLevelButton.style.display = ''; // Ensure visible
        dom.continueNextLevelButton.onclick = () => startNextLevelFunc(); // Call the passed function
    } else {
        // Last level completed
        dom.continueNextLevelButton.style.display = 'none'; // Hide continue button
        // Update the main message to indicate game completion
        dom.levelCompleteMessageEl.textContent = "Parabéns! Você completou todos os níveis!";
        dom.levelNewStarsMessageEl.style.display = 'none'; // Hide star message too
    }

    dom.levelCompleteScreen.classList.add('active');

    // Make sure the "Go Home" button works
    dom.goHomeButton.onclick = showHomeScreen;
}

// --- Keypad Input Handler ---
export function handleKeypadInput(value) {
    if (dom.answerInput.disabled) return; // Don't handle input if disabled

    const currentVal = dom.answerInput.value;
    switch (value) {
        case 'clear':
            dom.answerInput.value = '';
            break;
        case 'backspace':
            dom.answerInput.value = currentVal.slice(0, -1);
            break;
        default: // Number buttons
            // Optional: Add max length check if needed
            // if (currentVal.length < 3) { }
            dom.answerInput.value += value;
            break;
    }
     dom.answerInput.focus(); // Keep focus on the input
} 