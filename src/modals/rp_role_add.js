const Role = require('../models/Role');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'modal_rp_role_add',
    async execute(interaction, client) {
        const name = interaction.fields.getTextInputValue('role_name');
        const discordRoleId = interaction.fields.getTextInputValue('role_id');
        const level = parseInt(interaction.fields.getTextInputValue('role_level'));
        const tag = interaction.fields.getTextInputValue('role_tag');
        const extraRoleId = interaction.fields.getTextInputValue('role_extra') || null;

        if (isNaN(level)) {
            return interaction.reply({ content: '❌ O nível hierárquico deve ser um número!', ephemeral: true });
        }

        try {
            await Role.create({
                guildId: interaction.guildId,
                name,
                discordRoleId,
                level,
                tag,
                extraRoleId
            });

            const embed = createEmbed(
                '✅ CARGO ADICIONADO',
                `O cargo **${name}** foi adicionado com sucesso!\nID: ${discordRoleId}\nNível: ${level}\nTag: [${tag}]${extraRoleId ? `\nCargo Extra: <@&${extraRoleId}>` : ''}`
            );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erro ao adicionar cargo. Verifique se o nome já existe.', ephemeral: true });
        }
    }
};
