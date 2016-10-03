
function filter(list, interpretation, callback) {
    if (interpretation.intent.expression === 'online=true') {
        var result = list.filter(function (item) {
            return item.online;
        });
        callback(null, result);
    } else if (interpretation.intent.expression === 'online=false') {
        var result = list.filter(function(item) {return !item.online;});
        callback(null, result);

    } else {
        callback(null, []);
    }
}

function query(list, interpretation, callback) {
    if (interpretation.intent.expression === 'email') {
        callback(null, list.map(function(item) {
            return {subject:item, relationship:'email', object:item.email};
        }));
    } else if (interpretation.intent.expression === 'title') {
        callback(null, list.map(function(item) {
            return {subject:item, relationship:'title', object:item.title};
        }));
    } else {
        callback(null, []);
    }
}

function getName(item) {
    return item.id ? item.id : item.fullName;
}

function processFilter(list, interpretation, callback) {

    filter(list, interpretation, function(err, filteredList) {
        if (err) return callback(err);

        callback(null, {text: filteredList.map(getName).join(', ')});

    });

}


function processQuery(list, interpretation, callback) {

    query(list, interpretation, function(err, factList) {
            if (err) return callback(err);

        var resultList = factList.map(function(fact) {
            return getName(fact.subject) + ' => ' + fact.object;
        });

        callback(null, {text: resultList.join('\n')});

    });
}

module.exports.processFilter = processFilter;
module.exports.processQuery = processQuery;
