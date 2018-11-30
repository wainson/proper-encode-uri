/**
 * Encodes an URI based on RFC3986 and RFC5987.
 *
 * @param uri
 * @returns {string}
 */
function properEncodeURI(uri) {
    return properEncode(
        uri,
        [
            // Reserved (gen-delims)
            /:/,
            /\//,
            /\?/,
            /#/,
            /\[/,
            /]/,
            /@/,

            // Reserved (sub-delims)
            /!/,
            /\$/,
            /&/,
            /'/,
            /\(/,
            /\)/,
            /\*/,
            /\+/,
            /,/,
            /;/,
            /=/,

            // Unreserved
            /[a-zA-Z]/,
            /[0-9]/,
            /-/,
            /\./,
            /_/,
            /~/
        ]
    );
}

/**
 * Encodes an URI component based on RFC3986 and RFC5987.
 *
 * @param uriComponent
 * @returns {string}
 */
function properEncodeURIComponent(uriComponent) {
    return properEncode(
        uriComponent,
        [
            // Reserved (sub-delims)
            /!/,
            /'/,
            /\(/,
            /\)/,
            /\*/,

            // Unreserved
            /[a-zA-Z]/,
            /[0-9]/,
            /-/,
            /\./,
            /_/,
            /~/
        ]
    );
}

/**
 * Encodes all characters of the given value except the given exceptions.
 *
 * @param value
 * @param exceptions
 * @returns {string}
 */
function properEncode(value, exceptions) {
    if (value === null) {
        return '';
    }

    let result = '';
    for (let i = 0; i < value.length; i++) {
        // Extract character (add surrogate partner if necessary)
        const charCode = value.charCodeAt(i);
        const char = charCode >= 0xd800 && charCode < 0xe000 ? value.charAt(i) + value.charAt(++i) : value.charAt(i);

        // Check for exceptions
        let isException = false;
        for (let j = 0; j < exceptions.length; j++) {
            if (char.match(exceptions[j])) {
                isException = true;
                break;
            }
        }

        if (isException) {
            // Add exception without percentage encoding
            result += char;
        } else {
            // Convert character to UTF-8 byte array
            const utf8ByteArray = toUTF8ByteArray(char);

            // Convert UTF-8 byte array to percentage encoding
            for (let j = 0; j < utf8ByteArray.length; j++) {
                result += '%' + toHexString(utf8ByteArray[j]);
            }
        }
    }
    return result;
}

/**
 * Converts a given byte into an hex string.
 *
 * @param byte
 * @returns {string}
 */
function toHexString(byte) {
    return ('0' + byte.toString(16)).slice(-2).toUpperCase();
}

/**
 * Converts a given character into an UTF-8 byte array.
 *
 * @param character May be 1 or 2 UTF-16 characters long.
 * @returns {Array} May have 1 to 4 bytes.
 */
function toUTF8ByteArray(character) {
    let charCode = character.charCodeAt(0);

    // 1 byte
    if (charCode < 0x80) {
        return [
            charCode
        ];
    }
    // 2 bytes
    else if (charCode < 0x800) {
        return [
            0xc0 | (charCode >> 6),
            0x80 | (charCode & 0x3f)
        ];
    }
    // 3 bytes
    else if (charCode < 0xd800 || charCode >= 0xe000) {
        return [
            0xe0 | (charCode >> 12),
            0x80 | ((charCode >> 6) & 0x3f),
            0x80 | (charCode & 0x3f)
        ];
    }
    // 4 bytes (surrogate pair)
    else {
        // UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and splitting the 20 bits of 0x0-0xFFFFF into two halves
        charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (character.charCodeAt(1) & 0x3ff));
        return [
            0xf0 | (charCode >> 18),
            0x80 | ((charCode >> 12) & 0x3f),
            0x80 | ((charCode >> 6) & 0x3f),
            0x80 | (charCode & 0x3f)
        ];
    }
}

module.exports = {properEncodeURI, properEncodeURIComponent};