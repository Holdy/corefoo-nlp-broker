var intentType = require('../intentType');

var brokerInterface = null;

function getCandidateResponse (interpretation, brokerContext, callback) {

    var intent = interpretation.intent;
    var response = null;
    var words = interpretation.words.join(' ');

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
    } else if (words === 'ip') {
        var list = getIPList();
        if (list.length === 0 ) {
            response = {text: 'Could not find any active ip addresses.'};
        } else {
            response = {text: 'Found: ' + list.join(', ')};
        }
    }

    callback(null, response);
}

var os = require('os');
var ifaces = os.networkInterfaces();

function getIPList() {
    var result = [];
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                result.push(iface.address);
            } else {
                result.push(iface.address);
            }
            ++alias;
        });
    });

    return result;
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
module.exports.name = 'meta';
