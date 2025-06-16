# Better3y3

An advanced version of the 3y3 text encoding system that provides enhanced obfuscation and security features.

## Credit

This project is based on the original [3y3](https://github.com/ArjixWasTaken/3y3) implementation by [@ArjixWasTaken](https://github.com/ArjixWasTaken). The original concept was created by [@yourcompanionAI](https://github.com/yourcompanionAI) and can be found at [synthetic.garden/3y3.htm](https://synthetic.garden/3y3.htm).

## Features

- **Multiple Unicode Ranges**: Uses four different Unicode ranges for better obfuscation
- **Character Rotation**: Optional text rotation for additional security
- **Random Salt**: Adds random characters to make encoded text harder to detect
- **Checksum Validation**: Optional checksum to detect tampering
- **Error Handling**: Proper input validation and error messages
- **Cross-Platform**: Works in both Node.js and browser environments
- **Type Safety**: Input validation and type checking
- **Configurable**: Multiple encoding options for different use cases

## Installation

```bash
npm install better3y3
```

Or include directly in your HTML:

```html
<script src="better3y3.js"></script>
```

## Usage

### Basic Encoding/Decoding

```javascript
// Basic encoding
const encoded = Better3y3.encode("Hello, World!");
console.log(encoded); // Encoded text with invisible characters

// Basic decoding
const decoded = Better3y3.decode(encoded);
console.log(decoded); // "Hello, World!"
```

### Advanced Options

```javascript
// Encode with all features enabled
const encoded = Better3y3.encode("Hello, World!", {
    useMultipleRanges: true,  // Use multiple Unicode ranges
    addChecksum: true,        // Add checksum for validation
    addSalt: true,           // Add random salt characters
    rotation: 5              // Rotate text by 5 characters
});

// Decode with validation
const decoded = Better3y3.decode(encoded, {
    validateChecksum: true,  // Validate checksum during decoding
    removeSalt: true,        // Remove salt characters
    rotation: 5             // Rotate back by 5 characters
});
```

### Web Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Better3y3 Demo</title>
    <script src="better3y3.js"></script>
</head>
<body>
    <textarea id="input" placeholder="Enter text to encode"></textarea>
    <button onclick="encode()">Encode</button>
    <button onclick="decode()">Decode</button>
    <div id="output"></div>

    <script>
        function encode() {
            const input = document.getElementById('input').value;
            const encoded = Better3y3.encode(input, {
                useMultipleRanges: true,
                addChecksum: true,
                addSalt: true,
                rotation: 3
            });
            document.getElementById('output').textContent = encoded;
        }

        function decode() {
            const input = document.getElementById('input').value;
            try {
                const decoded = Better3y3.decode(input, {
                    validateChecksum: true,
                    removeSalt: true,
                    rotation: 3
                });
                document.getElementById('output').textContent = decoded;
            } catch (e) {
                document.getElementById('output').textContent = 'Error: ' + e.message;
            }
        }
    </script>
</body>
</html>
```

### Node.js Example

```javascript
const Better3y3 = require('better3y3');

// Encode a message
const message = "This is a secret message";
const encoded = Better3y3.encode(message, {
    useMultipleRanges: true,
    addChecksum: true,
    addSalt: true,
    rotation: 4
});

console.log('Encoded:', encoded);

// Decode the message
try {
    const decoded = Better3y3.decode(encoded, {
        validateChecksum: true,
        removeSalt: true,
        rotation: 4
    });
    console.log('Decoded:', decoded);
} catch (e) {
    console.error('Decoding failed:', e.message);
}
```

### Check if Text is Encoded

```javascript
const isEncoded = Better3y3.isEncoded(someText);
console.log(isEncoded); // true or false
```

## Improvements over Original 3y3

1. **Multiple Unicode Ranges**: Uses four different Unicode ranges instead of one, making it harder to detect and decode
2. **Character Rotation**: Optional text rotation adds another layer of obfuscation
3. **Random Salt**: Adds random characters to make encoded text harder to detect
4. **Checksum Validation**: Optional checksum to detect if the encoded text has been tampered with
5. **Better Error Handling**: Proper input validation and descriptive error messages
6. **Configurable Options**: Multiple encoding options for different use cases
7. **Type Safety**: Input validation and type checking to prevent errors
8. **Cross-Platform Support**: Works in both Node.js and browser environments
9. **Documentation**: Comprehensive JSDoc comments and usage examples

## Security Notes

While this encoding system provides enhanced obfuscation, it should not be used for:
- Storing sensitive information
- Password storage
- Cryptographic purposes

It is primarily designed for:
- Text obfuscation
- Hiding text in plain sight
- Basic message encoding
- Adding an extra layer of security to non-sensitive data
