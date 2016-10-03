



function isQuestion(intent) {
    if (intent.words && intent.words.length > 0 && (intent.words[0] === 'what' || intent.words[0] === 'which')) {
        return true;
    } else {
        return false;
    }
}


module.exports.isQuestion = isQuestion;
