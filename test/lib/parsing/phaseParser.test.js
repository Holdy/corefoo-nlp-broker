var expect = require('chai').expect;

var tokenType = require('../../../lib/parsing/tokenType');
var parser = require('../../../lib/parsing/phaseParser');

describe('phaseParser', function() {

/*
    it('should handle split actions - turn logging on', function(done) {

        var tokens = parser.parse(['turn','logging','on']);

        expect(tokens[0].words[0]).to.equal('turn');
        expect(tokens[0].role[tokenType.actionHead]).to.be.ok;
        done();
    });
*/

    it('should - increase the volume', function(done) {
        var tokens = parser.parse(['increase','the','volume']);

        expect(tokens.length).to.equal(2);
        expectWords(tokens[0], 'increase');
        expectWords(tokens[1], 'the', 'volume');

        done();
    });

    it('should - handle virtualbox query', function(done) {
        var tokens = parser.parse(['list','virtual','machines']);

        expect(tokens.length).to.equal(2);
        expectWords(tokens[0], 'list');
        expectWords(tokens[1], 'virtual', 'machines');

        done();
    });


 //   give me a list of people.
    /*
    it('should - handle double entity', function(done) {
        var tokens = parser.parse(['I','am','going','to','vatican','city','next','september']);

        expect(tokens.length).to.equal(2);
        expectWords(tokens[0], 'increase');
        expectWords(tokens[1], 'the', 'volume');

        done();
    });
*/

    /*
    what is bobs title
    list everyones email address
*/
    it('should handle basic question - temp', function(done) {
        var tokens = parser.parse(['what','is','the','temperature', 'in', 'Paris']);

        expect(tokens.length).to.equal(5);
        expectWords(tokens[0], 'what');
        expectWords(tokens[1], 'is');
        expectWords(tokens[2], 'the', 'temperature');
        expectWords(tokens[3], 'in');
        expectWords(tokens[4], 'paris');

        done();
    });

    it('should - neon tetra', function(done) {
        var tokens = parser.parse(['what','is','the', 'adult','length','of','a','neon','tetra']);

        expect(tokens.length).to.equal(5);
        expectWords(tokens[0], 'what');
        expectWords(tokens[1], 'is');
        expectWords(tokens[2], 'the', 'adult','length');
        expectWords(tokens[3], 'of');
        expectWords(tokens[4], 'a','neon','tetra');

        done();
    });


    it('should handle basic question - create a knowledgemap', function(done) {
        var tokens = parser.parse(['create','a','new','knowledge','map']);

        expect(tokens.length).to.equal(2);
        expectWords(tokens[0], 'create');
        expectWords(tokens[1], 'a', 'new','knowledge','map'); // map shouldn't be a verb here.

        done();
    });

    it('should handle basic question - multi-part filter2', function(done) {
        var tokens = parser.parse(['list','all','knowledge','engineers','less','than','20','years','old']);

        expect(tokens.length).to.equal(3);
        expectWords(tokens[0], 'list');
        expectWords(tokens[1], 'all');
        expectWords(tokens[2], 'knowledge', 'engineers','less','than','20','years','old');

        done();
    });

    it('should handle basic question - multi-part filter', function(done) {
        var tokens = parser.parse(['list','all','knowledge','engineers','without','scars']);

        expect(tokens.length).to.equal(5);
        expectWords(tokens[0], 'list');
        expectWords(tokens[1], 'all');
        expectWords(tokens[2], 'knowledge','engineers');
        expectWords(tokens[3], 'without');
        expectWords(tokens[4], 'scars');

        done();
    });


    it('should handle basic question - amounts', function(done) {
        var tokens = parser.parse(['what','is','15', 'pounds', 'per', 'month',
        'over','twelve','years']);

        expect(tokens.length).to.equal(7);
        expectWords(tokens[0], 'what');
        expectWords(tokens[1], 'is');
        expectWords(tokens[2], '15', 'pounds');
        expectWords(tokens[3], 'per');
        expectWords(tokens[4], 'month');
        expectWords(tokens[5], 'over');
        expectWords(tokens[6], 'twelve', 'years');

        done();
    });

    it('should handle basic question - british map', function(done) {
        var tokens = parser.parse(['show','a','map','of','the','british','isles']);

        expect(tokens.length).to.equal(4);
        expectWords(tokens[0], 'show');
        expectWords(tokens[1], 'a', 'map');
        expectWords(tokens[2], 'of');
        expectWords(tokens[3], 'the','british','isles');

        done();
    });


    function expectWords(token, w0,w1,w2, w3, w4 ,w5, w6, w7)
    {
        w0 = w0.toLowerCase();
        expect(token.words[0].toLowerCase()).to.equal(w0)

        var expectedCount = 1;
        if (w1) {
            w1 = w1.toLowerCase();
            expectedCount++;
            if (w2) {
                w2 = w2.toLowerCase();
                expectedCount++;

                if (w3) {
                    w3 = w3.toLowerCase();
                    expectedCount++;
                    if(w4) {
                        w4 = w4.toLowerCase();
                        expectedCount++;
                        if (w5) {
                            w5 = w5.toLowerCase();
                            expectedCount++;
                            if (w6) {
                                expectedCount++;
                                w6= w6.toLowerCase();
                                if (w7) {
                                    throw new Error('not implemented');
                                }
                            }
                        }
                    }
                }
            }
        }

        expect(token.words.length).to.equal(expectedCount);

        expect(token.words[0].toLowerCase()).to.equal(w0);
        if (w1) {
            expect(token.words[1].toLowerCase()).to.equal(w1);
            if(w2){
                expect(token.words[2].toLowerCase()).to.equal(w2);
                if(w3) {
                    expect(token.words[3].toLowerCase()).to.equal(w3);
                    if (w4) {
                        expect(token.words[4].toLowerCase()).to.equal(w4);
                        if (w5) {
                            expect(token.words[5].toLowerCase()).to.equal(w5);
                            if (w6) {
                                expect(token.words[6].toLowerCase()).to.equal(w6);

                            }

                        }

                    }
                }
            }
        }
    }

    it('should mark tense - where does he live', function(done) {
        var tokens = parser.parse(['where','does','he', 'live']);

        expect(tokens.length).to.equal(4);
        expectWords(tokens[0], 'where');
        expectWords(tokens[1], 'does');
        expectWords(tokens[2], 'he');
        expectWords(tokens[3], 'live');
        done();
    });

    it('general test - i found a coat', function(done) {

        var tokens = parser.parse(['i','found','a', 'coat']);

        expect(tokens.length).to.equal(3);
        expectWords(tokens[0],'i');
        expectWords(tokens[1],'found');
        expectWords(tokens[2],'a', 'coat');
        done();
    });

    it('general test - what language does bob speak', function(done) {
        var tokens = parser.parse(['what','language','does', 'bob', 'speak']);

        expect(tokens.length).to.equal(5);
        expectWords(tokens[0], 'what');
        expectWords(tokens[1], 'language');
        expectWords(tokens[2], 'does');
        expectWords(tokens[3], 'bob');
        expectWords(tokens[4], 'speak');
        done();
    });
/*
    can you help me to figure out what language bob speaks
       first few words are preamble.
    i want to determine
    i want to figure out
    id like to know
*/
    it('general test - where was i last wednesday', function(done) {

        var tokens = parser.parse(['where','was','i', 'last', 'wednesday']);

        expect(tokens.length).to.equal(4);
        expectWords(tokens[0], 'where');
        expectWords(tokens[1], 'was');
        expectWords(tokens[2], 'i');
        expectWords(tokens[3], 'last', 'wednesday');

        done();
    });


    it('general test - where was jeff on wednesday', function(done) {

        var tokens = parser.parse(['where','was','jeff', 'on', 'wednesday']);

        expect(tokens.length).to.equal(5);
        expectWords(tokens[0], 'where');
        expectWords(tokens[1], 'was');
        expectWords(tokens[2], 'jeff');
        expectWords(tokens[3], 'on');
        expectWords(tokens[4], 'wednesday');

        done();
    });

});
