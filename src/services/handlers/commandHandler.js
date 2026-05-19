const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('colors');

module.exports = (client) => {
    const commands = [];
    const commandsPath = path.join(__dirname, '..', '..', 'commands');
    
    if (!fs.existsSync(commandsPath)) return;

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            console.log(` [COMMANDS] Comando carregado: ${command.data.name}`.cyan);
        } else {
            console.warn(` [COMMANDS] O comando em ${filePath} está faltando "data" ou "execute".`.yellow);
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log(` [COMMANDS] Iniciando o registro de ${commands.length} comandos slash.`.blue);

            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );

            console.log(` [COMMANDS] ${data.length} comandos slash registrados com sucesso!`.green);
        } catch (error) {
            console.error(` [COMMANDS] Erro ao registrar comandos: ${error.message}`.red);
        }
    })();
};
