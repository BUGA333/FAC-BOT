const Config = require('../models/Config');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'staff_role_add_select',
    async execute(interaction, client) {
        const roleId = interaction.values[0];
        
        const config = await Config.findOne({ guildId: interaction.guildId }) || await Config.create({ guildId: interaction.guildId });
        
        if (!config.roles.staff.includes(roleId)) {
            config.roles.staff.push(roleId);
            await config.save();
        }

        const embed = createEmbed(
            '✅ STAFF ADICIONADO',
            `O cargo <@&${roleId}> foi adicionado como staff com sucesso!`
        );

        await interaction.update({ embeds: [embed], components: [] });
    }
};
