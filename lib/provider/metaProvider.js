var intentType = require('../intentType');

var brokerInterface = null;

function getCandidateResponse (interpretation, brokerContext, callback) {

    var intent = interpretation.intent;
    var response = null;

    if (intent.type === intentType.action && intent.target) {

        if (intent.target.length === 1 && intent.target[0].words[0] === 'logging') {
            if (intent.expression === 'status=off') {
                response = {execute:function() {
                    var currentStatus = brokerInterface.getBehaviour('loggingActive');
                    if (!currentStatus) {
                        brokerContext.send({text: 'Logging is already off.'});
                    } else {
                        brokerInterface.setBehaviour('loggingActive', false);
                        brokerContext.send({text: 'Logging is now off.'});
                    }
                }};
            } else if (intent.expression === 'status=on') {

                response = {execute:function() {
                    var currentStatus = brokerInterface.getBehaviour('loggingActive');
                    if (currentStatus) {
                        brokerContext.send({text: 'Logging is already on.'});
                    } else {
                        brokerInterface.setBehaviour('loggingActive', true);
                        brokerContext.send({text: 'Logging is now on.'});
                    }
                }};
            }
        }
    }

    callback(null, response);
}

function create() {
    return this;
}

function setBrokerInterface(value) {
    brokerInterface = value;
}
module.exports.getCandidateResponse = getCandidateResponse;
module.exports.create = create;
module.exports.setBrokerInterface = setBrokerInterface;
