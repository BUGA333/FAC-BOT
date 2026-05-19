const { createEmbed, createButton } = require('../utils/discordUtils');
const { ActionRowBuilder, ButtonStyle, StringSelectMenuBuilder, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Config = require('../models/Config');

module.exports = {
    customId: 'admin',
    dynamic: true,
    async execute(interaction, client) {
        const customId = interaction.customId;

        if (customId === 'admin_channels') {
            const embed = createEmbed('📺 CONFIGURAÇÃO DE CANAIS', 'Selecione qual canal você deseja configurar.');
            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('config_channel_type')
                        .setPlaceholder('Selecione o tipo de canal...')
                        .addOptions([
                            { label: 'Canal de Setagem', value: 'setagem', description: 'Onde o painel fixo será enviado' },
                            { label: 'Canal de Aprovação', value: 'aprovacao', description: 'Onde a staff aprova/recusa' },
                            { label: 'Logs de Setagem', value: 'logsSetagem', description: 'Histórico de setagens' },
                            { label: 'Logs de Promoção', value: 'logsPromocao', description: 'Histórico de promoções' },
                            { label: 'Logs de Rebaixamento', value: 'logsRebaixamento', description: 'Histórico de rebaixamentos' },
                            { label: 'Logs de Advertência', value: 'logsAdvertencia', description: 'Histórico de advertências' },
                            { label: 'Logs de Configuração', value: 'logsConfig', description: 'Histórico de mudanças no bot' }
                        ])
                );
            await interaction.update({ embeds: [embed], components: [row] });
        }

        if (customId === 'admin_setup_panel') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            if (!config || !config.channels.setagem) {
                return interaction.reply({ content: '❌ O canal de setagem não está configurado!', ephemeral: true });
            }

            const channel = interaction.guild.channels.cache.get(config.channels.setagem);
            if (!channel) return interaction.reply({ content: '❌ Canal de setagem não encontrado!', ephemeral: true });

            const embed = createEmbed(config.messages.setagemTitle, config.messages.setagemDescription, '#2f3136');
            const row = new ActionRowBuilder()
                .addComponents(createButton('request_setagem', 'SOLICITAR SETAGEM', ButtonStyle.Success, '📝'));

            await channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: '✅ Painel de setagem enviado com sucesso!', ephemeral: true });
        }

        if (customId === 'admin_rp_roles') {
            const embed = createEmbed('🎭 GERENCIAMENTO DE CARGOS RP', 'Escolha uma ação para gerenciar os cargos da facção.');
            const row = new ActionRowBuilder()
                .addComponents(
                    createButton('rp_role_add', 'Adicionar Cargo', ButtonStyle.Success, '➕'),
                    createButton('rp_role_remove', 'Remover Cargo', ButtonStyle.Danger, '➖'),
                    createButton('rp_role_list', 'Listar Cargos', ButtonStyle.Primary, '📋')
                );
            await interaction.update({ embeds: [embed], components: [row] });
        }

        if (customId === 'rp_role_add') {
            const modal = new ModalBuilder()
                .setCustomId('modal_rp_role_add')
                .setTitle('Adicionar Cargo RP');

            const nameInput = new TextInputBuilder()
                .setCustomId('role_name')
                .setLabel('Nome do Cargo')
                .setPlaceholder('Ex: Recruta')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const roleIdInput = new TextInputBuilder()
                .setCustomId('role_id')
                .setLabel('ID do Cargo no Discord')
                .setPlaceholder('Copie o ID do cargo do servidor')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const levelInput = new TextInputBuilder()
                .setCustomId('role_level')
                .setLabel('Nível Hierárquico (Número)')
                .setPlaceholder('Ex: 1 (Menor nível)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(roleIdInput),
                new ActionRowBuilder().addComponents(levelInput)
            );

            await interaction.showModal(modal);
        }

        if (customId === 'rp_role_list') {
            const Role = require('../models/Role');
            const roles = await Role.find({ guildId: interaction.guildId }).sort({ level: -1 });

            if (roles.length === 0) {
                return interaction.reply({ content: '❌ Nenhum cargo RP cadastrado.', ephemeral: true });
            }

            const embed = createEmbed(
                '📋 LISTA DE CARGOS RP',
                roles.map(r => `**${r.level}** - ${r.name} (<@&${r.discordRoleId}>)`).join('\n')
            );

            await interaction.update({ embeds: [embed], components: [] });
        }

        if (customId === 'rp_role_remove') {
            const Role = require('../models/Role');
            const roles = await Role.find({ guildId: interaction.guildId }).sort({ level: -1 });

            if (roles.length === 0) {
                return interaction.reply({ content: '❌ Nenhum cargo RP para remover.', ephemeral: true });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('rp_role_delete_select')
                        .setPlaceholder('Selecione o cargo para remover...')
                        .addOptions(roles.map(r => ({ label: r.name, value: r._id.toString() })))
                );

            await interaction.update({ components: [row] });
        }

        if (customId === 'admin_roles') {
            const embed = createEmbed('🛡️ GERENCIAMENTO DE CARGOS', 'Selecione uma ação para gerenciar os cargos do servidor.');
            const row = new ActionRowBuilder()
                .addComponents(
                    createButton('staff_role_add', 'Add Staff', ButtonStyle.Success, '🛡️'),
                    createButton('staff_role_remove', 'Remover Staff', ButtonStyle.Danger, '🛡️'),
                    createButton('auto_role_add', 'Add AutoRole', ButtonStyle.Primary, '🤖'),
                    createButton('auto_role_remove', 'Remover AutoRole', ButtonStyle.Secondary, '🤖')
                );
            await interaction.update({ embeds: [embed], components: [row] });
        }

        if (customId === 'auto_role_add') {
            const row = new ActionRowBuilder()
                .addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId('auto_role_add_select')
                        .setPlaceholder('Selecione o cargo automático...')
                );
            await interaction.update({ components: [row] });
        }

        if (customId === 'auto_role_remove') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            if (!config || config.roles.autoRoles.length === 0) {
                return interaction.reply({ content: '❌ Nenhum cargo automático configurado.', ephemeral: true });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('auto_role_remove_select')
                        .setPlaceholder('Selecione o cargo para remover...')
                        .addOptions(config.roles.autoRoles.map(id => ({ label: interaction.guild.roles.cache.get(id)?.name || id, value: id })))
                );
            await interaction.update({ components: [row] });
        }

        if (customId === 'staff_role_add') {
            const row = new ActionRowBuilder()
                .addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId('staff_role_add_select')
                        .setPlaceholder('Selecione o cargo staff...')
                );
            await interaction.update({ components: [row] });
        }

        if (customId === 'staff_role_remove') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            if (!config || config.roles.staff.length === 0) {
                return interaction.reply({ content: '❌ Nenhum cargo staff configurado.', ephemeral: true });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('staff_role_remove_select')
                        .setPlaceholder('Selecione o cargo para remover...')
                        .addOptions(config.roles.staff.map(id => ({ label: interaction.guild.roles.cache.get(id)?.name || id, value: id })))
                );
            await interaction.update({ components: [row] });
        }

        if (customId === 'admin_settings') {
            const config = await Config.findOne({ guildId: interaction.guildId }) || { settings: { privateThread: false, autoExpulsion: false } };
            const embed = createEmbed('🛠️ CONFIGURAÇÕES ADICIONAIS', 'Alterne as configurações globais do bot.');
            const row = new ActionRowBuilder()
                .addComponents(
                    createButton('toggle_thread', `Threads Privadas: ${config.settings.privateThread ? '✅' : '❌'}`, ButtonStyle.Secondary),
                    createButton('toggle_expulsion', `Auto-Expulsão: ${config.settings.autoExpulsion ? '✅' : '❌'}`, ButtonStyle.Secondary)
                );
            await interaction.update({ embeds: [embed], components: [row] });
        }

        if (customId === 'toggle_thread') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            config.settings.privateThread = !config.settings.privateThread;
            await config.save();
            return this.execute(interaction, client); // Refresh panel
        }

        if (customId === 'toggle_expulsion') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            config.settings.autoExpulsion = !config.settings.autoExpulsion;
            await config.save();
            return this.execute(interaction, client); // Refresh panel
        }

        if (customId === 'admin_history') {
            const History = require('../models/History');
            const logs = await History.find({ guildId: interaction.guildId }).sort({ date: -1 }).limit(10);

            if (logs.length === 0) {
                return interaction.reply({ content: '❌ Nenhum log global registrado.', ephemeral: true });
            }

            const embed = createEmbed(
                '📜 HISTÓRICO GLOBAL',
                'Últimas 10 ações realizadas na facção.'
            );

            logs.forEach(log => {
                embed.addFields({
                    name: `${log.type} - ${log.date.toLocaleDateString('pt-BR')}`,
                    value: `**Membro:** ${log.memberName || `<@${log.memberId}>`}\n**Executor:** ${log.executorName || `<@${log.executorId}>`}\n**Motivo:** ${log.reason || 'N/A'}`
                });
            });

            await interaction.update({ embeds: [embed], components: [] });
        }
    }
};
