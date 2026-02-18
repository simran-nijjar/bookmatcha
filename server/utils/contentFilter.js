const filter = require('leo-profanity');

filter.loadDictionary('en');

const containsProfanity = (text) => {
    return filter.check(text);
};

module.exports = { containsProfanity };