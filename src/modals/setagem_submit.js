const Role = require('../models/Role');
const Config = require('../models/Config');
const Request = require('../models/Request');
const { createEmbed, createButton } = require('../utils/discordUtils');
const { ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'modal_setagem_submit',
    dynamic: true,
    async execute(interaction, client) {
        const roleId = interaction.customId.replace('modal_setagem_submit_', '');
        const rpName = interaction.fields.getTextInputValue('rp_name');
        const rpId = interaction.fields.getTextInputValue('rp_id');
        const rpNumber = interaction.fields.getTextInputValue('rp_number');
        const recruiter = interaction.fields.getTextInputValue('rp_recruiter');

        const config = await Config.findOne({ guildId: interaction.guildId });
        if (!config || !config.channels.aprovacao) {
            return interaction.reply({ content: '❌ Canal de aprovação não configurado!', ephemeral: true });
        }

        const role = await Role.findById(roleId);
        if (!role) return interaction.reply({ content: '❌ Cargo não encontrado!', ephemeral: true });

        const approvalChannel = interaction.guild.channels.cache.get(config.channels.aprovacao);
        if (!approvalChannel) return interaction.reply({ content: '❌ Canal de aprovação não encontrado!', ephemeral: true });

        const request = await Request.create({
            guildId: interaction.guildId,
            userId: interaction.user.id,
            roleId: role._id,
            rpName,
            rpId,
            rpNumber,
            recruiter
        });

        const embed = createEmbed(
            '⏳ NOVA SOLICITAÇÃO DE SETAGEM',
            `Um usuário solicitou setagem na facção.`,
            '#f1c40f',
            [
                { name: '👤 Nome RP', value: rpName, inline: true },
                { name: '🆔 ID RP', value: rpId, inline: true },
                { name: '📞 Número RP', value: rpNumber, inline: true },
                { name: '🎭 Cargo', value: role.name, inline: true },
                { name: '🤝 Recrutador', value: recruiter, inline: true },
                { name: '💻 Usuário Discord', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true }
            ]
        );

        const row = new ActionRowBuilder()
            .addComponents(
                createButton(`setagem_approve_${request._id}`, 'Aprovar', ButtonStyle.Success, '✅'),
                createButton(`setagem_refuse_${request._id}`, 'Recusar', ButtonStyle.Danger, '❌')
            );

        // Save data temporarily in customId is limited (100 chars). 
        // Better to save a "Request" in DB and just pass the Request ID.
        // Let's create a Request model.
        
        await approvalChannel.send({ embeds: [embed], components: [row] });

        // Optional: Private thread
        if (config.settings.privateThread) {
            const thread = await approvalChannel.threads.create({
                name: `setagem-${rpName}`,
                autoArchiveDuration: 60,
                type: client.channels.cache.get(config.channels.aprovacao).type === 'GUILD_FORUM' ? undefined : 'GUILD_PRIVATE_THREAD',
            });
            await thread.send({ content: `Staff, analisem a setagem de <@${interaction.user.id}> aqui.` });
        }

        await interaction.reply({ content: '✅ Sua solicitação foi enviada para análise da staff!', ephemeral: true });
    }
};
