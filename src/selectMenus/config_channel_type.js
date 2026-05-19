const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'config_channel_type',
    async execute(interaction, client) {
        const type = interaction.values[0];
        
        const embed = createEmbed(
            '📺 SELECIONE O CANAL',
            `Por favor, selecione o canal que será usado para: **${type}**`
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId(`config_channel_set_${type}`)
                    .setPlaceholder('Selecione um canal...')
                    .addChannelTypes(ChannelType.GuildText)
            );

        await interaction.update({ embeds: [embed], components: [row] });
    }
};
