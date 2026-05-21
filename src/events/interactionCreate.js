const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            // Check for dynamic buttons (like approving/refusing with IDs in customId)
            let customId = interaction.customId;
            let button = client.buttons.get(customId);

            // Handle dynamic custom IDs (e.g., "approve_12345")
            if (!button) {
                button = Array.from(client.buttons.values()).find(b => b.dynamic && customId.startsWith(b.customId));
            }

            if (!button) return;
            try {
                await button.execute(interaction, client);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isModalSubmit()) {
            let customId = interaction.customId;
            let modal = client.modals.get(customId);

            if (!modal) {
                modal = Array.from(client.modals.values()).find(m => m.dynamic && customId.startsWith(m.customId));
            }

            if (!modal) return;
            try {
                await modal.execute(interaction, client);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isAnySelectMenu()) {
            let customId = interaction.customId;
            let selectMenu = client.selectMenus.get(customId);

            if (!selectMenu) {
                selectMenu = Array.from(client.selectMenus.values()).find(s => s.dynamic && customId.startsWith(s.customId));
            }

            if (!selectMenu) return;
            try {
                await selectMenu.execute(interaction, client);
            } catch (error) {
                console.error(error);
            }
        }
    },
};
