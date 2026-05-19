const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'setagem_role_select',
    async execute(interaction, client) {
        const roleId = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_setagem_submit_${roleId}`)
            .setTitle('Detalhes da Setagem');

        const nameInput = new TextInputBuilder()
            .setCustomId('rp_name')
            .setLabel('Nome RP')
            .setPlaceholder('Ex: João Silva')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const idInput = new TextInputBuilder()
            .setCustomId('rp_id')
            .setLabel('ID RP')
            .setPlaceholder('Seu ID no servidor')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const numberInput = new TextInputBuilder()
            .setCustomId('rp_number')
            .setLabel('Número RP')
            .setPlaceholder('Seu telefone no servidor')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const recruiterInput = new TextInputBuilder()
            .setCustomId('rp_recruiter')
            .setLabel('Recrutador')
            .setPlaceholder('Quem te recrutou?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(idInput),
            new ActionRowBuilder().addComponents(numberInput),
            new ActionRowBuilder().addComponents(recruiterInput)
        );

        await interaction.showModal(modal);
    }
};
