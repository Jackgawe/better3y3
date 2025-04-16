/**
 * Better3y3 - An advanced text encoding system
 * @author Jackgawe
 * @license MIT
 */

class Better3y3 {
    // Unicode ranges for encoding
    static RANGES = {
        PRIMARY: { start: 0xE0000, end: 0xE007F },    // Original range
        SECONDARY: { start: 0xE0080, end: 0xE00FF },  // Additional range
        TERTIARY: { start: 0xE0100, end: 0xE017F },  // Backup range
        QUATERNARY: { start: 0xE0180, end: 0xE01FF } // Extra range
    };

    /**
     * Encodes text using multiple Unicode ranges with rotation
     * @param {string} text - The text to encode
     * @param {Object} options - Encoding options
     * @param {boolean} options.useMultipleRanges - Whether to use multiple Unicode ranges
     * @param {boolean} options.addChecksum - Whether to add a checksum for validation
     * @param {boolean} options.addSalt - Whether to add random salt characters
     * @param {number} options.rotation - Number of characters to rotate (0-127)
     * @returns {string} Encoded text
     */
    static encode(text, options = { 
        useMultipleRanges: true, 
        addChecksum: true,
        addSalt: true,
        rotation: 0
    }) {
        if (!text || typeof text !== 'string') {
            throw new Error('Input must be a non-empty string');
        }

        // Apply rotation if specified
        if (options.rotation > 0) {
            text = this._rotateText(text, options.rotation);
        }

        let encoded = '';
        let rangeIndex = 0;
        const ranges = Object.values(this.RANGES);

        // Add salt if enabled
        if (options.addSalt) {
            const salt = this._generateSalt(3); // Add 3 random salt characters
            encoded += salt;
        }

        for (const char of text) {
            const codePoint = char.codePointAt(0);
            
            // Only encode ASCII characters
            if (codePoint >= 0x20 && codePoint <= 0x7E) {
                const currentRange = options.useMultipleRanges 
                    ? ranges[rangeIndex % ranges.length]
                    : this.RANGES.PRIMARY;
                
                const offset = currentRange.start;
                encoded += String.fromCodePoint(codePoint + offset);
                
                if (options.useMultipleRanges) {
                    rangeIndex++;
                }
            } else {
                encoded += char;
            }
        }

        if (options.addChecksum) {
            const checksum = this._calculateChecksum(text);
            encoded += String.fromCodePoint(this.RANGES.PRIMARY.start + checksum);
        }

        return encoded;
    }

    /**
     * Decodes text encoded with Better3y3
     * @param {string} encodedText - The encoded text
     * @param {Object} options - Decoding options
     * @param {boolean} options.validateChecksum - Whether to validate the checksum
     * @param {boolean} options.removeSalt - Whether to remove salt characters
     * @param {number} options.rotation - Number of characters to rotate back (0-127)
     * @returns {string} Decoded text
     */
    static decode(encodedText, options = { 
        validateChecksum: true,
        removeSalt: true,
        rotation: 0
    }) {
        if (!encodedText || typeof encodedText !== 'string') {
            throw new Error('Input must be a non-empty string');
        }

        let text = encodedText;
        
        // Remove salt if present and enabled
        if (options.removeSalt) {
            text = text.slice(3); // Remove first 3 characters (salt)
        }

        let decoded = '';
        let checksum = null;

        for (const char of text) {
            const codePoint = char.codePointAt(0);
            
            // Check all possible ranges
            for (const range of Object.values(this.RANGES)) {
                if (codePoint >= range.start && codePoint <= range.end) {
                    const originalCodePoint = codePoint - range.start;
                    decoded += String.fromCodePoint(originalCodePoint);
                    break;
                }
            }
        }

        if (options.validateChecksum) {
            const lastChar = text.slice(-1);
            const lastCodePoint = lastChar.codePointAt(0);
            if (lastCodePoint >= this.RANGES.PRIMARY.start && 
                lastCodePoint <= this.RANGES.PRIMARY.end) {
                checksum = lastCodePoint - this.RANGES.PRIMARY.start;
                decoded = decoded.slice(0, -1); // Remove checksum character
                
                const calculatedChecksum = this._calculateChecksum(decoded);
                if (checksum !== calculatedChecksum) {
                    throw new Error('Checksum validation failed');
                }
            }
        }

        // Apply reverse rotation if specified
        if (options.rotation > 0) {
            decoded = this._rotateText(decoded, -options.rotation);
        }

        return decoded;
    }

    /**
     * Generates random salt characters
     * @private
     */
    static _generateSalt(length) {
        let salt = '';
        for (let i = 0; i < length; i++) {
            const randomCodePoint = Math.floor(Math.random() * 128) + this.RANGES.PRIMARY.start;
            salt += String.fromCodePoint(randomCodePoint);
        }
        return salt;
    }

    /**
     * Rotates text by a specified number of characters
     * @private
     */
    static _rotateText(text, rotation) {
        const chars = [...text];
        const len = chars.length;
        rotation = rotation % len;
        if (rotation < 0) rotation += len;
        return chars.slice(rotation).concat(chars.slice(0, rotation)).join('');
    }

    /**
     * Calculates a checksum for the text
     * @private
     */
    static _calculateChecksum(text) {
        return [...text].reduce((sum, char) => {
            return (sum + char.codePointAt(0)) % 128;
        }, 0);
    }

    /**
     * Checks if text is encoded with Better3y3
     * @param {string} text - The text to check
     * @returns {boolean}
     */
    static isEncoded(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }

        for (const char of text) {
            const codePoint = char.codePointAt(0);
            for (const range of Object.values(this.RANGES)) {
                if (codePoint >= range.start && codePoint <= range.end) {
                    return true;
                }
            }
        }
        return false;
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Better3y3;
} else if (typeof window !== 'undefined') {
    window.Better3y3 = Better3y3;
} 