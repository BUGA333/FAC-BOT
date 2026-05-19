const Role = require('../models/Role');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'modal_rp_role_add',
    async execute(interaction, client) {
        const name = interaction.fields.getTextInputValue('role_name');
        const discordRoleId = interaction.fields.getTextInputValue('role_id');
        const level = parseInt(interaction.fields.getTextInputValue('role_level'));

        if (isNaN(level)) {
            return interaction.reply({ content: '❌ O nível hierárquico deve ser um número!', ephemeral: true });
        }

        try {
            await Role.create({
                guildId: interaction.guildId,
                name,
                discordRoleId,
                level
            });

            const embed = createEmbed(
                '✅ CARGO ADICIONADO',
                `O cargo **${name}** foi adicionado com sucesso!\nID: ${discordRoleId}\nNível: ${level}`
            );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erro ao adicionar cargo. Verifique se o nome já existe.', ephemeral: true });
        }
    }
};
