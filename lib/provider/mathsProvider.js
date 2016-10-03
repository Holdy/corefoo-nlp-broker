var intentType = require('../intentType');

var digits = '0123456789';

function getNumberInfo (rawText) {
    var result = {numbers:[]};
    var currentNumber = null;
    var templateText = '';

    for (var i = 0 ; i < rawText.length; i++) {
        var c = rawText.substring(i,i+1);
        if (digits.indexOf(c) != -1) {
            if (currentNumber === null) {
                currentNumber = {text:c};
                result.numbers.push(currentNumber);
                templateText += '{number}';
            } else {
                currentNumber.text+=c;
            }
        } else {
            templateText+=c;
            currentNumber = null;
        }
    }

    result.textTemplate = templateText;
    return result;
}

function getCandidateResponse (interpretation, brokerContext, callback) {

    var rawText = interpretation.words.join(' ').replace(' for ', ' over ').replace(' a ', ' per ');
    var data = getNumberInfo(rawText);

    if (data.textTemplate === 'whats {number} per month over {number} years' ||
        data.textTemplate === 'whats {number} per month over {number} year' ||
        data.textTemplate === 'what is {number} per month over {number} years' ||
        data.textTemplate === 'what is {number} per month over {number} year' ||

        data.textTemplate === 'whats £{number} per month over {number} years' ||
        data.textTemplate === 'whats £{number} per month over {number} year' ||
        data.textTemplate === 'what is £{number} per month over {number} years' ||
        data.textTemplate === 'what is £{number} per month over {number} year' ||

    data.textTemplate === 'whats {number} pounds per month over {number} years' ||
    data.textTemplate === 'whats {number} pounds per month over {number} year' ||
    data.textTemplate === 'what is {number} pounds per month over {number} years' ||
    data.textTemplate === 'what is {number} pounds per month over {number} year'
    ) {
        var result = Number(data.numbers[0].text) * 12 * Number(data.numbers[1].text);
        callback(null, {text: 'That is ' + result});

    } else {
        callback();
    }

}

module.exports.getCandidateResponse = getCandidateResponse;
