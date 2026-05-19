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
                const baseId = customId.split('_')[0];
                button = Array.from(client.buttons.values()).find(b => b.customId.startsWith(baseId) && b.dynamic);
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
                const baseId = customId.split('_')[0];
                modal = Array.from(client.modals.values()).find(m => m.customId.startsWith(baseId) && m.dynamic);
            }

            if (!modal) return;
            try {
                await modal.execute(interaction, client);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isStringSelectMenu()) {
            let customId = interaction.customId;
            let selectMenu = client.selectMenus.get(customId);

            if (!selectMenu) {
                const baseId = customId.split('_')[0];
                selectMenu = Array.from(client.selectMenus.values()).find(s => s.customId.startsWith(baseId) && s.dynamic);
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
