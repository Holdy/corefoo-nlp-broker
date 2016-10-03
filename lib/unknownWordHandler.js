function generateOptions(unknownWord, context) {
    var result = [];

    generateRunTogetherOptions(unknownWord, context, result);

    return result;
}

function generateRunTogetherOptions(unknownWord, context, list) {

    // Initially, we will just try and determine if two words have been runtogether.
    var i = 1;
    var firstWord = null;
    var secondWord = null;
    while (i < unknownWord.length) {
        firstWord = unknownWord.substring(0,i);
        secondWord = unknownWord.substring(i);

        if (context.isValidWord(firstWord) && context.isValidWord(secondWord)) {
            list.push([firstWord,secondWord]);
        }

        i++;
    }

}

module.exports.generateOptions = generateOptions;
