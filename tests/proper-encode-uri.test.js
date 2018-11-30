const {properEncodeURI, properEncodeURIComponent} = require('../src/proper-encode-uri');

test('Test properEncodeURI', () => {
    expect(properEncodeURI('https://www.example.com/')).toBe('https://www.example.com/');
    expect(properEncodeURI('https://www.example.com/foo/bar')).toBe('https://www.example.com/foo/bar');
    expect(properEncodeURI('https://www.example.com?foo=bar')).toBe('https://www.example.com?foo=bar');
    expect(properEncodeURI('https://www.example.com#foobar')).toBe('https://www.example.com#foobar');
    expect(properEncodeURI('https://www.example.com')).toBe('https://www.example.com');
    expect(properEncodeURI('https://www.example.com:8080')).toBe('https://www.example.com:8080');
    expect(properEncodeURI('https://www.example.com:8080/foo/bar')).toBe('https://www.example.com:8080/foo/bar');

    expect(properEncodeURI('https://www.example.com/AZaz09;,/?:@&=+$-_.!~*\'()#')).toBe('https://www.example.com/AZaz09;,/?:@&=+$-_.!~*\'()#');
    expect(properEncodeURI('https://www.example.com/azAZäöüÄÖÜß')).toBe('https://www.example.com/azAZ%C3%A4%C3%B6%C3%BC%C3%84%C3%96%C3%9C%C3%9F');
});

test('Test properEncodeURI (multi byte characters)', () => {
    // 1 byte (carriage return)
    expect(properEncodeURI('\u000D')).toBe('%0D'); // ES5 Unicode escape sequence
    expect(properEncodeURI('\u{000D}')).toBe('%0D'); // ES6 Unicode escape sequence
    expect(properEncodeURI('\r')).toBe('%0D');
    // 2 byte (copyright sign)
    expect(properEncodeURI('\u00A9')).toBe('%C2%A9'); // ES5 Unicode escape sequence
    expect(properEncodeURI('\u{00A9}')).toBe('%C2%A9'); // ES6 Unicode escape sequence
    expect(properEncodeURI('©')).toBe('%C2%A9');
    // 3 byte (black circle with down arrow)
    expect(properEncodeURI('\u29ED')).toBe('%E2%A7%AD'); // ES5 Unicode escape sequence
    expect(properEncodeURI('\u{29ED}')).toBe('%E2%A7%AD'); // ES6 Unicode escape sequence
    expect(properEncodeURI('⧭')).toBe('%E2%A7%AD');
    // 4 byte (grinning face)
    expect(properEncodeURI('\uD83D\uDE00')).toBe('%F0%9F%98%80'); // ES5 Unicode escape sequence (surrogate pair)
    expect(properEncodeURI('\u{1F600}')).toBe('%F0%9F%98%80'); // ES6 Unicode escape sequence
    expect(properEncodeURI('😀')).toBe('%F0%9F%98%80');
});

test('Test properEncodeURI (character exceptions)', () => {
    testAllCharacters(
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
        ],
        unicodeCharacter => expect(properEncodeURI(unicodeCharacter)).not.toBe(unicodeCharacter),
        unicodeCharacter => expect(properEncodeURI(unicodeCharacter)).toBe(unicodeCharacter)
    );
});

test('Test properEncodeURIComponent', () => {
    expect(properEncodeURIComponent('AZaz09-_.!~*\'()')).toBe('AZaz09-_.!~*\'()');
    expect(properEncodeURIComponent('azAZäöüÄÖÜß;,/?:@&=+$#')).toBe('azAZ%C3%A4%C3%B6%C3%BC%C3%84%C3%96%C3%9C%C3%9F%3B%2C%2F%3F%3A%40%26%3D%2B%24%23');
});

test('Test properEncodeURIComponent (character exceptions)', () => {
    testAllCharacters(
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
        ],
        unicodeCharacter => expect(properEncodeURIComponent(unicodeCharacter)).not.toBe(unicodeCharacter),
        unicodeCharacter => expect(properEncodeURIComponent(unicodeCharacter)).toBe(unicodeCharacter)
    );
});

/**
 * Test all Unicode characters against the given handlers. If the characters is included in reservedCharacters the
 * exceptionHandler is used, otherwise the defaultHandler.
 *
 * @param reservedCharacters
 * @param defaultHandler
 * @param exceptionHandler
 */
function testAllCharacters(reservedCharacters, defaultHandler, exceptionHandler) {
    // The maximal number of Unicode characters are 2^16
    for (let i = 0; i < 1000; i++) {//65536
        const unicodeCharacter = String.fromCharCode(i);

        // Check for exceptions
        let isException = false;
        for (let j = 0; j < reservedCharacters.length; j++) {
            if (unicodeCharacter.match(reservedCharacters[j])) {
                isException = true;
                break;
            }
        }

        // Call handler
        if (isException) {
            exceptionHandler(unicodeCharacter);
        } else {
            defaultHandler(unicodeCharacter);
        }
    }
}
