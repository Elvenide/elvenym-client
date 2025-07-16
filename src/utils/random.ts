// Random number seeds
let a: number, b: number, c: number, d: number;

/**
 * Resets the seeded random number generator.
 */
export function resetSeed() {
    a = 2753, b = 197, c = 1851, d = 517;
}
resetSeed();

/**
 * Seeded random number generator using SFC32
 * pseudo-random algorithm.
 */
export function random() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
}

/**
 * Array shuffler using Fischer-Yates algorithm.
 * Utilizes seeded random to guarantee the same
 * order 
 */
export function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}