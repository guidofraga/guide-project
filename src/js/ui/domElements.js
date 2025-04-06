export const homeScreen = document.getElementById('home-screen');
export const practiceScreen = document.getElementById('practice-screen');
export const exercisesScreen = document.getElementById('exercises-screen'); // New exercises screen
// Remove old home progress elements
// export const homeCurrentLevelEl = document.getElementById('home-current-level');
// export const homeNextLevelEl = document.getElementById('home-next-level');
// export const completedLevelsListEl = document.getElementById('completed-levels-list');
export const stageSelectionContainerEl = document.getElementById('stage-selection-container'); // Original (to be removed/replaced)
export const startPracticeButton = document.getElementById('start-practice-button');
export const backToHomeButton = document.getElementById('back-to-home-button');

// New UI Elements - Home screen
export const userNameEl = document.getElementById('user-name');
export const currentStreakEl = document.getElementById('current-streak');
export const profileButton = document.getElementById('profile-button');
export const headerProfileIcon = profileButton ? profileButton.querySelector('i') : null; // Icon inside link
export const headerProfileImage = document.createElement('img'); // Create an img element for avatar
if (profileButton && headerProfileIcon) {
    headerProfileImage.style.width = '30px'; // Adjust size as needed
    headerProfileImage.style.height = '30px';
    headerProfileImage.style.borderRadius = '50%';
    headerProfileImage.style.verticalAlign = 'middle'; // Align with text
    // profileButton.replaceChild(headerProfileImage, headerProfileIcon); // Replace icon with image initially
    // We will replace it dynamically in ui.js based on loaded state
}
export const lastLevelPlayedEl = document.getElementById('last-level-played');
export const overallProgressEl = document.getElementById('overall-progress');
export const progressPercentageEl = document.getElementById('progress-percentage');
export const additionCategoryEl = document.getElementById('addition-category');
export const subtractionCategoryEl = document.getElementById('subtraction-category');
export const additionProgressEl = document.getElementById('addition-progress');
export const subtractionProgressEl = document.getElementById('subtraction-progress');

// Navigation Elements
export const bottomNavItems = document.querySelectorAll('.nav-item');
export const allExercisesButton = document.getElementById('all-exercises-button');

// Exercises Screen Elements
export const tabButtons = document.querySelectorAll('.tab-button');
export const tabContents = document.querySelectorAll('.tab-content');
export const additionStagesContainer = document.getElementById('addition-stages-container');
export const subtractionStagesContainer = document.getElementById('subtraction-stages-container');

// Practice Screen Elements
export const practiceLevelTitleEl = document.getElementById('practice-level-title');
export const operand1El = document.getElementById('operand1');
export const operand2El = document.getElementById('operand2');
export const answerInput = document.getElementById('answer-input');
export const submitButton = document.getElementById('submit-button');
export const feedbackEl = document.getElementById('feedback');
export const progressBar = document.getElementById('progress-bar');
export const lastAnswerTimeEl = document.getElementById('last-answer-time');
export const keypadContainer = document.getElementById('keypad');

// Level Complete Screen Elements
export const levelCompleteScreen = document.getElementById('level-complete-screen');
export const completedLevelNameEl = document.getElementById('completed-level-name');
export const levelCompleteMessageEl = document.getElementById('level-complete-message');
export const levelAccuracyStatEl = document.getElementById('level-accuracy-stat');
export const levelAvgTimeStatEl = document.getElementById('level-avg-time-stat');
export const earnedStarsEl = document.getElementById('earned-stars');
export const levelNewStarsMessageEl = document.getElementById('level-new-stars-message');
export const continueNextLevelButton = document.getElementById('continue-next-level-button');
export const goHomeButton = document.getElementById('go-home-button');

// New Screen
export const profileScreen = document.getElementById('profile-screen');
export const continueButton = document.getElementById('continue-button');
export const returnHomeButton = document.getElementById('return-home-button');
export const shareButtons = document.querySelectorAll('.share-button');

// --- Profile Screen Elements (New) ---
export const backToHomeFromProfileButton = document.getElementById('back-to-home-from-profile');
export const profileAvatarPreview = document.getElementById('profile-avatar-preview');
export const randomizeAvatarButton = document.getElementById('randomize-avatar-button');
export const nicknameInput = document.getElementById('nickname-input');
export const saveProfileButton = document.getElementById('save-profile-button');