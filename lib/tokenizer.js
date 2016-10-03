
var tokenType = require('./tokenType');

var die = {words: ['die']};
var yes = {words: ['yes']};
var no = {words: ['no']};
var me = {words:['me']};

var example = { type:tokenType.phrase, parent: die};

var phraseMap = {
    'yarp': {type:tokenType.phrase, parent: yes},
    'me myself and i': {type:tokenType.phrase, parent:me}
};
phraseMap ['kick the bucket'] = example;


var nameMap = {
    'the empire state building': {type:tokenType.namedEntity},
    'abraham lincoln' : {type:tokenType.namedEntity},
    'anne hathaway': {type:tokenType.ambiguousNamedEntity},
    'croatia': {type:tokenType.namedEntity},
    'italy':   {type:tokenType.namedEntity},
    'germany': {type:tokenType.namedEntity},
    'london':  {type:tokenType.namedEntity},
    'iodine':  {type:tokenType.namedEntity}

};

var nonNounMap = {'i':true,'like':true,'and':true};

function couldBeNoun (wordString) {
    var present = nonNounMap[wordString];
    return present == null;
}

function tokenize(wordArray, optionalContext) {
    var result = [];

    tokenizeImpl(result, wordArray, 0, wordArray.length - 1, optionalContext);

    return result;
}

function getWords(wordArray, start, end) {
    var result = [];
    for (var i = start; i <= end; i++) {
        result.push(wordArray[i]);
    }

    return result;
}

function formatWords(wordArray, start, end) {
    var result = '';
    for (var i = start; i <= end; i++) {
        if (result.length > 0) {
            result += ' ';
        }
        result += wordArray[i];
    }

    return result;
}

function getToken(words, optionalContext) {
    var result = phraseMap[words];

    if (result == null) {

        if (optionalContext) {
            result = optionalContext.getNamedEntity(words);
        }

        if (result == null) {
            result = nameMap[words];
        }
    }
    return result;
}

function tokenizeImpl(tokens, wordArray, start, end, optionalContext) {

    if(start >= wordArray.length) {
        // Finished.
    } else {
        var possibleToken = formatWords(wordArray,start, end);

        var token = getToken(possibleToken, optionalContext);
        if (token != null) {

            var tokenInstance = {type:token.type};
            if (token.parent) {
                tokenInstance.parent = token.parent;
            }
            tokenInstance.words = getWords(wordArray,start,end);

            tokens.push(tokenInstance);
            tokenizeImpl(tokens, wordArray, end + 1, wordArray.length - 1, optionalContext)
        } else  if (start != end) {
            // go one word less.
            tokenizeImpl(tokens, wordArray, start, end-1, optionalContext);
        } else {
            // single word.
            token = {'words': [wordArray[start]]};
            if (couldBeNoun(wordArray[start])) {
                token.type = tokenType.possibleNoun;
            }
            tokens.push(token);
            tokenizeImpl(tokens, wordArray, start + 1, wordArray.length -1, optionalContext);
        }
    }
}

module.exports.tokenize = tokenize;
