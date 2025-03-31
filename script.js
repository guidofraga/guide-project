document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const homeScreen = document.getElementById('home-screen');
    const practiceScreen = document.getElementById('practice-screen');
    const homeCurrentLevelEl = document.getElementById('home-current-level');
    const homeNextLevelEl = document.getElementById('home-next-level');
    const completedLevelsListEl = document.getElementById('completed-levels-list');
    const startPracticeButton = document.getElementById('start-practice-button');
    const backToHomeButton = document.getElementById('back-to-home-button');

    const practiceLevelTitleEl = document.getElementById('practice-level-title');
    const operand1El = document.getElementById('operand1');
    const operand2El = document.getElementById('operand2');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-button');
    const feedbackEl = document.getElementById('feedback');
    const masteredPairsCountEl = document.getElementById('mastered-pairs-count');
    const totalPairsCountEl = document.getElementById('total-pairs-count');
    const masteryInfoEl = document.getElementById('mastery-info');
    const requiredRepsEl = document.getElementById('required-reps');
    const progressBar = document.getElementById('progress-bar');
    const lastAnswerTimeEl = document.getElementById('last-answer-time');
    const keypadContainer = document.getElementById('keypad'); // Keypad container

    // --- Configuration ---
    const REQUIRED_CORRECT_FAST_ANSWERS = 3; // How many times each pair needs correct+fast answer
    const DEFAULT_TIME_THRESHOLD_MS = 4000; // Default time limit per question (4 seconds)
    const FASTER_TIME_THRESHOLD_MS = 3000; // Faster for simpler problems

    // --- State Variables ---
    let currentLevelKey = 'A1';
    let completedLevels = [];
    let currentProblemPair = null; // Holds the {op1, op2} object
    let correctAnswer = 0;
    let startTime = 0;
    let pairingMasteryStatus = {}; // Stores progress for the current level e.g., {'1+1': {count: 2}, '2+1': {count: 0}}
    let currentLevelPairings = []; // All required pairings for the current level
    let currentPairingIndex = 0; // To cycle through pairings
    let audioCtx = null; // Initialize lazily
    let correctStreak = 0; // Track consecutive correct answers

    // --- Level Definitions ---
    // Structure: key: { name, generatePairings(), timeThreshold, next }
    const levels = {
        'A1': {
            name: 'Adição +1',
            generatePairings: () => generateSpecificAddPairings(1, 1, 9),
            timeThreshold: FASTER_TIME_THRESHOLD_MS,
            next: 'A2'
        },
        'A2': {
            name: 'Adição +2',
            generatePairings: () => generateSpecificAddPairings(2, 1, 9),
            timeThreshold: FASTER_TIME_THRESHOLD_MS,
            next: 'A3'
        },
        'A3': {
            name: 'Adição +3',
            generatePairings: () => generateSpecificAddPairings(3, 1, 9),
            timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
            next: 'A4'
        },
        'A4': {
             name: 'Adição +4',
             generatePairings: () => generateSpecificAddPairings(4, 1, 9),
             timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
             next: 'A5'
        },
        'A5': {
             name: 'Adição +5',
             generatePairings: () => generateSpecificAddPairings(5, 1, 9),
             timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
             next: 'A6'
        },
         'A6': {
             name: 'Adição +6',
             generatePairings: () => generateSpecificAddPairings(6, 1, 9),
             timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
             next: 'A7'
        },
        'A7': {
             name: 'Adição +7',
             generatePairings: () => generateSpecificAddPairings(7, 1, 9),
             timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
             next: 'A8'
        },
        'A8': {
             name: 'Adição +8',
             generatePairings: () => generateSpecificAddPairings(8, 1, 9),
             timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
             next: 'A9'
        },
        'A9': {
             name: 'Adição +9',
             generatePairings: () => generateSpecificAddPairings(9, 1, 9),
             timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
             next: 'AMix1'
        },
        'AMix1': {
            name: 'Adição Misturada (1-9)',
            generatePairings: () => generateRandomRangePairings(1, 9, 1, 9, 30), // Generate 30 random pairs
            timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1000, // Slightly more time for mixed
            next: 'B1'
        },
        'B1': {
             name: 'Adição 10 + n',
             generatePairings: () => generateSpecificAddPairings(10, 1, 9),
             timeThreshold: FASTER_TIME_THRESHOLD_MS,
             next: 'B2'
        },
        // ... Add more levels following this structure ...
        // Make sure generatePairings() returns an array of objects: [{op1: x, op2: y}, ...]
        'END': { name: 'Fim do Jogo!', generatePairings: () => [], timeThreshold: 0, next: null} // Sentinel level
    };

    // --- Utility Functions ---
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Creates a unique string key for a pairing (order independent)
    function getPairingKey(op1, op2) {
        return [op1, op2].sort((a, b) => a - b).join('+');
        // Or, if order matters (e.g., 1+2 is different from 2+1):
        // return `${op1}+${op2}`;
    }

    // --- Generation Functions ---
    function generateSpecificAddPairings(fixedOperand, rangeMin, rangeMax) {
        const pairings = [];
        for (let i = rangeMin; i <= rangeMax; i++) {
            // Add both orders if you want them treated distinctly
            pairings.push({ op1: fixedOperand, op2: i });
            if (fixedOperand !== i) { // Avoid adding 1+1 twice etc.
                 pairings.push({ op1: i, op2: fixedOperand });
            }
        }
        return shuffleArray(pairings);
    }

     function generateRandomRangePairings(min1, max1, min2, max2, count) {
        const pairings = [];
        const seenKeys = new Set();
        while (pairings.length < count) {
            let op1 = getRandomInt(min1, max1);
            let op2 = getRandomInt(min2, max2);
            let key = getPairingKey(op1, op2); // Use order-independent key for variety
            if (!seenKeys.has(key)){
                 pairings.push({ op1, op2 });
                 seenKeys.add(key);
            }
             // Add a fallback to prevent infinite loops if count > possible unique pairs
             if (seenKeys.size >= (max1-min1+1)*(max2-min2+1)) break;
        }
        return shuffleArray(pairings);
    }
    // Add generator functions for other level types (carrying, tens, etc.) as needed

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

    function playSound(type) {
        const ctx = initAudioContext();
        if (!ctx) return; // Exit if AudioContext is not available or failed to initialize

        // Prevent issues if the context is suspended (e.g., after page load before user interaction)
        if (ctx.state === 'suspended') {
            ctx.resume();
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
        }

        oscillator.start(now);
        // Schedule the oscillator to stop automatically after the sound should have finished playing
        // Use a reasonable max duration, e.g., 0.5 seconds
        oscillator.stop(now + 0.5);
    }

    // --- Core Logic Functions ---
    function initializeLevel(levelKey) {
        if (!levels[levelKey] || levelKey === 'END') {
            displayFinalMessageOnHome();
            return false;
        }
        currentLevelKey = levelKey;
        const levelConfig = levels[currentLevelKey];

        currentLevelPairings = levelConfig.generatePairings();
        pairingMasteryStatus = {}; // Reset mastery status for the new level
        currentLevelPairings.forEach(pair => {
            const key = getPairingKey(pair.op1, pair.op2); // Or `${pair.op1}+${pair.op2}` if order matters
            pairingMasteryStatus[key] = { count: 0 };
        });
        currentPairingIndex = 0; // Start from the beginning of the shuffled list
        saveState();
        return true;
    }

    function findNextProblemPair() {
        if (!currentLevelPairings || currentLevelPairings.length === 0) return null;

        // Cycle through the pairings list to find one not yet mastered
        const startIndex = currentPairingIndex;
        do {
            const pair = currentLevelPairings[currentPairingIndex];
            const key = getPairingKey(pair.op1, pair.op2); // Or direct key

            if (pairingMasteryStatus[key]?.count < REQUIRED_CORRECT_FAST_ANSWERS) {
                return pair; // Found a pair that needs more correct answers
            }

            currentPairingIndex = (currentPairingIndex + 1) % currentLevelPairings.length;
        } while (currentPairingIndex !== startIndex); // Loop protection

        // If we loop back, all pairs are mastered
        return null;
    }


    function generateProblem() {
        currentProblemPair = findNextProblemPair();

        if (currentProblemPair === null) {
            // This should ideally be caught by checkLevelMastery, but as a fallback
            console.log("All pairs mastered for this level, attempting level up.");
            levelUp();
            return;
        }

        operand1El.textContent = currentProblemPair.op1;
        operand2El.textContent = currentProblemPair.op2;
        correctAnswer = currentProblemPair.op1 + currentProblemPair.op2;

        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback-message';
        lastAnswerTimeEl.textContent = '';
        lastAnswerTimeEl.className = 'time-feedback';
        answerInput.value = '';
        answerInput.disabled = false;
        submitButton.disabled = false;
        // answerInput.focus();

        updatePracticeUI(); // Update titles, stats etc.
        startTime = performance.now(); // Record start time
    }

    function checkAnswer() {
        const endTime = performance.now();
        const timeTaken = endTime - startTime;
        const userAnswer = parseInt(answerInput.value, 10);

        answerInput.disabled = true;
        submitButton.disabled = true;

        const levelConfig = levels[currentLevelKey];
        const timeThreshold = levelConfig.timeThreshold || DEFAULT_TIME_THRESHOLD_MS;
        const isCorrect = !isNaN(userAnswer) && userAnswer === correctAnswer;
        const isFastEnough = timeTaken <= timeThreshold;

        let feedbackText = '';
        let feedbackClass = 'feedback-message';
        let timeFeedbackText = `Tempo: ${(timeTaken / 1000).toFixed(1)}s`;
        let timeFeedbackClass = 'time-feedback';

        const currentPairKey = getPairingKey(currentProblemPair.op1, currentProblemPair.op2); // Or direct key

        // --- Feedback Logic ---
        if (isCorrect) {
            correctStreak++; // Increment streak

            if (isFastEnough) {
                feedbackText = 'Correto e Rápido! ✅';
                if (correctStreak >= 2) {
                    feedbackText += ` 🔥 ${correctStreak} seguidas!`;
                }
                feedbackClass += ' correct';
                pairingMasteryStatus[currentPairKey].count++;
                playSound('correct');
            } else {
                // Correct but slow - more encouraging message
                feedbackText = `Correto! Tente um pouco mais rápido da próxima vez. 👍`;
                if (correctStreak >= 2) {
                    feedbackText += ` (${correctStreak} corretas seguidas!)`; // Acknowledge streak differently
                }
                feedbackClass += ' correct slow'; // Use a specific class for slow correct
                timeFeedbackClass += ' slow';
                playSound('correct_slow');
                // Don't increment mastery count if too slow
            }
        } else {
             // Incorrect - choose a random encouraging message
            correctStreak = 0; // Reset streak
            const wrongMessages = [
                `Quase lá! A resposta correta é ${correctAnswer}.`,
                `Continue tentando! A resposta é ${correctAnswer}.`,
                `Sem problemas! Vamos tentar de novo. A resposta era ${correctAnswer}.`
            ];
            feedbackText = wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
            feedbackClass += ' incorrect';
            playSound('wrong');
            // Optionally show the correct answer visually (handled separately if needed)
            // Don't increment mastery count if incorrect
        }

        feedbackEl.textContent = feedbackText;
        feedbackEl.className = feedbackClass;
        lastAnswerTimeEl.textContent = timeFeedbackText;
        lastAnswerTimeEl.className = timeFeedbackClass;

        saveState(); // Save progress after each answer
        updatePracticeUI(); // Update stats based on new count

        if (checkLevelMastery()) {
             playSound('levelup'); // Play level up sound immediately
             setTimeout(() => {
                feedbackEl.textContent = `Nível ${levelConfig.name} Dominado! Subindo de nível... 🚀`;
                feedbackEl.className = 'feedback-message correct';
                levelUp();
             }, 1800);
        } else {
            // Move to the next pairing in the list for the next problem
             currentPairingIndex = (currentPairingIndex + 1) % currentLevelPairings.length;
             setTimeout(generateProblem, 1800); // Wait before showing next problem
        }
    }

    function checkLevelMastery() {
        if (!currentLevelPairings || currentLevelPairings.length === 0) return false;

        for (const pair of currentLevelPairings) {
            const key = getPairingKey(pair.op1, pair.op2); // Or direct key
            if (!pairingMasteryStatus[key] || pairingMasteryStatus[key].count < REQUIRED_CORRECT_FAST_ANSWERS) {
                return false; // Found a pair not yet fully mastered
            }
        }
        return true; // All pairs meet the required count
    }

    function levelUp() {
        if (!completedLevels.includes(currentLevelKey)) {
            completedLevels.push(currentLevelKey);
        }

        const nextLevelKey = levels[currentLevelKey]?.next;
        if (nextLevelKey && levels[nextLevelKey]) {
            if (initializeLevel(nextLevelKey)) {
                 setTimeout(generateProblem, 500); // Start the first problem of the new level quickly
            } else {
                 // Initialization failed (e.g., hit END) - message handled in initializeLevel
                 showHomeScreen();
            }
        } else {
            // No next level defined, or reached END
            currentLevelKey = 'END'; // Mark as finished
             saveState();
             showHomeScreen();
             displayFinalMessageOnHome();
        }
    }

    // --- UI Update Functions ---
    function updatePracticeUI() {
        const levelConfig = levels[currentLevelKey];
        if (!levelConfig) return;

        practiceLevelTitleEl.textContent = `Nível ${currentLevelKey}: ${levelConfig.name}`;
        // Remove references to deleted elements
        // requiredRepsEl.textContent = REQUIRED_CORRECT_FAST_ANSWERS;

        let masteredCount = 0;
        const totalPairs = currentLevelPairings.length;

        currentLevelPairings.forEach(pair => {
            const key = getPairingKey(pair.op1, pair.op2); // Or direct key
            if (pairingMasteryStatus[key]?.count >= REQUIRED_CORRECT_FAST_ANSWERS) {
                masteredCount++;
            }
        });

        // Remove references to deleted elements
        // masteredPairsCountEl.textContent = masteredCount;
        // totalPairsCountEl.textContent = totalPairs;

        const progressPercent = totalPairs === 0 ? 0 : (masteredCount / totalPairs) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // Remove reference to deleted element
        // masteryInfoEl.textContent = `Responda cada (${totalPairs}) combinação corretamente ${REQUIRED_CORRECT_FAST_ANSWERS} vezes e rápido!`;
    }

    function updateHomeScreen() {
         const levelConfig = levels[currentLevelKey];
         if (!levelConfig || currentLevelKey === 'END') {
             homeCurrentLevelEl.textContent = "Todos Completos!";
             homeNextLevelEl.textContent = "N/A";
             startPracticeButton.textContent = "Revisar?"; // Or hide button
             startPracticeButton.onclick = () => { // Reset to A1 if clicked
                 initializeLevel('A1');
                 showPracticeScreen();
             };
         } else {
             homeCurrentLevelEl.textContent = `${currentLevelKey} (${levelConfig.name})`;
             const nextKey = levelConfig.next;
             homeNextLevelEl.textContent = (nextKey && levels[nextKey]) ? levels[nextKey].name : "Último Nível";
             startPracticeButton.textContent = "Continuar Praticando!";
             startPracticeButton.onclick = showPracticeScreen; // Default action
         }


        // Populate completed levels list
        completedLevelsListEl.innerHTML = ''; // Clear existing list
        if (completedLevels.length === 0) {
            completedLevelsListEl.innerHTML = '<li>Nenhum ainda!</li>';
        } else {
            completedLevels.forEach(levelKey => {
                const li = document.createElement('li');
                li.textContent = `${levelKey}: ${levels[levelKey]?.name || 'Desconhecido'}`;
                completedLevelsListEl.appendChild(li);
            });
        }
    }

     function displayFinalMessageOnHome() {
         homeCurrentLevelEl.textContent = "Parabéns!";
         homeNextLevelEl.textContent = "Você completou tudo!";
         startPracticeButton.textContent = "Começar de Novo?";
         startPracticeButton.onclick = () => {
             completedLevels = []; // Reset completed list
             initializeLevel('A1');
             showPracticeScreen();
         };
     }


    // --- Screen Navigation ---
    function showHomeScreen() {
        homeScreen.classList.add('active');
        practiceScreen.classList.remove('active');
        updateHomeScreen(); // Update data when showing home
    }

    function showPracticeScreen() {
        // Ensure the level is properly initialized before showing
        if (!levels[currentLevelKey] || currentLevelKey === 'END') {
            if (!initializeLevel('A1')) return; // Start from A1 if END or invalid
        } else if (!currentLevelPairings || currentLevelPairings.length === 0) {
            // If returning to a level, ensure its data is loaded/re-initialized
            if (!initializeLevel(currentLevelKey)) return;
        }

        homeScreen.classList.remove('active');
        practiceScreen.classList.add('active');
        generateProblem(); // Start the practice session
    }

    // --- Local Storage ---
    function saveState() {
        localStorage.setItem('guiaMathLevelKey', currentLevelKey);
        localStorage.setItem('guiaCompletedLevels', JSON.stringify(completedLevels));
        // Save mastery status ONLY if not fully mastered, otherwise it's reset on level start
        if (!checkLevelMastery() && Object.keys(pairingMasteryStatus).length > 0) {
            localStorage.setItem(`guiaMasteryStatus_${currentLevelKey}`, JSON.stringify(pairingMasteryStatus));
        } else {
             // Clear saved status for the current level if it IS mastered or empty
             localStorage.removeItem(`guiaMasteryStatus_${currentLevelKey}`);
        }
         // Save the list of pairings for the current level to resume correctly
        localStorage.setItem(`guiaCurrentPairings_${currentLevelKey}`, JSON.stringify(currentLevelPairings));
        localStorage.setItem(`guiaCurrentPairingIndex_${currentLevelKey}`, currentPairingIndex);

    }

    function loadState() {
        const savedLevelKey = localStorage.getItem('guiaMathLevelKey');
        const savedCompleted = localStorage.getItem('guiaCompletedLevels');
        completedLevels = savedCompleted ? JSON.parse(savedCompleted) : [];

        if (savedLevelKey && levels[savedLevelKey]) {
            currentLevelKey = savedLevelKey;
            // Try to load the mastery status for this level
            const savedStatus = localStorage.getItem(`guiaMasteryStatus_${currentLevelKey}`);
            pairingMasteryStatus = savedStatus ? JSON.parse(savedStatus) : {};

             // Load the pairings list and index to resume correctly
            const savedPairings = localStorage.getItem(`guiaCurrentPairings_${currentLevelKey}`);
            currentLevelPairings = savedPairings ? JSON.parse(savedPairings) : [];
            const savedIndex = localStorage.getItem(`guiaCurrentPairingIndex_${currentLevelKey}`);
            currentPairingIndex = savedIndex ? parseInt(savedIndex, 10) : 0;


            // If status was loaded, verify it matches the pairings list structure
             // (Basic check: if pairings list exists but status is empty, re-init status)
             if(currentLevelPairings.length > 0 && Object.keys(pairingMasteryStatus).length === 0 && currentLevelKey !== 'END'){
                 console.log("Re-initializing mastery status for level", currentLevelKey);
                  currentLevelPairings.forEach(pair => {
                    const key = getPairingKey(pair.op1, pair.op2);
                    pairingMasteryStatus[key] = { count: 0 };
                });
             } else if (currentLevelPairings.length === 0 && currentLevelKey !== 'END') {
                 // If pairings list somehow got lost, re-initialize the whole level
                  initializeLevel(currentLevelKey);
             }


        } else {
            initializeLevel('A1'); // Start fresh if no valid saved state
        }
    }

    // --- Event Listeners ---
    startPracticeButton.addEventListener('click', showPracticeScreen); // Will be overridden if game ends
    backToHomeButton.addEventListener('click', showHomeScreen);

    submitButton.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitButton.disabled) {
            checkAnswer();
        }
    });

    // --- Keypad Event Listener ---
    if (keypadContainer) {
        keypadContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('keypad-button')) {
                const value = e.target.dataset.value;
                handleKeypadInput(value);
            }
        });
    }

    function handleKeypadInput(value) {
        if (answerInput.disabled) return; // Don't handle input if disabled

        const currentVal = answerInput.value;
        switch (value) {
            case 'clear':
                answerInput.value = '';
                break;
            case 'backspace':
                answerInput.value = currentVal.slice(0, -1);
                break;
            default: // Number buttons
                // Optional: Add max length check if needed
                // if (currentVal.length < 3) { }
                answerInput.value += value;
                break;
        }
         answerInput.focus(); // Keep focus on the input
    }

    // --- Initialisation ---
    loadState();
    showHomeScreen(); // Start on the home screen

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => { // Register after page load
        navigator.serviceWorker.register('/sw.js') // Path to your service worker file
            .then(registration => {
            console.log('Service Worker registered successfully with scope: ', registration.scope);
            })
            .catch(error => {
            console.error('Service Worker registration failed: ', error);
            });
        });
    } else {
        console.log('Service Worker is not supported by this browser.');
    }
});