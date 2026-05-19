const { SlashCommandBuilder } = require('discord.js');
const RPService = require('../services/rpService');
const Member = require('../models/Member');
const Warning = require('../models/Warning');
const History = require('../models/History');
const Config = require('../models/Config');
const Role = require('../models/Role');
const { createEmbed } = require('../utils/discordUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adv')
        .setDescription('Aplica uma advertência a um membro')
        .addUserOption(option => option.setName('membro').setDescription('Membro a ser advertido').setRequired(true))
        .addStringOption(option => 
            option.setName('gravidade')
                .setDescription('Gravidade da advertência')
                .setRequired(true)
                .addChoices(
                    { name: 'Leve', value: 'LEVE' },
                    { name: 'Média', value: 'MEDIA' },
                    { name: 'Grave', value: 'GRAVE' }
                ))
        .addStringOption(option => option.setName('motivo').setDescription('Motivo da advertência').setRequired(true)),
    async execute(interaction, client) {
        const target = interaction.options.getUser('membro');
        const severity = interaction.options.getString('gravidade');
        const reason = interaction.options.getString('motivo');

        const canWarn = await RPService.canPerformAction(interaction, target.id, 'WARN');
        if (!canWarn) {
            return interaction.reply({ content: '❌ Você não tem permissão para advertir este membro.', ephemeral: true });
        }

        const targetMember = await Member.findOne({ guildId: interaction.guildId, discordId: target.id }).populate('currentRoleId');
        if (!targetMember) {
            return interaction.reply({ content: '❌ Este membro não está registrado no sistema.', ephemeral: true });
        }

        // Apply warning
        await Warning.create({
            guildId: interaction.guildId,
            memberId: target.id,
            executorId: interaction.user.id,
            reason,
            severity
        });

        let autoAction = "";
        if (severity === 'LEVE') {
            targetMember.warnings.light += 1;
            if (targetMember.warnings.light >= 3) {
                targetMember.warnings.light = 0;
                targetMember.warnings.medium += 1;
                autoAction = "⚠️ 3 Leves acumuladas! Convertido para 1 Média.";
            }
        } else if (severity === 'MEDIA') {
            targetMember.warnings.medium += 1;
        } else if (severity === 'GRAVE') {
            targetMember.warnings.heavy += 1;
        }

        // Check for medium warnings (2 mediums = demotion)
        if (targetMember.warnings.medium >= 2) {
            targetMember.warnings.medium = 0;
            // Automatic demotion logic
            const lowerRole = await Role.findOne({ 
                guildId: interaction.guildId, 
                level: { $lt: targetMember.currentRoleId ? targetMember.currentRoleId.level : 999 } 
            }).sort({ level: -1 });

            if (lowerRole) {
                const guildMember = await interaction.guild.members.fetch(target.id).catch(() => null);
                if (guildMember) {
                    if (targetMember.currentRoleId) await guildMember.roles.remove(targetMember.currentRoleId.discordRoleId).catch(() => {});
                    await guildMember.roles.add(lowerRole.discordRoleId).catch(() => {});
                    const nickname = `[${lowerRole.name}] ${targetMember.rpName} | ${targetMember.rpId}`;
                    await guildMember.setNickname(nickname).catch(() => {});
                }
                const oldRoleName = targetMember.currentRoleId ? targetMember.currentRoleId.name : 'Nenhum';
                targetMember.currentRoleId = lowerRole._id;
                autoAction = `📉 2 Médias acumuladas! Rebaixamento automático para ${lowerRole.name}.`;
                
                await History.create({
                    guildId: interaction.guildId,
                    type: 'REBAIXAMENTO',
                    memberId: target.id,
                    memberName: targetMember.rpName,
                    executorId: client.user.id,
                    executorName: 'Sistema Automático',
                    oldRole: oldRoleName,
                    newRole: lowerRole.name,
                    reason: 'Acúmulo de 2 advertências médias'
                });
            }
        }

        // Check for heavy warnings (1 heavy = expulsion)
        const config = await Config.findOne({ guildId: interaction.guildId });
        if (severity === 'GRAVE' && config && config.settings.autoExpulsion) {
            const guildMember = await interaction.guild.members.fetch(target.id).catch(() => null);
            if (guildMember) {
                // Remove all roles
                const allRoles = await Role.find({ guildId: interaction.guildId });
                for (const r of allRoles) {
                    await guildMember.roles.remove(r.discordRoleId).catch(() => {});
                }
                // Optional: Kick or just remove roles
                autoAction = "🚫 Advertência Grave! Expulsão automática realizada.";
                
                await History.create({
                    guildId: interaction.guildId,
                    type: 'EXPULSAO',
                    memberId: target.id,
                    memberName: targetMember.rpName,
                    executorId: client.user.id,
                    executorName: 'Sistema Automático',
                    reason: 'Advertência Grave (Auto-Expulsão)'
                });
            }
        }

        targetMember.history.push({
            action: 'ADVERTENCIA',
            details: `Recebeu advertência ${severity}. Motivo: ${reason}. ${autoAction}`,
            executorId: interaction.user.id
        });
        await targetMember.save();

        const embed = createEmbed(
            '⚠️ ADVERTÊNCIA APLICADA',
            `O membro <@${target.id}> recebeu uma advertência **${severity}**.\n\n**Motivo:** ${reason}\n${autoAction ? `\n**Ação Automática:** ${autoAction}` : ''}`,
            '#f1c40f'
        );

        await interaction.reply({ embeds: [embed] });

        // Log
        if (config && config.channels.logsAdvertencia) {
            const logChannel = interaction.guild.channels.cache.get(config.channels.logsAdvertencia);
            if (logChannel) {
                const logEmbed = createEmbed(
                    '⚠️ LOG: ADVERTÊNCIA',
                    `Advertência aplicada.`,
                    '#f1c40f',
                    [
                        { name: '👤 Membro', value: `<@${target.id}>`, inline: true },
                        { name: '⚡ Gravidade', value: severity, inline: true },
                        { name: '🛠️ Executor', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '📄 Motivo', value: reason, inline: false }
                    ]
                );
                logChannel.send({ embeds: [logEmbed] });
            }
        }
    },
};
