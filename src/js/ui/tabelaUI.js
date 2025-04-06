import * as dom from './domElements.js';
import state from '../core/state.js';
import { levels } from '../core/levels.js';
import { triggerHapticFeedback } from '../utils/utils.js';
import { playSound } from '../utils/audio.js';

let targetNumber = null;
let numbersGrid = [];
let usedNumbers = new Set();

// Create a table with numbers from min to max in a grid of 10 columns
export function createTabelaGrid(min, max, hideNumbers) {
    const container = document.createElement('div');
    container.className = 'tabela-container';

    // Create the target number display
    const targetDisplay = document.createElement('div');
    targetDisplay.className = 'tabela-target-number';
    targetDisplay.id = 'tabela-target';
    
    // Add instruction text above the target display
    const instructionText = document.createElement('p');
    instructionText.className = 'tabela-instruction';
    instructionText.textContent = 'Clique no número:';
    instructionText.style.textAlign = 'center';
    instructionText.style.marginBottom = '10px';
    instructionText.style.fontSize = '1.1rem';
    instructionText.style.color = 'var(--text-color)';
    
    container.appendChild(instructionText);
    container.appendChild(targetDisplay);

    // Create the numbers grid
    const grid = document.createElement('div');
    grid.className = 'tabela-grid';

    const totalNumbers = max - min + 1;
    
    // Set grid size class based on number count
    if (totalNumbers <= 5) {
        grid.setAttribute('data-size', 'small');
    } else if (totalNumbers <= 20) {
        grid.setAttribute('data-size', 'medium');
    } else {
        grid.setAttribute('data-size', 'large');
    }
    
    // Special handling for small number ranges to ensure specific layouts
    let rowSize;
    if (totalNumbers <= 5) {
        // For 1-5, use one row of 5
        rowSize = 5;
    } else if (totalNumbers <= 10) {
        // For 1-10, use two rows of 5
        rowSize = 5;
    } else if (totalNumbers <= 20) {
        // For 1-20, use 4 rows of 5
        rowSize = 5;
    } else {
        // Standard size, use rows of 10
        rowSize = 10;
    }
    
    // Calculate rows based on number size and row size
    const numRows = Math.ceil(totalNumbers / rowSize);

    // Generate all numbers in order
    for (let row = 0; row < numRows; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'tabela-row';

        for (let col = 0; col < rowSize; col++) {
            const number = min + (row * rowSize) + col;
            if (number <= max) {
                const cell = document.createElement('div');
                cell.className = 'tabela-cell';
                cell.dataset.number = number;

                // If numbers should be hidden, add a placeholder
                if (!hideNumbers) {
                    cell.textContent = number;
                } else {
                    // For hidden numbers, add an invisible span that maintains the cell structure
                    cell.innerHTML = `<span style="opacity: 0">${number}</span>`;
                    cell.setAttribute('aria-label', `Posição ${number}`);
                }

                // Add touch/click feedback
                cell.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.95)';
                }, { passive: true });
                
                cell.addEventListener('touchend', function() {
                    this.style.transform = '';
                }, { passive: true });

                // Store click handler
                cell.addEventListener('click', handleTabelaCellClick);
                
                rowElement.appendChild(cell);
            }
        }

        grid.appendChild(rowElement);
    }

    container.appendChild(grid);
    return container;
}

// Handle cell click in the Tabela grid
function handleTabelaCellClick(event) {
    const cell = event.currentTarget;
    const clickedNumber = parseInt(cell.dataset.number, 10);

    if (clickedNumber === targetNumber) {
        // Correct answer
        cell.classList.add('correct');
        playSound('correct');
        triggerHapticFeedback('CORRECT');
        
        // Mark this number as used
        usedNumbers.add(clickedNumber);
        
        // Immediately generate the next number without showing a correct message
        generateTargetNumber();
    } else {
        // Wrong answer
        cell.classList.add('incorrect');
        setTimeout(() => {
            cell.classList.remove('incorrect');
        }, 600);
        playSound('wrong');
        triggerHapticFeedback('INCORRECT');
        
        // Track wrong answers for scoring
        state.wrongAnswers = (state.wrongAnswers || 0) + 1;
    }
    
    // Check if all numbers have been used
    checkTabelaCompletion();
}

// Check if all numbers in the range have been used
function checkTabelaCompletion() {
    const levelConfig = levels[state.currentLevelKey];
    const { min, max } = levelConfig.numberRange;
    const totalNumbers = max - min + 1;
    
    console.log(`Checking tabela completion: ${usedNumbers.size}/${totalNumbers} numbers used`);
    
    if (usedNumbers.size >= totalNumbers) {
        state.tabelaComplete = true;
        
        // Add a visual indication that the exercise is complete
        const targetDisplay = document.getElementById('tabela-target');
        if (targetDisplay) {
            targetDisplay.textContent = "Completo!";
            targetDisplay.classList.add('complete');
        }
        
        // Call checkAnswer to handle completion
        setTimeout(() => {
            if (typeof window.checkAnswer === 'function') {
                window.checkAnswer();
            }
        }, 1000);
    }
}

// Initialize the Tabela exercise
export function initializeTabelaExercise() {
    const levelConfig = levels[state.currentLevelKey];
    const { min, max } = levelConfig.numberRange;
    const hideNumbers = levelConfig.hideNumbers;
    const totalNumbers = max - min + 1;
    
    // Reset state
    usedNumbers.clear();
    targetNumber = null;
    state.tabelaComplete = false;
    state.sessionStartTime = performance.now();
    state.wrongAnswers = 0;
    
    // Clear the problem area
    const problemArea = document.getElementById('problem-area');
    if (problemArea) {
        problemArea.innerHTML = '';
        
        // Create and append the grid
        const tabelaGrid = createTabelaGrid(min, max, hideNumbers);
        
        // Add progress indicator
        const progressContainer = document.createElement('div');
        progressContainer.className = 'tabela-progress-container';
        progressContainer.style.margin = '20px 0';
        progressContainer.style.textAlign = 'center';
        
        const progressText = document.createElement('div');
        progressText.id = 'tabela-progress-text';
        progressText.textContent = `0/${totalNumbers} completados`;
        progressText.style.marginBottom = '8px';
        progressText.style.fontSize = '1rem';
        progressText.style.color = 'var(--text-color)';
        
        const progressBarOuter = document.createElement('div');
        progressBarOuter.style.width = '100%';
        progressBarOuter.style.backgroundColor = 'var(--background-light)';
        progressBarOuter.style.borderRadius = '10px';
        progressBarOuter.style.height = '10px';
        progressBarOuter.style.overflow = 'hidden';
        
        const progressBarInner = document.createElement('div');
        progressBarInner.id = 'tabela-progress-bar';
        progressBarInner.style.width = '0%';
        progressBarInner.style.backgroundColor = 'var(--primary-color)';
        progressBarInner.style.height = '100%';
        progressBarInner.style.transition = 'width 0.3s ease';
        
        progressBarOuter.appendChild(progressBarInner);
        progressContainer.appendChild(progressText);
        progressContainer.appendChild(progressBarOuter);
        
        // Add progress bar before the grid
        tabelaGrid.insertBefore(progressContainer, tabelaGrid.firstChild);
        
        problemArea.appendChild(tabelaGrid);
        
        // Generate the first target number
        generateTargetNumber();
    }
}

// Generate a new target number that hasn't been used yet
export function generateTargetNumber() {
    const levelConfig = levels[state.currentLevelKey];
    const { min, max } = levelConfig.numberRange;
    const totalNumbers = max - min + 1;
    
    // Get all available numbers that haven't been used yet
    const availableNumbers = [];
    for (let i = min; i <= max; i++) {
        if (!usedNumbers.has(i)) {
            availableNumbers.push(i);
        }
    }
    
    // Update progress indicators
    const numCompleted = usedNumbers.size;
    const progressText = document.getElementById('tabela-progress-text');
    const progressBar = document.getElementById('tabela-progress-bar');
    
    if (progressText) {
        progressText.textContent = `${numCompleted}/${totalNumbers} completados`;
    }
    
    if (progressBar) {
        const progressPercentage = (numCompleted / totalNumbers) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }
    
    // If all numbers have been used, mark the exercise as complete
    if (availableNumbers.length === 0) {
        state.tabelaComplete = true;
        return;
    }
    
    // Randomly select a number from available numbers
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    targetNumber = availableNumbers[randomIndex];
    
    // Update the target display
    const targetDisplay = document.getElementById('tabela-target');
    if (targetDisplay) {
        targetDisplay.textContent = targetNumber;
    }
}

// Check if Tabela exercise is complete
export function isTabelaComplete() {
    return state.tabelaComplete;
} 