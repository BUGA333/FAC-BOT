const Config = require('../models/Config');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'modal_admin_messages',
    async execute(interaction, client) {
        const title = interaction.fields.getTextInputValue('setagem_title');
        const description = interaction.fields.getTextInputValue('setagem_desc');

        try {
            await Config.findOneAndUpdate(
                { guildId: interaction.guildId },
                { 
                    $set: { 
                        'messages.setagemTitle': title,
                        'messages.setagemDescription': description
                    } 
                },
                { upsert: true }
            );

            const embed = createEmbed(
                '✅ MENSAGENS ATUALIZADAS',
                'As mensagens do painel de setagem foram atualizadas com sucesso!\n\nUse o botão **Enviar Painel Setagem** no `/admin` para ver as mudanças.',
                '#2ecc71'
            );

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erro ao salvar as mensagens.', ephemeral: true });
        }
    }
};
