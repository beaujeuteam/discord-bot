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

    command: (command, string) => {
        const cmd = string.match(`^${command}`);

        if (cmd) {
            const result = [];
            for (prop in cmd) {
                if (prop !== '0' && prop !== 'input' && prop !== 'index') {
                    result.push(cmd[prop]);
                }
            }
            return result;
        }

        return null;
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
    },

    random: (max, min = 1) => {
        return Math.floor((Math.random() * max) + min);
    }
};
