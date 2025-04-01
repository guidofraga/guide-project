export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Creates a unique string key for a pairing (order independent)
export function getPairingKey(op1, op2) {
    return [op1, op2].sort((a, b) => a - b).join('+');
    // Or, if order matters (e.g., 1+2 is different from 2+1):
    // return `${op1}+${op2}`;
} 