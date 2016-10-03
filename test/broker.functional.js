var expect = require('chai').expect;

var broker = require('../broker');

broker.setProviders([broker.providers.congeniality]);
// Functional test sequence.

// Input "Given that I like football, formula 1 and iodine; what motor sports do i like?"
// Answer should involve formula 1.


// Rainbird
//   select countries (sublist)
//
// Rainbird-Broker-Interface
//
//    Get list of countries
//
// Broker
//    puts question on stack (with metadata) - non rainbird specific.
//
// user answers "Russia and London"
//
// broker recognises this as an answer and promotes London to England.

// similar to above scenario but with nonsense words.
// What are your favourite nonsense words 'Flibble', 'gawpage', 'cromulent'

describe('Broker', function() {

    describe('Greetings', function () {

        it('should hand off and get a greeting response correctly', function(done) {

            broker.setOutboundCallback(function (response) {
                expect(response.text).to.equal('Hi there');
                done();
            });

            broker.inbound({text:'Hello'});
        });


    });

});
