var guid = require('guid');

var intentType = require('../intentType');

function getCandidateResponse (interpretation, brokerContext, callback) {

    if (interpretation.intent.type === intentType.action && interpretation.intent.expression === 'new guid') {
        callback(null, {'text': guid.create().value});
    } else {
        callback();
    }
}

module.exports.getCandidateResponse = getCandidateResponse;
module.exports.name = 'coding';
