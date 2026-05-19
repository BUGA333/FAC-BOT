const Config = require('../models/Config');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'staff_role_remove_select',
    async execute(interaction, client) {
        const roleId = interaction.values[0];
        
        const config = await Config.findOne({ guildId: interaction.guildId });
        if (config) {
            config.roles.staff = config.roles.staff.filter(id => id !== roleId);
            await config.save();
        }

        const embed = createEmbed(
            '✅ STAFF REMOVIDO',
            `O cargo <@&${roleId}> foi removido da staff com sucesso!`
        );

        await interaction.update({ embeds: [embed], components: [] });
    }
};
