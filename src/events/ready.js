const { Events, ActivityType } = require('discord.js');
require('colors');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(` [READY] Bot logado como ${client.user.tag}`.green);
        client.user.setActivity('Gerenciamento de Facção', { type: ActivityType.Watching });
    },
};
