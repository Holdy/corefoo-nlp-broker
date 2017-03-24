
var intentType = require('./lib/intentType');
var textProcessor = require('./lib/textProcessor');
var intentActuator = require('./lib/intentActuator');
var outboundCallback = null;

var providerChain = null;
var providerChainTail = null;

var userData = {allowLogging:true};

var behaviour = {loggingActive: false};

function addProvider(item) {
    if (item != null) {
        var itemWrapper = {provider:item, next:null}
        if (providerChainTail === null) {
            providerChainTail = providerChain = itemWrapper;
        } else {
            providerChainTail.next = itemWrapper;
            providerChainTail = providerChainTail.next;
        }
    }

    return this;
}

function setOutboundCallback(callback) {
    outboundCallback = callback;
}


function output(outputData, callback) {
    if (outboundCallback) {

        if (!outputData.logging || behaviour.loggingActive) {
            outboundCallback(outputData, callback);
        } else if (callback) {
            callback();
        }

    }
}

function buildResponse(messageText, clientData) {
    return {
        text:   messageText,
        'clientData': clientData
    };
}

function getCandidateResponses(interpretation, context, callback) {
    getResponseImpl(interpretation, context, [], providerChain, callback);
}

function getResponseImpl(interpretation, context, responseList, providerNode, callback) {
    if (providerNode === null) {
        // end of the chain.
        callback(null, responseList);
    } else {

        providerNode.provider.getCandidateResponse(interpretation, context, function(err, result) {
            if (err) {

            } else {
                if (result != null) {
                    responseList.push(result);
                }
                getResponseImpl(interpretation, context, responseList, providerNode.next, callback);
            }
        });
    }
}

function inbound (data) {

    try {
        var inputText = data.text;

        var result = textProcessor.getIntent(inputText);

        if (!result.data.interpretations[0].intent) {
            result.data.interpretations[0].intent = {};
        }

        var context = {

            send: function (messageData, callback) {
                var response = buildResponse(messageData.text, data.clientData);
                if (messageData.logging) {
                    response.logging = true;
                }

                if (!response.logging || userData.allowLogging ) {
                    output(response, callback);
                } else if (callback) {
                    callback();
                }
            }
        };

        getCandidateResponses(result.data.interpretations[0], context, function(err, responseList) {

            if (responseList.length > 0) {
                var response = responseList[0];

                if (response.text) {
                    output(buildResponse(response.text, data.clientData));
                }

                if (response.execute) {
                    response.execute();
                }

                if (!response.text && !response.execute) {
                    // TODO - ERROR response had neither text or execute.
                }
            } else {
                output(buildResponse('NADA :poop:', data.clientData));
            }

        });

        // If we have begun a process - Eg Rainbird Query, the brokerContext
        // will specify that the 'driver' is the given Rainbird map (with queryID etc).

        // Driver will have conversation stack - specifying 'agent/driver' for each step.

    } catch (error) {
        var response = buildResponse('Catastrophic error!', data.clientData);
        response.debug = true;
        output(response);
    }
}


function create() { // futureproofing.
    return this;
}

var interface;
function getInterface() {
    if (!interface) {
        interface = {
            setBehaviour: function (name, value) {
                behaviour[name] = value;
            },
            getBehaviour: function(name) {
                return behaviour[name];
            }
        };
    }

    return interface;
}

module.exports.inbound = inbound;
module.exports.setOutboundCallback = setOutboundCallback;

module.exports.getInterface = getInterface;
module.exports.create = create;
module.exports.addProvider = addProvider;
module.exports.processQuery = intentActuator.processQuery;
module.exports.processFilter = intentActuator.processFilter;
module.exports.intentType = intentType;
module.exports.intentHelper = require('./lib/intentHelper');
module.exports.providers = require('./lib/provider/providers');

