const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Role = require('../models/Role');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'request_setagem',
    async execute(interaction, client) {
        const roles = await Role.find({ guildId: interaction.guildId }).sort({ level: 1 });

        if (roles.length === 0) {
            return interaction.reply({ content: '❌ Nenhum cargo RP configurado no sistema. Contate um administrador.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_setagem_request')
            .setTitle('Solicitação de Setagem');

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

        // We can't put a select menu in a modal, so we'll have to ask for the role in another step or as a text input.
        // The user specifically asked for "O campo 'Cargo' deve ser dinâmico baseado nos cargos cadastrados".
        // Since modals only support text inputs, I'll use a text input for role name and validate it, 
        // OR better: show a select menu FIRST to choose the role, THEN the modal.
        // Let's do: Select Menu for Role -> Modal for Details.

        const row1 = new ActionRowBuilder().addComponents(nameInput);
        const row2 = new ActionRowBuilder().addComponents(idInput);
        const row3 = new ActionRowBuilder().addComponents(numberInput);
        const row4 = new ActionRowBuilder().addComponents(recruiterInput);
        
        // I'll add a dummy field for Cargo for now or just use the select menu approach.
        // Actually, I'll use a select menu to start the process.
        
        const embed = createEmbed('📋 ESCOLHA SEU CARGO', 'Selecione o cargo para o qual você está sendo setado.');
        const selectRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('setagem_role_select')
                    .setPlaceholder('Selecione seu cargo...')
                    .addOptions(roles.map(r => ({ label: r.name, value: r._id.toString() })))
            );

        await interaction.reply({ embeds: [embed], components: [selectRow], ephemeral: true });
    }
};
