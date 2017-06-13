const logger = require('./logger');

/**
 * Utils methods
 * @module Utils
 */
module.exports = {

    /**
     * Match every pattern into string
     * @param {string} pattern
     * @param {string} string
     * @return {Object|null}
     *
     * @example
     * utils.matchEvery('toto', 'toto, the must biger TOTO');
     *
     * @alias module:Utils
     */
    matchEvery: (pattern, string) => {
        return !!string.match(new RegExp(pattern, 'ig'));
    },

    /**
     * Match one time pattern into string
     * @param {string} pattern
     * @param {string} string
     * @return {Object|null}
     *
     * @example
     * utils.matchOne('tata', 'tata, the must biger toto');
     *
     * @alias module:Utils
     */
    matchOne: (pattern, string) => {
        return !!string.match(new RegExp(`^${pattern}$`, 'i'));
    },

    /**
     * Match exactly every pattern into string
     * @param {string} pattern
     * @param {string} string
     * @return {Object|null}
     *
     * @example
     * utils.matchExactlyEvery('toto', 'toto, the must biger toto');
     *
     * @alias module:Utils
     */
    matchExactlyEvery: (pattern, string) => {
        return !!string.match(new RegExp(pattern, 'g'));
    },

    /**
     * Match exactly pattern into string
     * @param {string} pattern
     * @param {string} string
     * @return {Object|null}
     *
     * @example
     * utils.matchExactlyOne('toto the big', 'toto this big');
     *
     * @alias module:Utils
     */
    matchExactlyOne: (pattern, string) => {
        return !!string.match(new RegExp(`^${pattern}$`));
    },

    /**
     * Match one of patterns into string
     * @param {Array<string>} patterns
     * @param {string} string
     * @return {boolean}
     *
     * @example
     * utils.matchOneOf(['toto', 'tata'], 'TOTO this big');
     *
     * @alias module:Utils
     */
    matchOneOf: (patterns, string) => {
        for (let i = 0; i < patterns.length; i++) {
            if (!!string.match(new RegExp(`${patterns[i]}`, 'ig'))) {
                return true;
            }
        }

        return false;
    },

    /**
     * Match exactly one of patterns into string
     * @param {Array<string>} patterns
     * @param {string} string
     * @return {boolean}
     *
     * @example
     * utils.matchOneOf(['toto', 'tata'], 'toto');
     *
     * @alias module:Utils
     */
    matchExactlyOneOf: (patterns, string) => {
        for (let i = 0; i < patterns.length; i++) {
            if (!!string.match(new RegExp(`^${patterns[i]}$`, 'g'))) {
                return true;
            }
        }

        return false;
    },

    /**
     * Get random on element from list
     * @param {Array} list
     * @return {*}
     *
     * @example
     * utils.getRandomlyOneOf(['toto', 'tata']);
     *
     * @alias module:Utils
     */
    getRandomlyOneOf: (list) => {
        return list[Math.floor(Math.random() * list.length)];
    },

    /**
     * Get random number between min and max
     * @param {number} max
     * @param {number} [min=1]
     * @return {number}
     *
     * @example
     * utils.random(10, 1);
     *
     * @alias module:Utils
     */
    random: (max, min = 1) => {
        return Math.floor((Math.random() * max) + min);
    }
};
