var intentType = require('../intentType');

function getCandidateResponse (interpretation, brokerContext, callback) {

    if (interpretation.intent.type === intentType.greetingInterjection) {
        callback(null, {'text': 'Hi there'});
    } else {
        callback();
    }

}

module.exports.getCandidateResponse = getCandidateResponse;

