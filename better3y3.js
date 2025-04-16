/**
 * better3y3 - an advanced text encoding system
 * @author jackgawe
 * @license mit
 */

class Better3y3 {
    // unicode ranges for encoding
    static RANGES = {
        PRIMARY: { start: 0xE0000, end: 0xE007F },    // original range
        SECONDARY: { start: 0xE0080, end: 0xE00FF },  // additional range
        TERTIARY: { start: 0xE0100, end: 0xE017F },  // backup range
        QUATERNARY: { start: 0xE0180, end: 0xE01FF } // extra range
    };

    /**
     * encodes text using multiple unicode ranges with rotation
     * @param {string} text - the text to encode
     * @param {Object} options - encoding options
     * @param {boolean} options.useMultipleRanges - whether to use multiple unicode ranges
     * @param {boolean} options.addChecksum - whether to add a checksum for validation
     * @param {boolean} options.addSalt - whether to add random salt characters
     * @param {number} options.rotation - number of characters to rotate (0-127)
     * @returns {string} encoded text
     */
    static encode(text, options = { 
        useMultipleRanges: true, 
        addChecksum: true,
        addSalt: true,
        rotation: 0
    }) {
        if (!text || typeof text !== 'string') {
            throw new Error('input must be a non-empty string');
        }

        // apply rotation if specified
        if (options.rotation > 0) {
            text = this._rotateText(text, options.rotation);
        }

        let encoded = '';
        let rangeIndex = 0;
        const ranges = Object.values(this.RANGES);

        // add salt if enabled
        if (options.addSalt) {
            const salt = this._generateSalt(3); // add 3 random salt characters
            encoded += salt;
        }

        for (const char of text) {
            const codePoint = char.codePointAt(0);
            
            // only encode ascii characters
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
     * decodes text encoded with better3y3
     * @param {string} encodedText - the encoded text
     * @param {Object} options - decoding options
     * @param {boolean} options.validateChecksum - whether to validate the checksum
     * @param {boolean} options.removeSalt - whether to remove salt characters
     * @param {number} options.rotation - number of characters to rotate back (0-127)
     * @returns {string} decoded text
     */
    static decode(encodedText, options = { 
        validateChecksum: true,
        removeSalt: true,
        rotation: 0
    }) {
        if (!encodedText || typeof encodedText !== 'string') {
            throw new Error('input must be a non-empty string');
        }

        let text = encodedText;
        
        // remove salt if present and enabled
        if (options.removeSalt) {
            text = text.slice(3); // remove first 3 characters (salt)
        }

        let decoded = '';
        let checksum = null;

        for (const char of text) {
            const codePoint = char.codePointAt(0);
            
            // check all possible ranges
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
                decoded = decoded.slice(0, -1); // remove checksum character
                
                const calculatedChecksum = this._calculateChecksum(decoded);
                if (checksum !== calculatedChecksum) {
                    throw new Error('checksum validation failed');
                }
            }
        }

        // apply reverse rotation if specified
        if (options.rotation > 0) {
            decoded = this._rotateText(decoded, -options.rotation);
        }

        return decoded;
    }

    /**
     * generates random salt characters
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
     * rotates text by a specified number of characters
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
     * calculates a checksum for the text
     * @private
     */
    static _calculateChecksum(text) {
        return [...text].reduce((sum, char) => {
            return (sum + char.codePointAt(0)) % 128;
        }, 0);
    }

    /**
     * checks if text is encoded with better3y3
     * @param {string} text - the text to check
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

// export for both node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Better3y3;
} else if (typeof window !== 'undefined') {
    window.Better3y3 = Better3y3;
} 