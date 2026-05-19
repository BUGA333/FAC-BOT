const ConfigService = require('../services/configService');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'config_channel_set',
    dynamic: true,
    async execute(interaction, client) {
        const type = interaction.customId.replace('config_channel_set_', '');
        const channelId = interaction.values[0];

        await ConfigService.updateChannel(interaction.guildId, type, channelId);

        const embed = createEmbed(
            '✅ CANAL CONFIGURADO',
            `O canal para **${type}** foi configurado com sucesso para <#${channelId}>!`
        );

        await interaction.update({ embeds: [embed], components: [] });
    }
};
