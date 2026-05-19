const { SlashCommandBuilder } = require('discord.js');
const Member = require('../models/Member');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('historico')
        .setDescription('Visualiza o histórico de um membro')
        .addUserOption(option => option.setName('membro').setDescription('Membro para ver o histórico').setRequired(true)),
    async execute(interaction, client) {
        const target = interaction.options.getUser('membro');
        
        const memberData = await Member.findOne({ guildId: interaction.guildId, discordId: target.id }).populate('currentRoleId');
        
        if (!memberData) {
            return interaction.reply({ content: '❌ Membro não encontrado no sistema.', ephemeral: true });
        }

        const history = memberData.history.slice(-10).reverse(); // Last 10 actions

        const embed = createEmbed(
            `📜 HISTÓRICO: ${memberData.rpName}`,
            `**ID:** ${memberData.rpId}\n**Cargo:** ${memberData.currentRoleId ? memberData.currentRoleId.name : 'Nenhum'}\n**Advertências:** L: ${memberData.warnings.light} | M: ${memberData.warnings.medium} | G: ${memberData.warnings.heavy}\n\n**Últimas Ações:**`,
            '#3498db'
        );

        if (history.length === 0) {
            embed.addFields({ name: 'Vazio', value: 'Nenhuma ação registrada ainda.' });
        } else {
            history.forEach(h => {
                embed.addFields({ 
                    name: `${h.action} - ${h.date.toLocaleDateString('pt-BR')}`, 
                    value: `${h.details}\n*Responsável: <@${h.executorId}>*` 
                });
            });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
