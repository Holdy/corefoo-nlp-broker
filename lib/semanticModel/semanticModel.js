


// Provides some abstract modeling (as opposed to named entities etc.)
// This will also be useful for
// 'some guy' > 'human male' > person

//'someone' > person

//'my friend' > user friend > friend > person

// This is to help with - 'Can you help me figure out what language some guy speaks'
// we need to change 'some guy' to  'human male' (definitive:true) - original 'some guy'
// When words are resolved to a model item, keep the original 'some guy' and meta 'definitive:true' etc.
// Define some resources.
// What language did Ghandi speak.

var tangibleThing = r('tangible thing');

var person =  r('person').subclassOf(tangibleThing);

var humanMale =  r('human male').subclassOf(person);

var humanFemale = r('human female').subclassOf(person);

var someGuy = r('some guy').subclassOf(humanMale);

var someGal = r('some gal').subclassOf(humanFemale);

function r(label) {
    return new Resource(label);

}

function Resource(id) {
    this.id = id;
    this.subclassOf = function(superclass) {
        if (superclass) {
            if (!this.superclasses) {
                this.superclasses = [];
            }
            this.superclasses.push(superclass);
            return this;
        }
    };
}

function find(words, callback) {

    if (words[0] == 'some' && words[1] == 'guy') {
        callback(null, [someGuy]);
    }

}

module.exports.find = find;
