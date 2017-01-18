module.exports = {

    matchEvery: (pattern, string) => {
        return !!string.match(new RegExp(pattern, 'ig'));
    },

    matchOne: (pattern, string) => {
        return !!string.match(new RegExp(`^${pattern}$`, 'i'));
    },

    matchExactlyEvery: (pattern, string) => {
        return !!string.match(new RegExp(pattern, 'g'));
    },

    matchExactlyOne: (pattern, string) => {
        return !!string.match(new RegExp(`^${pattern}$`));
    },

    matchOneOf: (patterns, string) => {
        for (let i = 0; i < patterns.length; i++) {
            if (!!string.match(new RegExp(`${patterns[i]}`, 'ig'))) {
                return true;
            }
        }

        return false;
    },

    matchExactlyOneOf: (patterns, string) => {
        for (let i = 0; i < patterns.length; i++) {
            if (!!string.match(new RegExp(`^${patterns[i]}$`, 'g'))) {
                return true;
            }
        }

        return false;
    },

    getRandomlyOneOf: (list) => {
        return list[Math.floor(Math.random() * list.length)];
    }
};
