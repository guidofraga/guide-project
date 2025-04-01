import { getRandomInt, shuffleArray, getPairingKey } from '../utils/utils.js';
import {
    FASTER_TIME_THRESHOLD_MS,
    DEFAULT_TIME_THRESHOLD_MS
} from '../config/constants.js';

// --- Stage Definitions ---
export const stages = {
    'A': { name: 'Fundamentos da Adição', description: 'Dominando a adição com números de 1 a 9.' },
    'B': { name: 'Dezenas e Unidades', description: 'Adicionando dezenas e unidades simples.' },
    // Add more stages here as levels are created
};

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

// --- Level Definitions ---
// Structure: key: { stage, name(short), generatePairings(), timeThreshold, next }
export const levels = {
    'A1': {
        stage: 'A',
        name: '+1',
        generatePairings: () => generateSpecificAddPairings(1, 1, 9),
        timeThreshold: FASTER_TIME_THRESHOLD_MS,
        next: 'A2'
    },
    'A2': {
        stage: 'A',
        name: '+2',
        generatePairings: () => generateSpecificAddPairings(2, 1, 9),
        timeThreshold: FASTER_TIME_THRESHOLD_MS,
        next: 'A3'
    },
    'A3': {
        stage: 'A',
        name: '+3',
        generatePairings: () => generateSpecificAddPairings(3, 1, 9),
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
        next: 'A4'
    },
    'A4': {
         stage: 'A',
         name: '+4',
         generatePairings: () => generateSpecificAddPairings(4, 1, 9),
         timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
         next: 'A5'
    },
    'A5': {
         stage: 'A',
         name: '+5',
         generatePairings: () => generateSpecificAddPairings(5, 1, 9),
         timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
         next: 'A6'
    },
     'A6': {
         stage: 'A',
         name: '+6',
         generatePairings: () => generateSpecificAddPairings(6, 1, 9),
         timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
         next: 'A7'
    },
    'A7': {
         stage: 'A',
         name: '+7',
         generatePairings: () => generateSpecificAddPairings(7, 1, 9),
         timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
         next: 'A8'
    },
    'A8': {
         stage: 'A',
         name: '+8',
         generatePairings: () => generateSpecificAddPairings(8, 1, 9),
         timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
         next: 'A9'
    },
    'A9': {
         stage: 'A',
         name: '+9',
         generatePairings: () => generateSpecificAddPairings(9, 1, 9),
         timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
         next: 'AMix1'
    },
    'AMix1': {
        stage: 'A',
        name: 'Mistura (1-9)',
        generatePairings: () => generateRandomRangePairings(1, 9, 1, 9, 30), // Generate 30 random pairs
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1000, // Slightly more time for mixed
        next: 'B1' // Transition to next stage
    },
    'B1': {
         stage: 'B',
         name: '10 + n',
         generatePairings: () => generateSpecificAddPairings(10, 1, 9),
         timeThreshold: FASTER_TIME_THRESHOLD_MS,
         next: 'B2' // Placeholder for next level in stage B
    },
    // ... Add more levels for Stage B etc. ...
    'END': { stage: null, name: 'Fim do Jogo!', generatePairings: () => [], timeThreshold: 0, next: null} // Sentinel level
};

// Export generation functions if they need to be called directly elsewhere (currently not needed)
// export { generateSpecificAddPairings, generateRandomRangePairings }; 