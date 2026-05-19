const Config = require('../models/Config');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'auto_role_remove_select',
    async execute(interaction, client) {
        const roleId = interaction.values[0];
        
        const config = await Config.findOne({ guildId: interaction.guildId });
        if (config) {
            config.roles.autoRoles = config.roles.autoRoles.filter(id => id !== roleId);
            await config.save();
        }

        const embed = createEmbed(
            '✅ CARGO AUTOMÁTICO REMOVIDO',
            `O cargo <@&${roleId}> foi removido da lista de cargos automáticos.`
        );

        await interaction.update({ embeds: [embed], components: [] });
    }
};
