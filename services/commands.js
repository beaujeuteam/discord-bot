const logger = require('./logger');

class Commands {
    constructor() {
        this.commands = {};
    }

    /**
     * @param {boolean} [verbose=false]
     * @return {string}
     */
    help(verbose = false) {
        let result = 'Commands : \n\n';

        for (let group in this.commands) {
            result += `\n**${group}**\n\n`;

            for (let i = 0; i < this.commands[group].length; i++) {
                result += this.commands[group][i].toString(verbose) + '\n';
                result += verbose ? '---------\n' : '';
            }
        }

        return result;
    }

    /**
     * @param {Command} command
     */
    add(command) {
        if (!this.commands[command.group]) {
            this.commands[command.group] = [];
        }

        this.commands[command.group].push(command);
    }
}

const commands = new Commands();

/**
 * Command factory
 * @module Command
 *
 * @example
 * const { Command } = require('beaujeuteam-discord-bot/service/commands');
 *
 * const cmd = new Command('help [module]', 'Display module help', 'helper').option('-v', 'verbose', 'Display more info.');
 *
 * cmd.match(text, ({ module }, { verbose }) => {
 *  // do stuff
 * });
 */
class Command {

    /**
     * @param {string} command
     * @param {string} [description='']
     * @param {string} [group='default']
     *
     * @return {Command}
     *
     * @example
     * const cmd = new Command('play playlist [name] track <number>', 'Play music from Playlist');
     *
     * @alias module:Command
     */
    constructor(command, description = '', group = 'default') {
        const args = command.match(/\[(\w+)\]|<(\w+)>/g);
        let cmd = command.replace(/\[(\w+)\]/gi, '(?:"(.*)"|([^\\s ]+))');
        cmd = cmd.replace(/<(\w+)>/gi, '([0-9.,]+)');

        this.group = group;
        this.command = command;
        this.args = [];

        if (!!args) {
            this.args = args.map(arg => arg.replace(/\[|\]|<|>/g, ''));
        }

        this.regex = new RegExp(`^\/${cmd}( ?-[a-zA-Z0-9]| ?--[a-zA-Z0-9-_]+)*$`, 'i');
        this.options = [];
        this.description = description;

        commands.add(this);

        return this;
    }

    /**
     * Add option to command
     * @param {string} pattern
     * @param {string} name
     * @param {string} [description='']
     * @return {Command}
     *
     * @alias module:Command
     */
    option(pattern, name, description = '') {
        const optionName = name.replace('--', '');
        const regex = new RegExp(`${pattern}|--${optionName}`, 'gi');

        this.options.push({ pattern, regex, name: optionName, description });

        return this;
    }

    /**
     * Check if text match command pattern
     * @param {string} text
     * @param {Callable} callback
     *
     * @alias module:Command
     */
    match(text, callback) {
        const matches = text.match(this.regex);
        const options = {};
        const args = {};

        if (!!matches) {
            logger.debug(`Command ${this.command} matching with "${this.cleanMatch(matches).join()}"`);

            this.cleanMatch(matches).forEach((match, index) => {
                args[this.args[index]] = match;
            });

            this.options.forEach(({ regex, name }) => {
                options[name] = regex.test(text);
            });

            callback(args, options);
        }
    }

    /**
     * Utile, to clean matches
     * @param {Object} matches
     * @return {Array}
     *
     * @alias module:Command
     */
    cleanMatch(matches) {
        const result = [];
        for (let prop in matches) {
            if (prop !== '0' && prop !== 'input' && prop !== 'index' && !!matches[prop]) {
                result.push(matches[prop]);
            }
        }

        return result;
    }

    /**
     * Display command description with or without options
     * @param {boolean} [displayOptions=false]
     * @return {string}
     *
     * @alias module:Command
     */
    toString(displayOptions = false) {
        let options = this.options.map(({ pattern, name, description }) => `${pattern}, --${name} ${description}`);
        let result = ''

        if (displayOptions && options.length > 0) {
            result = `/${this.command} ${this.description}`;
            result += '\n\n Options : \n';

            for (let i = 0; i < options.length; i++) {
                result += `\n/${this.command} ${options[i]}`;
            }
        } else if (options.length > 0) {
            result = `/${this.command} [options] ${this.description}`;
        } else {
            result = `/${this.command} ${this.description}`;
        }

        return result;
    }
}

module.exports = { Command, commands };
