module.exports = client => {

    client.on('message', message => {
        if (message.match(/amour/ig)) {
            message.react(':heart:');
        }
    });
}
