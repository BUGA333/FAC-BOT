const Member = require('../models/Member');
const Role = require('../models/Role');
const History = require('../models/History');
const Config = require('../models/Config');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    customId: 'promote_select',
    dynamic: true,
    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const targetId = parts[2];
        const reason = decodeURIComponent(parts[3]);
        const newRoleId = interaction.values[0];

        const targetMember = await Member.findOne({ guildId: interaction.guildId, discordId: targetId }).populate('currentRoleId');
        const newRole = await Role.findById(newRoleId);
        
        if (!targetMember || !newRole) {
            return interaction.reply({ content: '❌ Erro ao processar promoção. Dados não encontrados.', ephemeral: true });
        }

        const oldRoleName = targetMember.currentRoleId ? targetMember.currentRoleId.name : 'Nenhum';
        const guildMember = await interaction.guild.members.fetch(targetId).catch(() => null);

        if (guildMember) {
            // Update roles
            if (targetMember.currentRoleId) {
                await guildMember.roles.remove(targetMember.currentRoleId.discordRoleId).catch(console.error);
            }
            await guildMember.roles.add(newRole.discordRoleId).catch(console.error);

            // Update nickname
            const nickname = `[${newRole.tag || newRole.name}] ${targetMember.rpName} | ${targetMember.rpId}`;
            await guildMember.setNickname(nickname).catch(console.error);
        }

        // Update DB
        targetMember.currentRoleId = newRole._id;
        targetMember.history.push({
            action: 'PROMOCAO',
            details: `Promovido de ${oldRoleName} para ${newRole.name}. Motivo: ${reason}`,
            executorId: interaction.user.id
        });
        await targetMember.save();

        // Global History
        await History.create({
            guildId: interaction.guildId,
            type: 'PROMOCAO',
            memberId: targetId,
            memberName: targetMember.rpName,
            executorId: interaction.user.id,
            executorName: interaction.user.tag,
            oldRole: oldRoleName,
            newRole: newRole.name,
            reason: reason
        });

        const embed = createEmbed(
            '✅ PROMOÇÃO REALIZADA',
            `<@${targetId}> foi promovido com sucesso para **${newRole.name}**!`,
            '#2ecc71'
        );

        await interaction.update({ embeds: [embed], components: [] });

        // Log
        const config = await Config.findOne({ guildId: interaction.guildId });
        if (config && config.channels.logsPromocao) {
            const logChannel = interaction.guild.channels.cache.get(config.channels.logsPromocao);
            if (logChannel) {
                const logEmbed = createEmbed(
                    '📈 LOG: PROMOÇÃO',
                    `Membro promovido.`,
                    '#2ecc71',
                    [
                        { name: '👤 Membro', value: `<@${targetId}>`, inline: true },
                        { name: '⬆️ Novo Cargo', value: newRole.name, inline: true },
                        { name: '🛠️ Executor', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '📄 Motivo', value: reason, inline: false }
                    ]
                );
                logChannel.send({ embeds: [logEmbed] });
            }
        }
    }
};
