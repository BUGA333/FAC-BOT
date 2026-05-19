const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const RPService = require('../services/rpService');
const Role = require('../models/Role');
const Member = require('../models/Member');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rebaixar')
        .setDescription('Rebaixa um membro da facção')
        .addUserOption(option => 
            option.setName('membro')
                .setDescription('Membro a ser rebaixado')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do rebaixamento')
                .setRequired(true)),
    async execute(interaction, client) {
        const target = interaction.options.getUser('membro');
        const reason = interaction.options.getString('motivo');

        const canDemote = await RPService.canPerformAction(interaction, target.id, 'DEMOTE');
        if (!canDemote) {
            return interaction.reply({ content: '❌ Você não tem permissão para rebaixar este membro ou sua hierarquia é insuficiente.', ephemeral: true });
        }

        const targetMember = await Member.findOne({ guildId: interaction.guildId, discordId: target.id }).populate('currentRoleId');
        if (!targetMember) {
            return interaction.reply({ content: '❌ Este membro não está registrado no sistema de facção.', ephemeral: true });
        }

        const availableRoles = await Role.find({ 
            guildId: interaction.guildId, 
            level: { $lt: targetMember.currentRoleId ? targetMember.currentRoleId.level : 999 } 
        }).sort({ level: -1 });

        if (availableRoles.length === 0) {
            return interaction.reply({ content: '❌ Não há cargos inferiores disponíveis para rebaixamento.', ephemeral: true });
        }

        const embed = createEmbed(
            '📉 REBAIXAMENTO',
            `Selecione o novo cargo para <@${target.id}>.\n\n**Membro:** ${targetMember.rpName} (${target.tag})\n**Cargo Atual:** ${targetMember.currentRoleId ? targetMember.currentRoleId.name : 'Nenhum'}\n**Motivo:** ${reason}`
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`demote_select_${target.id}_${encodeURIComponent(reason)}`)
                    .setPlaceholder('Selecione o novo cargo...')
                    .addOptions(availableRoles.map(r => ({ label: r.name, value: r._id.toString() })))
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};
