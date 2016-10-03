var expect = require('chai').expect;

var semanticModel = require('../lib/semanticModel/semanticModel');


describe('semanticModel', function() {

    describe('hierarchy', function() {

        it('should model some guy correctly', function(done) {

            semanticModel.find(['some','guy'], function(err, optionsList) {
                expect(err).to.not.be.ok;
                expect(optionsList[0].id).to.equal('some guy');
                done();
            });

        });

    });

});
