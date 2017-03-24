var textLib = require('./textlib');
var intentType = require('./intentType');
var tokenizer = require('./tokenizer');
var tokenType = require('./tokenType');
var unknownWordHandler = require('./unknownWordHandler');

function makeRawToken(word) {
    return {'word': word};
}

// (entity and phrase extraction).
function semanticTokenisation (words, optionalContext) {
    var interpretations = [];

    var interpretation = {'words': words};
    var tokens = tokenizer.tokenize(words, optionalContext);
    interpretation.tokens = tokens;

    interpretations.push(interpretation);

    return interpretations;
}

function fixUnknownWords (wordArray, optionalContext) {
    if (optionalContext) {
        // use the contexts dictionary to check words.
        for (var i = 0; i < wordArray.length; i++) {
            var word = wordArray[i];
            if (!optionalContext.isValidWord(word)) {
                var options = unknownWordHandler.generateOptions(word, optionalContext);
                if (options.length === 1) {
                    // use the option.
                    var option = options[0];
                    if (option.length === 1) {
                        wordArray[index] = options[0];
                    } else {
                        // replace word and insert.
                        wordArray[i] = option[0];
                        for (var wordIndex = 1 ; wordIndex < option.length; wordIndex++) {
                            wordArray.splice(i + wordIndex, 0, option[wordIndex]);
                        }
                    }
                }  else {
                    // leave the word as unknown. //TODO could mark unknown for complex object.
                }
            }
        }

    }
}

function getIntent(inputText, optionalContext) {

    // Split to words (if possible).
    inputText = inputText.replace(',','').replace('?','');
    var wordArray = textLib.splitWords(inputText);

    // fix mis-spellings.
    // if run together words only give on option - use it.
    fixUnknownWords(wordArray, optionalContext);

    // named extraction + phrasing ('kick the bucket').
    var tokenData = semanticTokenisation(wordArray, optionalContext);

    // Intent. ( may be clarification).
    // Intent may be mashed the keyboard.

    var intent = {data:{interpretations: tokenData}};
    formulateIntent(tokenData[0]);

    return intent;
}

function isList(tokens, start, end) {

    var notListableCount = 0;
    for (var i = start ;i <= end; i++) {
        var token = tokens[i];
        if (token.words[0] === 'and' || token.type === tokenType.namedEntity || token.type === tokenType.possibleNoun) {
            // can be a list.
        } else {
            notListableCount++;
            break;
        }
    }

    return notListableCount === 0;
}

function firstWords(interpretation, word1, word2, word3) {
    return interpretation.tokens[0].words[0] === word1 && interpretation.tokens[1].words[0] === word2 &&
        (!word3 || interpretation.tokens.length >= 3 && interpretation.tokens[2].words[0] === word3)
}

function formulateIntent(interpretation) {

    var lastWordIndex = interpretation.words.length - 1;

    if (interpretation.words.length === 1 ) {
        if (interpretation.tokens[0].words[0] === 'hello') {
            var intent = {};
            interpretation.intent = intent;
            intent.type = intentType.greetingInterjection;
        } else if (interpretation.tokens[0].words[0] === 'guid') {
            var intent = {};
            interpretation.intent = intent;
            intent.type = intentType.action;
            intent.expression = 'new guid';
        }
    } else if (interpretation.tokens.length > 2) {

        if (lastWordIndex === 2 && interpretation.words[0] === 'turn' &&
            interpretation.words[lastWordIndex] === 'off') {
            var intent = {};
            intent.target = [{'words': [interpretation.words[1]]}];
            intent.type = intentType.action;
            intent.expression = 'status=off';

            interpretation.intent = intent;
        } else if (lastWordIndex === 2 && interpretation.words[0] === 'turn' &&
            interpretation.words[lastWordIndex] === 'on') {
            var intent = {};
            intent.target = [{'words': [interpretation.words[1]]}];
            intent.type = intentType.action;
            intent.expression = 'status=on';

            interpretation.intent = intent;
        } else if (interpretation.tokens[0].words[0] === 'i' && interpretation.tokens[1].words[0] === 'like') {
            if (isList(interpretation.tokens, 2, interpretation.tokens.length - 1)) {
                var intent = {};
                interpretation.intent = intent;
                intent.who = [interpretation.tokens[0]];
                intent.what = [];

                for (var i = 2; i <= interpretation.tokens.length - 1; i++) {
                    var token = interpretation.tokens[i];
                    if (token.type === tokenType.namedEntity || token.type === tokenType.possibleNoun) {
                        intent.what.push({
                            words: token.words,
                            type: token.type,
                            rating: interpretation.tokens[1]
                        });
                    }
                }

                intent.type = intentType.ratingList;
            }
        } else if (firstWords(interpretation, 'list','everyones','title')) {
            var intent = {};
            interpretation.intent = intent;
            intent.type = intentType.query;
            intent.who = [{'concept': '*'}];
            intent.expression = 'title';
        }
        else if (firstWords(interpretation, 'list','everyones','email')) {
            var intent = {};
            interpretation.intent = intent;
            intent.type = intentType.query;
            intent.who = [{'concept': '*'}];
            intent.expression = 'email';
        } else if (firstWords(interpretation, 'how', 'tall')) {
            if (interpretation.tokens[2].words[0] === 'is' || interpretation.tokens[2].words[0] === 'was') {
                if (interpretation.tokens.length === 4) {
                    var intent = {};
                    interpretation.intent = intent;
                    intent.target = [interpretation.tokens[3]];
                    intent.type = intentType.query;

                    intent.when = {'concept': 'now'};
                    intent.expression = {'value': 'height'};
                }
            }
        } else if (firstWords(interpretation, 'whats', 'the', 'email','address', 'for') && interpretation.tokens.length === 6) {
            var intent = {};
            interpretation.intent = intent;
            intent.who = [{'token': interpretation.tokens[5]}];
            intent.type = intentType.query;
            intent.expression = 'email';
        } else if (interpretation.tokens[0].words[0] === 'whats' && interpretation.tokens[2].words[0] === 'title' && interpretation.tokens.length === 3) {
            var intent = {};
            interpretation.intent = intent;
            intent.who = [{'token': interpretation.tokens[1]}];
            intent.type = intentType.query;
            intent.expression = 'title';
        }
    } else if (firstWords(interpretation, 'whos','online')) {
        if (interpretation.tokens.length === 2) {
            var intent = {}
            interpretation.intent = intent;
            intent.who = [{'concept': '*'}];
            intent.type = intentType.filter;
            intent.expression = 'online=true';
        }
    } else if (firstWords(interpretation, 'whos','offline')) {
        if (interpretation.tokens.length === 2) {
            var intent = {};
            interpretation.intent = intent;
            intent.who = [{'concept': '*'}];
            intent.type = intentType.filter;
            intent.expression = 'online=false';
        };
    }
}

module.exports.getIntent = getIntent;
