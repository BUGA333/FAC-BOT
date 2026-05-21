const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, createButton } = require('../utils/discordUtils');
const { ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Abre o painel administrativo da facção')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const embed = createEmbed(
            '⚙️ PAINEL ADMINISTRATIVO',
            'Bem-vindo ao painel de controle da facção. Utilize os botões abaixo para configurar o bot e gerenciar os membros.'
        );

        const row1 = new ActionRowBuilder()
            .addComponents(
                createButton('admin_channels', 'Canais', ButtonStyle.Secondary, '📺'),
                createButton('admin_roles', 'Cargos Staff', ButtonStyle.Secondary, '🛡️'),
                createButton('admin_rp_roles', 'Cargos RP', ButtonStyle.Secondary, '🎭'),
                createButton('admin_settings', 'Configurações', ButtonStyle.Secondary, '🛠️')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                createButton('admin_setup_panel', 'Enviar Painel Setagem', ButtonStyle.Success, '📋'),
                createButton('admin_messages', 'Mensagens', ButtonStyle.Primary, '✉️'),
                createButton('admin_history', 'Histórico Global', ButtonStyle.Secondary, '📜')
            );

        await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });
    },
};
