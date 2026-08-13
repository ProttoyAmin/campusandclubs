// utils/id.ts

/**
 * Generates a random ID string
 * @param prefix - Optional prefix for the ID (e.g., "club", "user", "form")
 * @param length - Length of the random portion (default: 8)
 * @returns A unique ID string
 */
export const generateId = (prefix?: string, length: number = 8): string => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random()
        .toString(36)
        .substring(2, 2 + length);

    const id = `${timestamp}-${randomPart}`;
    return prefix ? `${prefix}-${id}` : id;
};

/**
 * Generates a short random ID (useful for keys in lists)
 * @param prefix - Optional prefix for the ID
 * @returns A short unique ID string
 */
export const generateShortId = (prefix?: string): string => {
    const randomPart = Math.random()
        .toString(36)
        .substring(2, 8);

    return prefix ? `${prefix}-${randomPart}` : randomPart;
};

/**
 * Generates a UUID v4 compatible ID
 * @returns A UUID v4 string
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Generates a sequential ID with optional prefix
 * @param prefix - Optional prefix for the ID
 * @param sequence - The sequence number
 * @returns A formatted sequential ID
 */
export const generateSequentialId = (prefix: string, sequence: number): string => {
    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
};

/**
 * Generates a cryptographically secure random ID
 * @param length - Length of the random ID (default: 16)
 * @returns A cryptographically secure random ID
 */
export const generateSecureId = (length: number = 16): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generates a human-readable ID with words
 * @param separator - Separator between words (default: '-')
 * @returns A human-readable ID
 */
export const generateReadableId = (separator: string = '-'): string => {
    const adjectives = ['happy', 'clever', 'brave', 'calm', 'eager', 'fair', 'grand', 'kind'];
    const nouns = ['panda', 'tiger', 'eagle', 'dolphin', 'fox', 'wolf', 'bear', 'hawk'];
    const numbers = Math.floor(Math.random() * 1000);

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective}${separator}${noun}${separator}${numbers}`;
};