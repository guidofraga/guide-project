import state from '../core/state.js';
import { levels, stages } from '../core/levels.js';
import { saveState } from '../core/state.js';
import { getPairingKey, triggerHapticFeedback, generateRandomSeed } from '../utils/utils.js'; // Needed for updatePracticeUI calculation and profile avatar
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

// --- Screen Management Functions ---
function hideAllScreens() {
    dom.homeScreen.classList.remove('active');
    dom.practiceScreen.classList.remove('active');
    dom.levelCompleteScreen.classList.remove('active');
    dom.exercisesScreen.classList.remove('active');
    dom.profileScreen.classList.remove('active'); // Hide profile screen
}

export function showHomeScreen(pushState = true) {
    hideAllScreens();
    dom.homeScreen.classList.add('active');
    updateHomeScreen();
    updateBottomNavActive('home');
    
    // Update sessionStorage and history state
    sessionStorage.setItem('currentScreen', 'home');
    
    if (pushState) {
        history.pushState({ screen: 'home' }, 'Home', '#home');
    }
}

export function showExercisesScreen(pushState = true) {
    hideAllScreens();
    dom.exercisesScreen.classList.add('active');
    updateExercisesScreen();
    updateBottomNavActive('exercises');
    
    // Update sessionStorage and history state
    sessionStorage.setItem('currentScreen', 'exercises');
    
    if (pushState) {
        history.pushState({ screen: 'exercises' }, 'Exercises', '#exercises');
    }
}

export function showProfileScreen(pushState = true) {
    hideAllScreens();
    dom.profileScreen.classList.add('active');
    updateProfileScreen();
    // Maybe no bottom nav active state here?
    
    // Update sessionStorage and history state
    sessionStorage.setItem('currentScreen', 'profile');
    
    if (pushState) {
        history.pushState({ screen: 'profile' }, 'Profile', '#profile');
    }
}

export function showPracticeScreen(pushState = true) {
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
    
    // Get the current level key for history state
    const currentLevelKey = getCurrentLevelKey();
    
    // Update sessionStorage and history state
    sessionStorage.setItem('currentScreen', 'practice');
    sessionStorage.setItem('currentLevelKey', currentLevelKey);
    
    if (pushState) {
        history.pushState(
            { screen: 'practice', levelKey: currentLevelKey }, 
            'Practice Level ' + currentLevelKey, 
            '#practice/' + currentLevelKey
        );
    }
    
    // Generate a new problem to start the practice session
    generateProblemFunc();
    
    // Make sure UI is updated with the problem
    updatePracticeUI();
    resetProblemUI();
}

// Function to update active state in bottom navbar
function updateBottomNavActive(activeSection) {
    dom.bottomNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${activeSection}`) {
            item.classList.add('active');
        }
    });
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

// Reset UI for a new problem
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
    let html = '';
    for (let i = 0; i < 3; i++) {
        if (i < stars && stars < 4) {
            html += '<i class="fas fa-star star earned"></i>';
        } else {
            html += '<i class="far fa-star star"></i>';
        }
    }
    
    // Add crown for max stars (4)
    if (stars === 4) {
        html = '<i class="fas fa-star star earned"></i>'.repeat(3) + 
               '<i class="fas fa-crown crown earned"></i>';
    }
    
    return html;
}

// Calculate progress percentages
function calculateProgress() {
    // Total progress calculation
    let totalLevels = 0;
    let totalCompletedStars = 0;
    let totalPossibleStars = 0;
    
    // Category-specific progress
    let additionLevels = 0;
    let additionStars = 0;
    let additionPossibleStars = 0;
    
    // Subtraction section is mostly placeholder for now
    let subtractionLevels = 0;
    let subtractionStars = 0;
    let subtractionPossibleStars = 0;
    
    // Loop through all levels to calculate metrics
    Object.keys(levels).forEach(key => {
        if (key === 'END') return;
        
        const level = levels[key];
        if (!level.stage) return;
        
        totalLevels++;
        totalPossibleStars += 4; // Max 4 stars possible per level
        totalCompletedStars += state.levelProgress[key] || 0;
        
        // For now, all are addition levels in stages A-C
        if (level.stage === 'A' || level.stage === 'B' || level.stage === 'C') {
            additionLevels++;
            additionPossibleStars += 4;
            additionStars += state.levelProgress[key] || 0;
        }
        
        // For the future - placeholder for subtraction
        if (level.stage === 'D') {
            subtractionLevels++;
            subtractionPossibleStars += 4;
            subtractionStars += state.levelProgress[key] || 0;
        }
    });
    
    // Calculate percentages
    const totalProgressPercent = totalPossibleStars > 0 ? 
        Math.round((totalCompletedStars / totalPossibleStars) * 100) : 0;
    
    const additionProgressPercent = additionPossibleStars > 0 ? 
        Math.round((additionStars / additionPossibleStars) * 100) : 0;
    
    const subtractionProgressPercent = subtractionPossibleStars > 0 ? 
        Math.round((subtractionStars / subtractionPossibleStars) * 100) : 0;
    
    return {
        total: totalProgressPercent,
        addition: additionProgressPercent,
        subtraction: subtractionProgressPercent
    };
}

// --- Avatar URL Generation ---
function getAvatarUrl(seed) {
    // Using DiceBear 'micah' style. Others: https://www.dicebear.com/styles/
    // We keep the background colors for visual variety.
    return `https://api.dicebear.com/8.x/micah/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
}

// --- Update Specific Screens ---

export function updateHomeScreen() {
    console.log('updateHomeScreen called');

    // Determine the next level to play
    const nextLevelKey = getNextLevelToPlayFunc ? getNextLevelToPlayFunc() : state.currentLevelKey || 'A1';

    // Update user info
    dom.userNameEl.textContent = state.userName || 'Estudante';
    dom.currentStreakEl.textContent = state.streak || 0; // Assuming streak is managed elsewhere or default 0
    updateHeaderAvatar(); // Update the header avatar

    // Update last level info & progress
    dom.lastLevelPlayedEl.textContent = state.currentLevelKey || nextLevelKey || 'A1';

    // Calculate progress percentages
    const progress = calculateProgress();
    dom.overallProgressEl.style.width = `${progress.total}%`;
    dom.progressPercentageEl.textContent = `${progress.total}% concluído`;

    // Update category progress
    dom.additionProgressEl.style.width = `${progress.addition}%`;
    dom.subtractionProgressEl.style.width = `${progress.subtraction}%`;
}

// Update the avatar in the home screen header
function updateHeaderAvatar() {
    if (dom.profileButton && dom.headerProfileIcon && dom.headerProfileImage) {
        dom.headerProfileImage.src = getAvatarUrl(state.avatarSeed);
        dom.headerProfileImage.alt = `Avatar for ${state.userName}`;
        // Replace the icon with the image if it hasn't been replaced yet
        if (dom.profileButton.contains(dom.headerProfileIcon)) {
            dom.profileButton.replaceChild(dom.headerProfileImage, dom.headerProfileIcon);
        }
    }
}

export function updateExercisesScreen() {
    // First load tab content
    updateAdditionExercisesTab();
    updateSubtractionExercisesTab();
}

function updateAdditionExercisesTab() {
    const container = dom.additionStagesContainer;
    if (!container) {
        console.error("Addition stages container not found!");
        return;
    }
    container.innerHTML = ''; // Clear previous content
    
    // Filter for addition stages (A, B, C)
    const additionStageKeys = Object.keys(stages).filter(key => 
        ['A', 'B', 'C'].includes(key));
    
    populateStagesAccordions(container, additionStageKeys);
}

function updateSubtractionExercisesTab() {
    const container = dom.subtractionStagesContainer;
    if (!container) {
        console.error("Subtraction stages container not found!");
        return;
    }
    container.innerHTML = ''; // Clear previous content
    
    // Filter for subtraction stage (D - placeholder for future)
    const subtractionStageKeys = Object.keys(stages).filter(key => 
        ['D'].includes(key));
    
    // If no subtraction stages yet, show a message
    if (subtractionStageKeys.length === 0) {
        const comingSoon = document.createElement('div');
        comingSoon.className = 'coming-soon-message';
        comingSoon.innerHTML = `
            <i class="fas fa-tools"></i>
            <h3>Em breve!</h3>
            <p>Estamos preparando novos exercícios de subtração.</p>
        `;
        container.appendChild(comingSoon);
        return;
    }
    
    populateStagesAccordions(container, subtractionStageKeys);
}

function populateStagesAccordions(container, stageKeys) {
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
    stageKeys.forEach(stageKey => {
        const stageInfo = stages[stageKey];
        const stageLevels = levelsByStage[stageKey] || [];
        if (stageLevels.length === 0) return; // Don't show empty stages

        const stageElement = document.createElement('details');
        stageElement.className = 'stage-accordion';

        // Determine if this stage contains the next level to play
        const nextLevelKey = getNextLevelToPlayFunc();
        const isNextStage = stageLevels.includes(nextLevelKey);
        if (isNextStage) {
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
            if (levelKey === nextLevelKey) {
                card.classList.add('next-level');
            }

            const title = document.createElement('h4'); // Use h4 for level title inside stage
            title.textContent = `Nível ${levelKey}`; // Keep simplified title

            const shortDesc = document.createElement('p');
            shortDesc.className = 'level-short-desc';
            shortDesc.textContent = levelConfig.name; // Show the short name (+1, +2 etc)

        const starDisplay = document.createElement('div');
        starDisplay.className = 'star-rating';
            starDisplay.innerHTML = getStarRating(stars);

        const button = document.createElement('button');
        button.className = 'button-secondary small';
            button.innerHTML = '<i class="fas fa-play"></i> Praticar';
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
        container.appendChild(stageElement);
    });
}

// Shows feedback after answer checking
export function showFeedback(feedbackText, feedbackClass, timeText, timeClass) {
    dom.feedbackEl.textContent = feedbackText;
    dom.feedbackEl.className = `feedback-message ${feedbackClass}`.trim();
    dom.lastAnswerTimeEl.textContent = timeText;
    dom.lastAnswerTimeEl.className = `time-feedback ${timeClass}`.trim();
}

// Shows level complete screen with results
export function showLevelCompleteScreen(results) {
    hideAllScreens();
    dom.levelCompleteScreen.classList.add('active');
    
    // Save current state for history
    const currentLevelKey = getCurrentLevelKey();
    
    // Update sessionStorage
    sessionStorage.setItem('currentScreen', 'levelComplete');
    sessionStorage.setItem('currentLevelKey', currentLevelKey);
    
    // Add to history
    history.pushState(
        { screen: 'levelComplete', levelKey: currentLevelKey, results }, 
        'Level Complete', 
        '#levelComplete/' + currentLevelKey
    );
    
    // Update the UI with level completion results
    updateLevelCompleteScreen(results);
}

// Setup tab functionality
export function setupTabNavigation() {
    dom.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            dom.tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            dom.tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Setup UI event listeners
export function setupUIEventListeners() {
    // Category cards
    if (dom.additionCategoryEl) {
        dom.additionCategoryEl.addEventListener('click', () => {
            showExercisesScreen();
            // Activate addition tab
            const additionTab = document.querySelector('.tab-button[data-tab="addition"]');
            if (additionTab) additionTab.click();
        });
    }
    
    if (dom.subtractionCategoryEl) {
        dom.subtractionCategoryEl.addEventListener('click', () => {
            showExercisesScreen();
            // Activate subtraction tab
            const subtractionTab = document.querySelector('.tab-button[data-tab="subtraction"]');
            if (subtractionTab) subtractionTab.click();
        });
    }
    
    // Bottom navbar navigation
    dom.bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetScreen = item.getAttribute('href').substring(1); // Remove '#'
            switch (targetScreen) {
                case 'home':
                    showHomeScreen();
                    break;
                case 'exercises':
                    showExercisesScreen();
                    break;
                // Add cases for stats and settings when they are implemented
                 case 'stats':
                    console.log('Stats screen clicked - Not implemented');
                    // showStatsScreen(); // To be implemented
                    break;
                 case 'settings':
                     console.log('Settings screen clicked - Not implemented');
                    // showSettingsScreen(); // To be implemented
                    break;
                default:
                    showHomeScreen(); // Fallback
            }
        });
    });
    
    // Navigation between screens
    if (dom.allExercisesButton) {
        dom.allExercisesButton.addEventListener('click', (e) => {
            e.preventDefault();
            showExercisesScreen();
        });
    }
    
    // Setup tab navigation
    setupTabNavigation();

    // --- New Profile Screen Listeners ---
    dom.profileButton?.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent hash change if it's an <a>
        showProfileScreen();
    });

    dom.backToHomeFromProfileButton?.addEventListener('click', showHomeScreen);

    dom.randomizeAvatarButton?.addEventListener('click', () => {
        state.avatarSeed = generateRandomSeed(); // Update state directly
        updateProfileScreen(); // Update the preview
        // No need to save state here, only on explicit save action
    });

    dom.saveProfileButton?.addEventListener('click', () => {
        const newNickname = dom.nicknameInput.value.trim();
        if (newNickname) {
            state.userName = newNickname;
        } else {
            // Optionally reset to default or keep old name if empty
            state.userName = 'Estudante'; // Reset to default if empty
            dom.nicknameInput.value = state.userName; // Update input field
        }
        // Avatar seed is already updated in state by the randomize button

        saveState(); // Save the updated nickname and avatar seed
        updateHomeScreen(); // Update home screen with new name/avatar
        showHomeScreen(); // Go back home after saving
        // Optionally show a success message/toast
    });
}

// Setup share functionality
function setupShareButtons(levelKey, stars) {
    const shareButtons = document.querySelectorAll('.share-button');
    if (!shareButtons.length) return;
    
    const shareText = `Acabei de completar o Nível ${levelKey} no Guide com ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}! 🎮✨`;
    const shareUrl = window.location.href;
    
    // WhatsApp
    shareButtons[0].onclick = () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    };
    
    // Facebook
    shareButtons[1].onclick = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
    };
    
    // Twitter
    shareButtons[2].onclick = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    };
}

// Handle keypad input
export function handleKeypadInput(value) {
    // Don't process input if the input is disabled
    if (dom.answerInput.disabled) return;

    // Handle different keypad button types
    if (value === 'backspace') {
        const currentValue = dom.answerInput.value;
        dom.answerInput.value = currentValue.slice(0, -1); // Remove last character
    } else if (value === 'clear') {
        dom.answerInput.value = ''; // Clear the input
    } else {
        // Only append digits if we have room (limit to 3 digits to prevent unreasonable answers)
        if (dom.answerInput.value.length < 3) {
            dom.answerInput.value += value;
        }
    }
}

// Function to update the Profile Screen UI with current state
function updateProfileScreen() {
    if (!dom.profileScreen.classList.contains('active')) return; // Only update if visible

    dom.nicknameInput.value = state.userName;
    dom.profileAvatarPreview.src = getAvatarUrl(state.avatarSeed);
    dom.profileAvatarPreview.alt = `Current avatar for ${state.userName}`;
}

// Initial UI Setup (called from main.js)
export function initializeUI() {
    updateHomeScreen(); // Initial update of home screen on load
    setupUIEventListeners();
}

// Helper function to get current level key from state
function getCurrentLevelKey() {
    // Import state from the correct module if not directly accessible
    return window.state && window.state.currentLevelKey ? 
           window.state.currentLevelKey : 
           (sessionStorage.getItem('currentLevelKey') || 'A1');
}

// Function to update the level complete screen with results
function updateLevelCompleteScreen(completedLevelKey, accuracy, avgTimeSec, newStars) {
    // Check if we received an object with all parameters or individual parameters
    if (typeof completedLevelKey === 'object') {
        const results = completedLevelKey;
        accuracy = results.accuracy;
        avgTimeSec = results.avgTimeSec;
        newStars = results.newStars;
        completedLevelKey = results.completedLevelKey;
    }
    
    // Trigger haptic feedback for level completion
    triggerHapticFeedback('LEVEL_COMPLETE');

    // Level details
    dom.completedLevelNameEl.textContent = completedLevelKey;
    dom.levelAccuracyStatEl.textContent = `${Math.round(accuracy * 100)}%`;
    dom.levelAvgTimeStatEl.textContent = `${avgTimeSec.toFixed(1)}s`;
    
    // Setup stars with animation delay
    dom.earnedStarsEl.innerHTML = getStarRating(newStars);
    
    // New stars message
    if (newStars > 0) {
        const previousStars = (state.levelProgress[completedLevelKey] || 0) - newStars;
        
        if (previousStars < newStars) {
            if (newStars === 4) {
                dom.levelNewStarsMessageEl.textContent = "Você conquistou a coroa! 👑";
            } else {
                dom.levelNewStarsMessageEl.textContent = `Você conquistou ${newStars} ${newStars === 1 ? 'estrela' : 'estrelas'}!`;
            }
        } else {
            dom.levelNewStarsMessageEl.textContent = "Bom trabalho!";
        }
    } else {
        dom.levelNewStarsMessageEl.textContent = "Continue praticando para ganhar estrelas!";
    }
    
    // Update next button logic and label
    const nextLevelKey = levels[completedLevelKey].next;
    
    if (nextLevelKey === 'END') {
        dom.continueNextLevelButton.innerHTML = '<i class="fas fa-redo"></i> Recomeçar';
        dom.continueNextLevelButton.onclick = () => {
            if (startNextLevelFunc('A1')) {
                showPracticeScreen();
            }
        };
    } else {
        dom.continueNextLevelButton.innerHTML = '<i class="fas fa-forward"></i> Próximo Nível';
        dom.continueNextLevelButton.onclick = () => {
            if (startNextLevelFunc(nextLevelKey)) {
                showPracticeScreen();
            }
        };
    }
    
    // Setup share buttons functionality
    setupShareButtons(completedLevelKey, newStars);
    
    // Reset the go home button handler
    dom.goHomeButton.onclick = showHomeScreen;
} 