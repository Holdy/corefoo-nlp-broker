
var intentType = require('./lib/intentType');
var textProcessor = require('./lib/textProcessor');
var intentActuator = require('./lib/intentActuator');
var outboundCallback = null;

var providers = [];
var providerChain = null;

function setProviders(providerArray) {
    providers = providerArray;
    var providerChainTail = null;

    providers.forEach(function(item) {
        if (providerChainTail === null) {
            providerChainTail = providerChain = {provider:item, next:null};
        } else {
            providerChainTail.next = {provider:item, next:null};
            providerChainTail = providerChainTail.next;
        }
    });
}

function setOutboundCallback(callback) {
    outboundCallback = callback;
}

var debugActive = true;

function output(outputData, callback) {
    if (outboundCallback) {

        if (!outputData.debug || debugActive) {
            outboundCallback(outputData, callback);
        } else if (callback) {
            callback();
        }

    }
}

function buildResponse(messageText, chatId) {
    return {
        text:   messageText,
        chatId: chatId
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
                var response = buildResponse(messageData.text, data.chatId);
                if (messageData.debug) {
                    response.debug = true;
                }
                output(response, callback);
            },
            clientData: data.clientData
        };

        getCandidateResponses(result.data.interpretations[0], context, function(err, responseList) {

            if (responseList.length > 0) {
                var response = responseList[0];

                if (response.text) {
                    output(buildResponse(response.text, data.chatId));
                }

                if (response.execute) {
                    response.execute();
                }

                if (!response.text && !response.execute) {
                    // TODO - ERROR response had neither text or execute.
                }
            } else {
                output(buildResponse('NADA :poop:', data.chatId));
            }

        });

        // If we have begun a process - Eg Rainbird Query, the brokerContext
        // will specify that the 'driver' is the given Rainbird map (with queryID etc).


        // Driver will have conversation stack - specifying 'agent/driver' for each step.

    } catch (error) {
        var response = buildResponse('Catastrophic error!', data.chatId);
        response.debug = true;
        output(response);
    }
}


function create() { // futureproofing.
    return this;
}
module.exports.create = create;
module.exports.inbound = inbound;
module.exports.setOutboundCallback = setOutboundCallback;
module.exports.setProviders = setProviders;
module.exports.processQuery = intentActuator.processQuery;
module.exports.processFilter = intentActuator.processFilter;
module.exports.intentType = intentType;
module.exports.intentHelper = require('./lib/intentHelper');
module.exports.providers = require('./lib/provider/providers');
