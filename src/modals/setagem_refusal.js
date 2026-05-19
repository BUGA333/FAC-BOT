const Request = require('../models/Request');
const Config = require('../models/Config');
const History = require('../models/History');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'modal_refuse_reason',
    dynamic: true,
    async execute(interaction, client) {
        const requestId = interaction.customId.replace('modal_refuse_reason_', '');
        const reason = interaction.fields.getTextInputValue('refuse_reason');

        const request = await Request.findById(requestId);
        if (!request) return interaction.reply({ content: '❌ Solicitação não encontrada!', ephemeral: true });

        request.status = 'REFUSED';
        await request.save();

        const config = await Config.findOne({ guildId: interaction.guildId });

        // Global History
        await History.create({
            guildId: interaction.guildId,
            type: 'EXPULSAO', // Use a generic term or add REFUSAL
            memberId: request.userId,
            memberName: request.rpName,
            executorId: interaction.user.id,
            executorName: interaction.user.tag,
            reason: reason
        });

        const embed = createEmbed(
            '❌ SETAGEM RECUSADA',
            `A setagem de <@${request.userId}> foi recusada por <@${interaction.user.id}>.\n\n**Motivo:** ${reason}`,
            '#e74c3c'
        );

        await interaction.update({ embeds: [embed], components: [] });

        // Log to logs channel
        if (config && config.channels.logsSetagem) {
            const logChannel = interaction.guild.channels.cache.get(config.channels.logsSetagem);
            if (logChannel) {
                const logEmbed = createEmbed(
                    '📝 LOG: SETAGEM RECUSADA',
                    `Membro recusado.`,
                    '#e74c3c',
                    [
                        { name: '👤 Membro', value: `<@${request.userId}>`, inline: true },
                        { name: '🛠️ Executor', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '📄 Motivo', value: reason, inline: false }
                    ]
                );
                logChannel.send({ embeds: [logEmbed] });
            }
        }
    }
};
