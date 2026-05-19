const Config = require('../models/Config');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'auto_role_add_select',
    async execute(interaction, client) {
        const roleId = interaction.values[0];
        
        const config = await Config.findOne({ guildId: interaction.guildId }) || await Config.create({ guildId: interaction.guildId });
        
        if (!config.roles.autoRoles.includes(roleId)) {
            config.roles.autoRoles.push(roleId);
            await config.save();
        }

        const embed = createEmbed(
            '✅ CARGO AUTOMÁTICO ADICIONADO',
            `O cargo <@&${roleId}> será adicionado automaticamente em novas setagens!`
        );

        await interaction.update({ embeds: [embed], components: [] });
    }
};
