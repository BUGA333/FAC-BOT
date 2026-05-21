const Request = require('../models/Request');
const Role = require('../models/Role');
const Member = require('../models/Member');
const History = require('../models/History');
const Config = require('../models/Config');
const { createEmbed } = require('../utils/discordUtils');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'setagem_',
    dynamic: true,
    async execute(interaction, client) {
        const customId = interaction.customId;
        const requestId = customId.split('_')[2];

        const request = await Request.findById(requestId).populate('roleId');
        if (!request) return interaction.reply({ content: '❌ Solicitação não encontrada!', ephemeral: true });

        if (customId.startsWith('setagem_approve')) {
            // Approval Logic
            const guildMember = await interaction.guild.members.fetch(request.userId).catch(() => null);
            if (!guildMember) return interaction.reply({ content: '❌ Membro não encontrado no servidor!', ephemeral: true });

            // Add role
            await guildMember.roles.add(request.roleId.discordRoleId).catch(console.error);
            
            // Add extra role if configured
            if (request.roleId.extraRoleId) {
                await guildMember.roles.add(request.roleId.extraRoleId).catch(console.error);
            }

            // Add auto-roles
            const config = await Config.findOne({ guildId: interaction.guildId });
            if (config && config.roles.autoRoles.length > 0) {
                await guildMember.roles.add(config.roles.autoRoles).catch(console.error);
            }

            // Change nickname: [TAG] Nome RP | ID
            const nickname = `[${request.roleId.tag || request.roleId.name}] ${request.rpName} | ${request.rpId}`;
            await guildMember.setNickname(nickname).catch(console.error);

            // Save to Member DB
            await Member.findOneAndUpdate(
                { guildId: interaction.guildId, discordId: request.userId },
                {
                    rpName: request.rpName,
                    rpId: request.rpId,
                    rpNumber: request.rpNumber,
                    currentRoleId: request.roleId._id,
                    $push: {
                        history: {
                            action: 'SETAGEM',
                            details: `Setado como ${request.roleId.name}`,
                            executorId: interaction.user.id
                        }
                    }
                },
                { upsert: true, new: true }
            );

            // Global History
            await History.create({
                guildId: interaction.guildId,
                type: 'SETAGEM',
                memberId: request.userId,
                memberName: request.rpName,
                executorId: interaction.user.id,
                executorName: interaction.user.tag,
                newRole: request.roleId.name
            });

            request.status = 'APPROVED';
            await request.save();

            const embed = createEmbed(
                '✅ SETAGEM APROVADA',
                `A setagem de <@${request.userId}> foi aprovada por <@${interaction.user.id}>.`,
                '#2ecc71'
            );

            await interaction.update({ embeds: [embed], components: [] });

            // Log to logs channel
            if (config && config.channels.logsSetagem) {
                const logChannel = interaction.guild.channels.cache.get(config.channels.logsSetagem);
                if (logChannel) {
                    const logEmbed = createEmbed(
                        '📝 LOG: SETAGEM',
                        `Membro setado com sucesso.`,
                        '#2ecc71',
                        [
                            { name: '👤 Membro', value: `<@${request.userId}>`, inline: true },
                            { name: '🎭 Cargo', value: request.roleId.name, inline: true },
                            { name: '🛠️ Executor', value: `<@${interaction.user.id}>`, inline: true }
                        ]
                    );
                    logChannel.send({ embeds: [logEmbed] });
                }
            }
        }

        if (customId.startsWith('setagem_refuse')) {
            // Refusal Logic - Show Modal for Reason
            const modal = new ModalBuilder()
                .setCustomId(`modal_refuse_reason_${requestId}`)
                .setTitle('Motivo da Recusa');

            const reasonInput = new TextInputBuilder()
                .setCustomId('refuse_reason')
                .setLabel('Motivo')
                .setPlaceholder('Explique por que a setagem foi recusada')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
            await interaction.showModal(modal);
        }
    }
};
