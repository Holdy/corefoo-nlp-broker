"strict on";

var lexicon = require('corefoo-nlp').lexicon;

var tokenType = require('./tokenType');

var actionHeads = {
    'turn' : {}
};

var actionTails = {
    'off' : {},
    'on' : {}
};

var clauseHead = {
    'to': {},
    'from': {},
    'near': {},
    'above': {},
    'below': {},
    'all':{},
    'from': {},
    'every':{},
    'some':{},
    'none':{},

    'in': {},
    'on': {},
    'of': {},
    'per': {},
    'with': {},
    'without': {},
    'over': {},
    'under': {},
    'between': {},
    'within': {},
    'after': {},
    'before': {},
    'inside': {},
    'outside': {}
}

var queryWords = {
    'who': {},
    'what': {},
    'when': {},
    'where': {},
    'why': {},
    'will': {},
    'wont': {},
    'won\'t': {},
    'did': {},
    'does': {},
    'is': {}

}

var articleHead = {
    'a' : {article: 'indefinite'},
    'the' : {'article':'definite'},
    'their' : {'article': 'definite'},
    'his' : {'article' : 'definite'},
    'her' : {'article': 'definite'}
};

var tenseMap = {
    'does': 'present',
    'did' : 'past',
    'will': 'future',
    'was' : 'past'
};

var standaloneEntity = {
    'i'        : {'article':'definite'},
    'me'       : {'article':'definite'},
    'you'      : {'article':'definite'},
    'him'      : {'article':'definite'},
    'her'      : {'article':'definite'},
    'she'      : {'article':'definite'},
    'he'       : {'article':'definite'},
    'it'       : {'article':'definite'},
    'someone'  : {'article':'indefinite'},
    'something': {'article':'indefinite'}
};

function tokenIsActionHead(token) {
    return actionHeads[token.words[0]];
}

function tokenIsActionTail(token) {
    return actionTails[token.words[0]];
}

function markingPass(tokens) {
    tokens.forEach(function(token) {
        if(standaloneEntity[token.words[0]]) {
            token.role[tokenType.standaloneEntity] = true;
            token.role[tokenType.entity] = true;
            var info = standaloneEntity[token.words[0]];
            if(info.article) {
                token.article[info.article] = true;
            }
            token.frozen = true;
        }

/*        var entityInfo = entity[token.words[0]];
        if (entityInfo) {
            token.role[tokenType.entity] = true;
            token.frozen = true;
        }
*/
        if (clauseHead[token.words[0]]) {
            token.frozen = true;
        }

        var articleHeadInfo = articleHead[token.words[0]];
        if (articleHeadInfo) {
            token.role[tokenType.articleHead] = true;
            if(articleHeadInfo.article) {
                token.article[articleHeadInfo.article] = true;
            }
        }

        if(queryWords[token.words[0]]) {
            token.role[tokenType.query] = true;
            token.frozen = true;
        }
        var tense = tenseMap[token.words[0]];
        if (tense) {
            token.tense[tense] = true;
            token.frozen = true;
        }

        var verb = lexicon.getVerbInfo(token.words[0]);
        if (verb) {
            token.role[tokenType.verb] = true;
            token.frozen = true;
        }
    });
}

function associateArticleHeads(tokens) {

    var index = 0;
    while (index < tokens.length - 1) {
        if (tokens[index].role[tokenType.articleHead]) {
            // next item becomes part of article
            tokens[index].role[tokenType.entity] = true;
            tokens[index].words.push(tokens[index+1].words[0]);
            removeTokenAt(tokens, index+1);
        }
        index++;
    }
}

function removeTokenAt(tokens, index) {
    tokens.splice(index, 1);
}

function parse (wordArray) {

    var tokens = wordArray.map(function(word) {
        return {words: [word], role: {}, tense:{}, article:{}};
    });

    var lastTokenIndex = tokens.length - 1;
    if (tokenIsActionHead(tokens[0])) {
        tokens[0].role[tokenType.actionHead] = true;
    }

    if (tokenIsActionTail(tokens[lastTokenIndex])) {
        tokens[lastTokenIndex].role[tokenType.actionTail] = true;
    }

    markingPass(tokens);

    associateArticleHeads(tokens);

    collapseNonFrozen(tokens);

    specialRules(tokens);

    return tokens;
}

function copyItemsInto(source, destination) {
    source.forEach(function(item) {
        destination.push(item);
    });
}

function specialRules(tokens) {
    if (tokens.length > 1) {
        var last = tokens.length - 1;
        if (tokens[last].role.verb && tokens[last-1].role.entity) {
            // verb token is probably part of the entity.
            copyItemsInto(tokens[last].words, tokens[last-1].words);
            removeTokenAt(tokens, last);
        }
    }


}

function collapseNonFrozen(tokens) { // Hopefully they are entities.
    var token;
    var i = 0;
    while(i < tokens.length) {
        token = tokens[i];
        if (token.frozen) {
            i++;
        } else {
            var nextIndex = i+1;
            if (nextIndex < tokens.length && !tokens[nextIndex].frozen) {
                // collapse the token.
                //todo what if it was multiple words?
                tokens[i].words.push(tokens[i+1].words[0]);
                removeTokenAt(tokens, i+1);
            } else {
                i += 2; // Skip the frozen token.
            }
        }
    }
}

module.exports.parse = parse;
