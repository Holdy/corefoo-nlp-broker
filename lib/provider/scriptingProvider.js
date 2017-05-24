"strict on";

var request = require('superagent');
var async = require('async');
var intentType = require('../intentType');

var brokerInterface = null;
var discoUri;

var discoData = null;

function callEndpoint (url, callback) {
    request.get(url).end( callback );
}
function ensureDiscoData(callback) {
    if (discoData) {
        callback();
    } else {
        callEndpoint(discoUri, function(err, response) {
            if (err) {
                callback();
            } else {
                discoData = response.body.data;
            }
        });
    }
}

function getCandidateResponse (interpretation, brokerContext, callback) {

    var intent = interpretation.intent;
    var response = null;
    var input = interpretation.words.join(' ');
    ensureDiscoData(function(err) {
        if (err || !discoData) {
            callback();
        } else {
            var matchingAction = null;
            discoData.forEach(function(availableAction) {
                var variationOne = availableAction.verb + ' ' + availableAction.name;
                var variationTwo = availableAction.verb + ' the ' + availableAction.name;
                if (input === variationOne || input === variationTwo) {
                    matchingAction = availableAction;
                }
            });

            if (matchingAction) {
                var offer = {
                    execute: function(brokerContext, channelInterface) {
                        runAction(matchingAction, brokerContext, channelInterface);
                    }
                };
                callback(null, offer);
            } else if (input === 'what tests can i run') {

                var list = [];
                discoData.forEach(function(availableAction) {
                    if (availableAction.verb === 'run' && availableAction.name.indexOf('test') != -1) {
                        list.push(availableAction.name);
                    }
                });
                if (list && list.length > 0) {
                    var offer = {
                        execute: function(brokerContext, channelInterface) {
                            channelInterface.send({
                                'text': list.join('\n')
                            });
                        }
                    };
                    return callback(null, offer);
                } else {
                    callback();
                }

            } else {
                callback();
            }
        }
    });

    /*
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
    */
}

function runAction(action, brokerContext, channelInterface) {
    var baseUrl = discoUri.replace('/disco', '');
    var startUrl = baseUrl + action.startLink;

    callEndpoint(startUrl, function (err, result) {
        //TODO handle result error.
        if (err) {
            return channelInterface.send({
                text: 'Hmm, \'' + action.name + '\' failed to start.'
            });
        }
        // TODO  - test result.error.

        var data = result.body.data;
        var fullUpdateUrl = baseUrl + data.statusLink;
        runningJobMap[fullUpdateUrl] = {
            'data': data,
            'action': action,
            'brokerContext': brokerContext,
            'channelInterface': channelInterface
        };
        var message = {text:'Started - \'' + action.name + '\'.'};
        channelInterface.send(message, function(err) {
            // TODO - what happens if we don't have a send callback.
            if (!err) {
            }
        });


    });

}


var runningJobMap = {};
function setNextTimeout() {
    setTimeout(timerCallback, 2000);
}

setNextTimeout();

function pl(number, singular, other) {
    return number + ' ' + (number === 1 ? singular : other);
}


function handleErrors (dataWrapper) {
    if (!dataWrapper.errorsHandled && dataWrapper.data.errors.length > 0) {
        dataWrapper.errorsHandled = true;
        dataWrapper.data.errors.forEach(function(error) {
            var message = {'text': JSON.stringify(error, null ,3), style: 'code'};
            dataWrapper.channelInterface.send(message);

        });
    }
}

function handleTaskComplete(dataWrapper, itemCallback) {
    var errorCount = dataWrapper.data.errors.length;
    var taskCount = dataWrapper.data.total_tasks;
    dataWrapper.channelInterface.send({
        'text': '' + dataWrapper.action.name + ' - completed ' + pl(taskCount,'task','tasks') + ' with ' + pl(errorCount,'error.','errors.')
    }, function(err) {
        if (!err) {
            dataWrapper.completionHandled = true;
        } else {
            var x = 1;
        }

        itemCallback(err);
    });
}

function timerCallback() {
    var runningJobs = Object.keys(runningJobMap);

    async.each(runningJobs, function(runningJobUrl, itemCallback) {
        var dataWrapper = runningJobMap[runningJobUrl];
        if (dataWrapper.completionHandled) {
            //TODO remove these at some point.
            return itemCallback();
        }
        callEndpoint(runningJobUrl, function(err, endpointResult) {
            if (err) {
                /// TODO. and data.error
            } else {
                var updateData = endpointResult.body.data;
                dataWrapper.data = updateData;
                if (updateData.processed_tasks === updateData.total_tasks) {
                    handleTaskComplete(dataWrapper, itemCallback);
                    handleErrors(dataWrapper);
                } else {
                    dataWrapper.channelInterface.send({
                        'text': '' + dataWrapper.action.name + ' - ' + updateData.processed_tasks + '/' + updateData.total_tasks
                    });
                    itemCallback();
                }
            }

        });

    }, function(err) {
        // todo err.
        setNextTimeout();

    });

}

function create(discoUriValue) {
    discoUri = discoUriValue;
    return this;
}

function setBrokerInterface(value) {
    brokerInterface = value;
}

module.exports.create = create;
module.exports.getCandidateResponse = getCandidateResponse;
module.exports.setBrokerInterface = setBrokerInterface;
module.exports.name = 'scripting';
