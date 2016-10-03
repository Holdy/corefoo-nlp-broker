"use strict";
var expect = require('chai').expect;

var intentType = require('../lib/intentType');
var tokenType = require('../lib/tokenType');
var textProcessor  = require('../lib/textProcessor');

describe('broker', function() {

    it('should split mixed camel case correctly', function(done) {
        var intent = textProcessor.getIntent('WhatHappensWhenI Die');
        expect(intent.data.interpretations[0].words).to.eql(['what','happens','when','i','die']);

        done();
    });

    it('should split camel case correctly', function(done) {
        var intent = textProcessor.getIntent('WhatHappensWhenIDie');
        expect(intent.data.interpretations[0].words).to.eql(['what','happens','when','i','die']);

        done();
    });

    it('should split camel case correctly - single letter final word', function(done) {
        var intent = textProcessor.getIntent('meMyselfAndI');
        expect(intent.data.interpretations[0].words).to.eql(['me','myself','and','i']);

        done();
    });

    it('should tokenize a phrase correctly', function(done) {
        var result = textProcessor.getIntent('What happens when i kick the bucket');
        expect(result.data.interpretations[0].words).to.eql(['what','happens','when','i','kick', 'the', 'bucket']);
        expect(result.data.interpretations[0].tokens[4].words).to.eql(['kick', 'the', 'bucket']);

        done();
    });

    it('should correctly build a list intent', function(done) {
        var result = textProcessor.getIntent('I like Croatia, Germany and Italy');
        expect(result.data.interpretations[0].words).to.eql(['i','like','croatia','germany','and','italy']);
        var intent = result.data.interpretations[0].intent;

        // TODO rdf resource.
        expect(intent.what[0]).to.eql({words:['croatia'], type:tokenType.namedEntity, 'rating': {words:['like']}});
        expect(intent.what[1]).to.eql({words:['germany'], type:tokenType.namedEntity, 'rating': {words:['like']}});
        expect(intent.what[2]).to.eql({words:['italy'],   type:tokenType.namedEntity, 'rating': {words:['like']}});
        expect(intent.who[0]).to.eql({words:['i']});
        expect(intent.type).to.equal(intentType.ratingList);

        done();
    });

    it('should correctly build a list intent - with possibleNouns', function(done) {
        var result = textProcessor.getIntent('I like groobfleeb and snorzels');
        expect(result.data.interpretations[0].words).to.eql(['i','like','groobfleeb','and','snorzels']);
        var intent = result.data.interpretations[0].intent;

        // TODO rdf resource.
        expect(intent.what[0]).to.eql({words:['groobfleeb'], type:tokenType.possibleNoun, 'rating': {words:['like']}});
        expect(intent.what[1]).to.eql({words:['snorzels'], type:tokenType.possibleNoun, 'rating': {words:['like']}});
        expect(intent.who[0]).to.eql({words:['i']});
        expect(intent.type).to.equal(intentType.ratingList);

        done();
    });

    var fakeContext = {

        getNamedEntity: function (words) {
            var result = null;
            if (words === 'groobfleeb and snorzels') {
                result = {type:tokenType.namedEntity};
            }
            return result;
        },
        isValidWord: function(word) {
            return word == 'i' ||
                    word == 'like' ||
                word == 'groobfleeb' ||
                    word == 'and' ||
                    word == 'snorzels';
        }
    };

    it('should correctly build a list intent - using context', function(done) {
        var result = textProcessor.getIntent('I like groobfleeb and snorzels', fakeContext);
        expect(result.data.interpretations[0].words).to.eql(['i','like','groobfleeb','and','snorzels']);
        var intent = result.data.interpretations[0].intent;

        // TODO rdf resource.
        expect(intent.what[0]).to.eql({words:['groobfleeb','and','snorzels'], type:tokenType.namedEntity, 'rating': {words:['like']}});
        expect(intent.who[0]).to.eql({words:['i']});
        expect(intent.type).to.equal(intentType.ratingList);

        done();
    });

    it('should correct run together words - using context dictionary', function(done) {
        var result = textProcessor.getIntent('ilike groobfleeb andsnorzels', fakeContext);
        expect(result.data.interpretations[0].words).to.eql(['i','like','groobfleeb','and','snorzels']);
        var intent = result.data.interpretations[0].intent;

        // TODO rdf resource.
        expect(intent.what[0]).to.eql({words:['groobfleeb','and','snorzels'], type:tokenType.namedEntity, 'rating': {words:['like']}});
        expect(intent.who[0]).to.eql({words:['i']});
        expect(intent.type).to.equal(intentType.ratingList);

        done();
    });


    it('should correctly build a mixed-type intent list', function(done) {
        var result = textProcessor.getIntent('I like Croatia, London and Iodine');
        expect(result.data.interpretations[0].words).to.eql(['i','like','croatia','london','and','iodine']);
        var intent = result.data.interpretations[0].intent;

        // TODO rdf resource.
        expect(intent.what[0]).to.eql({words:['croatia'], type:tokenType.namedEntity, 'rating': {words:['like']}});
        expect(intent.what[1]).to.eql({words:['london'],  type:tokenType.namedEntity, 'rating': {words:['like']}});
        expect(intent.what[2]).to.eql({words:['iodine'],  type:tokenType.namedEntity, 'rating': {words:['like']}});
        expect(intent.who[0]).to.eql({words:['i']});
        expect(intent.type).to.equal(intentType.ratingList);

        done();
    });

    it.skip('should parse question - generic subject', function(done) {
        var result = textProcessor.getIntent('what is the adult length of a neon tetra');
        expect(result.data.interpretations[0].words).to.eql(['what','is','the','adult','length','of','a','neon','tetra']);

        intent.target[0].to.eql({words:['a','neon','tetra']});
        intent.type == intentType.query;
        intent.expression = {value:'adult length'};
        done();
    });

    it('should parse question - definite subject - past', function(done) {
        var result = textProcessor.getIntent('how tall was abraham lincoln');
        expect(result.data.interpretations[0].words).to.eql(['how','tall','was','abraham','lincoln']);

        var intent = result.data.interpretations[0].intent;
        expect(intent.target[0]).to.eql({words:['abraham','lincoln'], type:tokenType.namedEntity});
        expect(intent.type).to.equal( intentType.query);
        expect(intent.expression).to.eql({value:'height'});
        done();
    });

    //TODO how tall was abraham lincoln when he was 12.

    it('should parse question - definite subject - present', function(done) {
        var result = textProcessor.getIntent('how tall is the empire state building');
        expect(result.data.interpretations[0].words).to.eql(['how','tall','is','the','empire', 'state', 'building']);

        var intent = result.data.interpretations[0].intent;
        expect(intent.target[0]).to.eql({words:['the','empire', 'state', 'building'], type:tokenType.namedEntity});
        expect(intent.type).to.equal(intentType.query);
        expect(intent.expression).to.eql({value:'height'});
        done();
    });

    it('should handle ambiguous named entities', function(done) {
        var result = textProcessor.getIntent('how tall is Anne Hathaway');
        expect(result.data.interpretations[0].words).to.eql(['how','tall','is','anne','hathaway']);

        var intent = result.data.interpretations[0].intent;
        expect(intent.target[0]).to.eql({words:['anne','hathaway'], type:tokenType.ambiguousNamedEntity});
        expect(intent.type).to.equal(intentType.query);
        expect(intent.expression).to.eql({value:'height'});

        //TODO could be disambiguated by is / was (while one is alive and one dead).
        done();
    });


    it.skip('should parse command - lights off', function(done) {
        var result = textProcessor.getIntent('turn the lights off');
        expect(result.data.interpretations[0].words).to.eql(['turn','the','lights','off']);

        intent.target[0].to.eql({words:['the','lights']});
        intent.type == intentType.action;
        intent.expression = {value: 'status=off'};
    });

    it.skip('should parse command - off lights', function(done) {
        var result = textProcessor.getIntent('turn off the lights');
        expect(result.data.interpretations[0].words).to.eql(['turn','off','the','lights']);

        intent.target[0].to.eql({words:['the','lights']});
        intent.type == intentType.action;
        intent.expression = {value: 'status=off'};
    });

    it.skip('should parse here/now time query', function(done) {
        var result = textProcessor.getIntent('what time is it');
        expect(result.data.interpretations[0].words).to.eql(['what','time','is','it']);

        expect(intent.when[0]).to.equal({concept: 'now'});
        expect(intent.where[0]).to.equal({concept:'here'});
        intent.type == intentType.query;
        intent.expression = {value:'time'};
    });

    it.skip('should parse here/then time query', function(done) {
        // in this case the when should be set to - reference.
        var result = textProcessor.getIntent('what time was it');
        expect(result.data.interpretations[0].words).to.eql(['what','time','was','it']);

        expect(intent.when[0]).to.equal({concept: 'reference'});
        expect(intent.where[0]).to.equal({concept:'here'});
        intent.type == intentType.query;
        intent.expression = {value:'time'};
    });

    //TODO "I am 56". previous question used to determine this is an age.
    //TODO "56" same as above.

    it.skip('should parse second-order time query', function(done) {
        var result = textProcessor.getIntent('what time is it where the kremlin is');
        expect(result.data.interpretations[0].words).to.eql(['what','time','is','it','where','the', 'kremlin','is']);

        expect(intent.when[0]).to.equal({concept: 'now'});
        expect(intent.where[0]).to.equal({recurse: 'where is the kremlin?'});
        intent.type == intentType.query;
        intent.expression = { value:'time' };
    });

    it.skip('should parse statement', function(done) {
        var result = textProcessor.getIntent('the kremlin is in russia');
        expect(result.data.interpretations[0].words).to.eql(['the','kremlin','is','in','russia']);

        expect(intent.when[0]).to.equal({concept: 'now'});
        expect(intent.where[0]).to.equal({words: ['russia']});
        expect(intent.what[0]).to.equal({words:['the', 'kremlin']});
        intent.type == intentType.statement;
        // TODO the kremlin was built by russia. (above doesn't capture 'in' properly).
    });

    it.skip('should parse question', function(done) {
        var result = textProcessor.getIntent('where should I go on holiday');
        expect(result.data.interpretations[0].words).to.eql(['where', 'should', 'i', 'go', 'on', 'holiday']);


        expect(intent.who[0]).to.eql({words:['i']});
        expect(intent.when[0]).to.equal({concept: 'now'});
        expect(intent.where[0]).to.equal({concept: '?'});
        expect(intent.purpose[0]).to.equal({words:['holiday']});
        intent.type == intentType.query; //TODO should implies a recommendation?
    });


    it('should parse meta questions', function(done) {
        var result = textProcessor.getIntent('whos online');
        var x  = 1;
        done();
    });

    it('should parse meta email question', function(done) {
        var result = textProcessor.getIntent('what email address do you have for abc');

        result = textProcessor.getIntent('whats the email address for abc');

        done();

    });


    it.skip('should parse a single word confirmation phrase', function(done) {
        var result = textProcessor.getIntent('yarp');
        expect(result.data.interpretations[0].words).to.eql(['yarp']);

        intent.type == intentType.confirmation;
        var interjection = intent.interjection[0];

        expect(interjection.words).to.eql(['yarp']);
        expect(interjection.tokens).to.eql([{g:'eg'}]);
    });

    it.skip('should parse a single word refutation phrase', function(done) {
        var result = textProcessor.getIntent('nope');
        expect(result.data.interpretations[0].words).to.eql(['nope']);

        intent.type == intentType.refutation;
        var interjection = intent.interjection[0];

        expect(interjection.words).to.eql(['nope']);
        expect(interjection.tokens).to.eql([{g:'eg'}]);
    });

    // intentType:query - expression, target, when, where.

 // is 'yarp' phrase tokenized correctly at end of sentence.
    // "I say yarp".

    // "Sure - sounds good"
    // Should handle more than one intent. 'Hi, I'm bob' (greeting + fact).

    // why is my phone signal so poor / rubbish.

    // which movies have will smith and jeff goldbloom been in together.
});
