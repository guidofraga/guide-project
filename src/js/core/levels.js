import { getRandomInt, shuffleArray, getPairingKey } from '../utils/utils.js';
import {
    FASTER_TIME_THRESHOLD_MS,
    DEFAULT_TIME_THRESHOLD_MS
} from '../config/constants.js';

// --- Stage Definitions ---
export const stages = {
    'C': { name: 'Contagem', description: 'Exercícios de contagem e reconhecimento de números.' },
    'A': { name: 'Fundamentos da Adição', description: 'Dominando a adição com números de 1 a 9.' },
    'B': { name: 'Dezenas e Unidades', description: 'Adicionando dezenas e unidades simples.' },
    // Add more stages here as levels are created
};

// --- Generation Functions ---
// New function for Tabela exercise number generation
function generateRandomNumberSet(min, max, count) {
    const numbers = [];
    const used = new Set();
    
    while (numbers.length < count) {
        const num = getRandomInt(min, max);
        if (!used.has(num)) {
            numbers.push(num);
            used.add(num);
        }
    }
    
    return numbers;
}

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
    'C1': {
        stage: 'C',
        name: 'Tabela 1 (1-5)',
        type: 'tabela',
        numberRange: { min: 1, max: 5 },
        hideNumbers: false,
        timeThreshold: FASTER_TIME_THRESHOLD_MS,
        next: 'C2'
    },
    'C2': {
        stage: 'C',
        name: 'Tabela 2 (1-5) - Números Escondidos',
        type: 'tabela',
        numberRange: { min: 1, max: 5 },
        hideNumbers: true,
        timeThreshold: FASTER_TIME_THRESHOLD_MS,
        next: 'C3'
    },
    'C3': {
        stage: 'C',
        name: 'Tabela 3 (1-10)',
        type: 'tabela',
        numberRange: { min: 1, max: 10 },
        hideNumbers: false,
        timeThreshold: FASTER_TIME_THRESHOLD_MS,
        next: 'C4'
    },
    'C4': {
        stage: 'C',
        name: 'Tabela 4 (1-10) - Números Escondidos',
        type: 'tabela',
        numberRange: { min: 1, max: 10 },
        hideNumbers: true,
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
        next: 'C5'
    },
    'C5': {
        stage: 'C',
        name: 'Tabela 5 (1-20)',
        type: 'tabela',
        numberRange: { min: 1, max: 20 },
        hideNumbers: false,
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
        next: 'C6'
    },
    'C6': {
        stage: 'C',
        name: 'Tabela 6 (1-20) - Números Escondidos',
        type: 'tabela',
        numberRange: { min: 1, max: 20 },
        hideNumbers: true,
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
        next: 'C7'
    },
    'C7': {
        stage: 'C',
        name: 'Tabela 7 (1-50)',
        type: 'tabela',
        numberRange: { min: 1, max: 50 },
        hideNumbers: false,
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
        next: 'C8'
    },
    'C8': {
        stage: 'C',
        name: 'Tabela 8 (1-50) - Números Escondidos',
        type: 'tabela',
        numberRange: { min: 1, max: 50 },
        hideNumbers: true,
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1000,
        next: 'C9'
    },
    'C9': {
        stage: 'C',
        name: 'Tabela 9 (1-100)',
        type: 'tabela',
        numberRange: { min: 1, max: 100 },
        hideNumbers: false,
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
        next: 'C10'
    },
    'C10': {
        stage: 'C',
        name: 'Tabela 10 (1-100) - Números Escondidos',
        type: 'tabela',
        numberRange: { min: 1, max: 100 },
        hideNumbers: true,
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1000,
        next: 'A1'
    },
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
         next: 'A10'
    },
    'A10': {
         stage: 'A',
         name: '10 + n',
         generatePairings: () => generateSpecificAddPairings(10, 1, 9),
         timeThreshold: FASTER_TIME_THRESHOLD_MS,
         next: 'A11'
    },
    'A11': {
        stage: 'A',
        name: 'Teste (1-10)',
        generatePairings: () => generateRandomRangePairings(1, 10, 1, 9, 40), // Generate 40 random pairs
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1000, // Slightly more time for mixed
        next: 'B1' // Transition directly to next stage
    },
    'B1': {
        stage: 'B',
        name: 'Dezenas + Unidades (sem "vai um")',
        generatePairings: () => {
            const pairings = [];
            // For numbers from 10 to 19
            for (let num = 10; num <= 19; num++) {
                // For each potential second number (1-9)
                for (let secondNum = 1; secondNum <= 9; secondNum++) {
                    // Check if adding won't cause carrying (sum <= 19)
                    if (num + secondNum <= 19) {
                        pairings.push({ op1: num, op2: secondNum });
                    }
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
        next: 'B2'
    },
    'B2': {
        stage: 'B',
        name: 'Dezenas + Dezenas',
        generatePairings: () => {
            const pairings = [];
            // Generate all combinations of multiples of 10
            for (let tens1 = 1; tens1 <= 9; tens1++) {
                for (let tens2 = 1; tens2 <= 9; tens2++) {
                    pairings.push({ op1: tens1 * 10, op2: tens2 * 10 });
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS,
        next: 'B3'
    },
    'B3': {
        stage: 'B',
        name: 'Dezenas + Dezenas (sem "vai um")',
        generatePairings: () => {
            const pairings = [];
            // For two-digit numbers
            for (let tens1 = 1; tens1 <= 9; tens1++) {
                for (let units1 = 0; units1 <= 9; units1++) {
                    const num1 = tens1 * 10 + units1;
                    
                    for (let tens2 = 1; tens2 <= 9; tens2++) {
                        for (let units2 = 0; units2 <= 9; units2++) {
                            const num2 = tens2 * 10 + units2;
                            
                            // Check if adding won't cause carrying in units place
                            if (units1 + units2 <= 9 && tens1 + tens2 <= 9) {
                                pairings.push({ op1: num1, op2: num2 });
                            }
                        }
                    }
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1000,
        next: 'B4'
    },
    'B4': {
        stage: 'B',
        name: 'Dezenas (10-19) + Unidades (com "vai um")',
        generatePairings: () => {
            const pairings = [];
            // For numbers from 10 to 19
            for (let num = 10; num <= 19; num++) {
                const units = num % 10;
                // For each potential second number (1-9)
                for (let secondNum = 1; secondNum <= 9; secondNum++) {
                    // Check if adding WILL cause carrying (units + secondNum > 9)
                    if (units + secondNum > 9) {
                        pairings.push({ op1: num, op2: secondNum });
                    }
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 500,
        next: 'B5'
    },
    'B5': {
        stage: 'B',
        name: 'Dezenas (20-99) + Unidades (com "vai um")',
        generatePairings: () => {
            const pairings = [];
            // For numbers from 20 to 99
            for (let tens = 2; tens <= 9; tens++) {
                for (let units = 0; units <= 9; units++) {
                    const num = tens * 10 + units;
                    
                    // For each potential second number (1-9)
                    for (let secondNum = 1; secondNum <= 9; secondNum++) {
                        // Check if adding WILL cause carrying in units (sum > 9)
                        // but won't cause hundreds to carry (tens + 1 <= 9)
                        if (units + secondNum > 9 && tens + 1 <= 9) {
                            pairings.push({ op1: num, op2: secondNum });
                        }
                    }
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1000,
        next: 'B6'
    },
    'B6': {
        stage: 'B',
        name: 'Dezenas Múltiplas + Dezenas Múltiplas (com "vai um")',
        generatePairings: () => {
            const pairings = [];
            // Generate combinations of multiples of 10 that carry
            for (let tens1 = 1; tens1 <= 9; tens1++) {
                for (let tens2 = 1; tens2 <= 9; tens2++) {
                    // Check if adding will cause carrying in tens place (sum >= 100)
                    if (tens1 + tens2 >= 10) {
                        pairings.push({ op1: tens1 * 10, op2: tens2 * 10 });
                    }
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 500,
        next: 'B7'
    },
    'B7': {
        stage: 'B',
        name: 'Dezenas (10-19) + Dezenas (10-99) (com "vai um" nas unidades)',
        generatePairings: () => {
            const pairings = [];
            // For numbers from 10 to 19 (teens)
            for (let num1 = 10; num1 <= 19; num1++) {
                const units1 = num1 % 10;
                
                // For second number from 10 to 99
                for (let tens2 = 1; tens2 <= 9; tens2++) {
                    for (let units2 = 0; units2 <= 9; units2++) {
                        const num2 = tens2 * 10 + units2;
                        
                        // Check if adding WILL cause units to carry (sum > 9)
                        // but won't cause hundreds to carry (1 + tens2 + 1 <= 9)
                        if (units1 + units2 > 9 && 1 + tens2 + 1 <= 9) {
                            pairings.push({ op1: num1, op2: num2 });
                        }
                    }
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1000,
        next: 'B8'
    },
    'B8': {
        stage: 'B',
        name: 'Dezenas (20-99) + Dezenas (10-99) (com "vai um" nas unidades)',
        generatePairings: () => {
            const pairings = [];
            // For first number from 20 to 99
            for (let tens1 = 2; tens1 <= 9; tens1++) {
                for (let units1 = 0; units1 <= 9; units1++) {
                    const num1 = tens1 * 10 + units1;
                    
                    // For second number from 10 to 99
                    for (let tens2 = 1; tens2 <= 9; tens2++) {
                        for (let units2 = 0; units2 <= 9; units2++) {
                            const num2 = tens2 * 10 + units2;
                            
                            // Check if adding WILL cause units to carry (sum > 9)
                            // but won't cause hundreds to carry (tens1 + tens2 + 1 <= 9)
                            if (units1 + units2 > 9 && tens1 + tens2 + 1 <= 9) {
                                pairings.push({ op1: num1, op2: num2 });
                            }
                        }
                    }
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1500,
        next: 'B9'
    },
    'B9': {
        stage: 'B',
        name: 'Dezenas + Dezenas (com "vai um" nas dezenas, sem "vai um" nas unidades)',
        generatePairings: () => {
            const pairings = [];
            // For first number from 10 to 99
            for (let tens1 = 1; tens1 <= 9; tens1++) {
                for (let units1 = 0; units1 <= 9; units1++) {
                    const num1 = tens1 * 10 + units1;
                    
                    // For second number from 10 to 99
                    for (let tens2 = 1; tens2 <= 9; tens2++) {
                        for (let units2 = 0; units2 <= 9; units2++) {
                            const num2 = tens2 * 10 + units2;
                            
                            // Check if units won't carry (sum <= 9)
                            // but tens will carry (tens1 + tens2 >= 10)
                            if (units1 + units2 <= 9 && tens1 + tens2 >= 10) {
                                pairings.push({ op1: num1, op2: num2 });
                            }
                        }
                    }
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 1500,
        next: 'B10'
    },
    'B10': {
        stage: 'B',
        name: 'Dezenas + Dezenas (com "vai um" em ambos)',
        generatePairings: () => {
            const pairings = [];
            // For first number from 10 to 99
            for (let tens1 = 1; tens1 <= 9; tens1++) {
                for (let units1 = 0; units1 <= 9; units1++) {
                    const num1 = tens1 * 10 + units1;
                    
                    // For second number from 10 to 99
                    for (let tens2 = 1; tens2 <= 9; tens2++) {
                        for (let units2 = 0; units2 <= 9; units2++) {
                            const num2 = tens2 * 10 + units2;
                            
                            // Check if both units and tens will carry
                            // units carry (units1 + units2 > 9)
                            // tens carry with the carried 1 (tens1 + tens2 + 1 >= 10)
                            if (units1 + units2 > 9 && tens1 + tens2 + 1 >= 10) {
                                pairings.push({ op1: num1, op2: num2 });
                            }
                        }
                    }
                }
            }
            return shuffleArray(pairings);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 2000,
        next: 'B11'
    },
    'B11': {
        stage: 'B',
        name: 'Teste (Dezenas - com e sem "vai um")',
        generatePairings: () => {
            const pairings = [];
            
            // Mixed problems covering all rules from Stage B
            // For first number from 10 to 99
            for (let num1 = 10; num1 <= 99; num1++) {
                // For second number from 1 to 99
                for (let num2 = 1; num2 <= 99; num2++) {
                    // Skip cases where second number is 0 (covered in earlier levels)
                    if (num2 === 0) continue;
                    
                    // Include in test set (will be sampled and shuffled)
                    pairings.push({ op1: num1, op2: num2 });
                }
            }
            
            // Sample 40 random pairs to ensure a good distribution
            return shuffleArray(pairings).slice(0, 40);
        },
        timeThreshold: DEFAULT_TIME_THRESHOLD_MS + 2000,
        next: 'END'
    },
    'END': { stage: null, name: 'Fim do Jogo!', generatePairings: () => [], timeThreshold: 0, next: null} // Sentinel level
};

// Export generation functions if they need to be called directly elsewhere (currently not needed)
// export { generateSpecificAddPairings, generateRandomRangePairings }; 