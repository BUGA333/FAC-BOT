const Role = require('../models/Role');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'rp_role_delete_select',
    async execute(interaction, client) {
        const roleId = interaction.values[0];

        try {
            const role = await Role.findByIdAndDelete(roleId);
            
            const embed = createEmbed(
                '✅ CARGO REMOVIDO',
                `O cargo **${role.name}** foi removido com sucesso!`
            );

            await interaction.update({ embeds: [embed], components: [] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erro ao remover cargo.', ephemeral: true });
        }
    }
};
