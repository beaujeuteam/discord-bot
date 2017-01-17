module.exports = client => {

    /**
     * Response pong when someone says ping
     */
    client.on('message', message => {
        if (message.content.match(/ping/ig)) {
            message.reply('pong');
        }
    });
};
