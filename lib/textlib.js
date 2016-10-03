
function isWhitespace(char) {
    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

function analyseString (text) {

    text = text.replace(',','');

    var result = {whitespaceCount: 0,
        capitalAfterNoncapital:0};

    var lastWasCapital = false;
    var index = 0;
    var lastIndex = text.length - 1;
    var char;

    while (index <= lastIndex){
        char = text.charAt(index);
        if (isWhitespace(char)) {
            result.whitespaceCount++;
        } else if (isUppercase(char)) {
            if (!lastWasCapital && index > 0 ) {
                result.capitalAfterNoncapital++;
            }
            lastWasCapital = true;
        } else {
            lastWasCapital = false;
        }
        index++;
    }
    return result;
}

// This will only be called with text that has no spaces,
// thus we only need to split on lower to upper character.
function extractCamelCase_old(inputText, output) {
    var lastIndex = inputText.length - 1;
    var index = 0;
    var currentWordStart = 0;
    var lastWasLower = 0;
    var char;
    while (index <= lastIndex) {
        char = inputText.charAt(index);

        if (index > 0 && isUppercase(char) && lastWasLower) {
            // word ended.
            output.push(inputText.substring(currentWordStart, index).toLowerCase());
            currentWordStart = index;
        }

        lastWasLower = !isUppercase(char);
        index++;
    }

    output.push(inputText.substring(currentWordStart).toLowerCase());
}

// This will only be called with text that has no spaces,
// thus we only need to split on lower to upper character.
function extractCamelCase(inputText, output) {
    var lastIndex = inputText.length - 1;
    var index = 0;
    var currentWordStart = 0;
    var unprocessedLetterCount = 0;
    var char;
    while (index <= lastIndex) {
        char = inputText.charAt(index);

        if (isUppercase(char)) {
            // start a new word.
            if (index > 0) {
                // store old word.
                output.push(inputText.substring(currentWordStart,index).toLowerCase());
            }
            currentWordStart = index;
        }
        index++;
    }

    output.push(inputText.substring(currentWordStart).toLowerCase());
}


// Get the words (without punctuation) from text.
// any apostrophies present will be left in.
function extractWords(inputText, output) {
    if (inputText !== '') {
        var stats = analyseString(inputText);
        var result = [];
        if (stats.whitespaceCount > 0) {
            var tokens = inputText.match(/\S+/g) || [];
            tokens.forEach(function(token) {
                extractWords(token, output);
            });
        } else if (stats.capitalAfterNoncapital > 0) {
            extractCamelCase(inputText, output);
        } else {
            output.push(inputText.toLowerCase());
        }
    }
}


function isUppercase(char) {
    return char === char.toUpperCase();
}

function splitOnCamelcase(word, result) {
    result.push(word);
    return;
}

function splitWords(text) {
    var result = [];
    extractWords(text, result);

    return result;
}

function capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.substring(1);
}

module.exports.capitalizeFirstLetter = capitalizeFirstLetter
module.exports.splitWords = splitWords;
