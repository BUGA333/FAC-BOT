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
            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ embeds: [embed], components: [row] });
            } else {
                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            }
        }

        if (customId === 'admin_setup_panel') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            if (!config || !config.channels.setagem) {
                const msg = '❌ O canal de setagem não está configurado!';
                if (interaction.replied || interaction.deferred) return interaction.followUp({ content: msg, ephemeral: true });
                return interaction.reply({ content: msg, ephemeral: true });
            }

            const channel = interaction.guild.channels.cache.get(config.channels.setagem);
            if (!channel) {
                const msg = '❌ Canal de setagem não encontrado!';
                if (interaction.replied || interaction.deferred) return interaction.followUp({ content: msg, ephemeral: true });
                return interaction.reply({ content: msg, ephemeral: true });
            }

            const embed = createEmbed(config.messages.setagemTitle, config.messages.setagemDescription, '#2f3136');
            const row = new ActionRowBuilder()
                .addComponents(createButton('request_setagem', 'SOLICITAR SETAGEM', ButtonStyle.Success, '📝'));

            await channel.send({ embeds: [embed], components: [row] });
            
            const msg = '✅ Painel de setagem enviado com sucesso!';
            if (interaction.replied || interaction.deferred) await interaction.followUp({ content: msg, ephemeral: true });
            else await interaction.reply({ content: msg, ephemeral: true });
        }

        if (customId === 'admin_rp_roles') {
            const embed = createEmbed('🎭 GERENCIAMENTO DE CARGOS RP', 'Escolha uma ação para gerenciar os cargos da facção.');
            const row = new ActionRowBuilder()
                .addComponents(
                    createButton('admin_rp_role_add', 'Adicionar Cargo', ButtonStyle.Success, '➕'),
                    createButton('admin_rp_role_remove', 'Remover Cargo', ButtonStyle.Danger, '➖'),
                    createButton('admin_rp_role_list', 'Listar Cargos', ButtonStyle.Primary, '📋')
                );
            
            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ embeds: [embed], components: [row] });
            } else {
                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            }
        }

        if (customId === 'admin_rp_role_add') {
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

            const tagInput = new TextInputBuilder()
                .setCustomId('role_tag')
                .setLabel('Abreviação (Tag no Nome)')
                .setPlaceholder('Ex: MEM (Ficará [MEM])')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const extraRoleInput = new TextInputBuilder()
                .setCustomId('role_extra')
                .setLabel('ID do Cargo Extra (Opcional)')
                .setPlaceholder('ID de um segundo cargo para este posto')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(roleIdInput),
                new ActionRowBuilder().addComponents(levelInput),
                new ActionRowBuilder().addComponents(tagInput),
                new ActionRowBuilder().addComponents(extraRoleInput)
            );

            await interaction.showModal(modal);
        }

        if (customId === 'admin_rp_role_list') {
            const Role = require('../models/Role');
            const roles = await Role.find({ guildId: interaction.guildId }).sort({ level: -1 });

            if (roles.length === 0) {
                const msg = '❌ Nenhum cargo RP cadastrado.';
                if (interaction.replied || interaction.deferred) return interaction.followUp({ content: msg, ephemeral: true });
                return interaction.reply({ content: msg, ephemeral: true });
            }

            const embed = createEmbed(
                '📋 LISTA DE CARGOS RP',
                roles.map(r => `**${r.level}** - ${r.name} (<@&${r.discordRoleId}>)`).join('\n')
            );

            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ embeds: [embed], components: [] });
            } else {
                await interaction.reply({ embeds: [embed], components: [], ephemeral: true });
            }
        }

        if (customId === 'admin_rp_role_remove') {
            const Role = require('../models/Role');
            const roles = await Role.find({ guildId: interaction.guildId }).sort({ level: -1 });

            if (roles.length === 0) {
                const msg = '❌ Nenhum cargo RP para remover.';
                if (interaction.replied || interaction.deferred) return interaction.followUp({ content: msg, ephemeral: true });
                return interaction.reply({ content: msg, ephemeral: true });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('rp_role_delete_select')
                        .setPlaceholder('Selecione o cargo para remover...')
                        .addOptions(roles.map(r => ({ label: r.name, value: r._id.toString() })))
                );

            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ components: [row] });
            } else {
                await interaction.reply({ components: [row], ephemeral: true });
            }
        }

        if (customId === 'admin_roles') {
            const embed = createEmbed('🛡️ GERENCIAMENTO DE CARGOS', 'Selecione uma ação para gerenciar os cargos do servidor.');
            const row = new ActionRowBuilder()
                .addComponents(
                    createButton('admin_staff_role_add', 'Add Staff', ButtonStyle.Success, '🛡️'),
                    createButton('admin_staff_role_remove', 'Remover Staff', ButtonStyle.Danger, '🛡️'),
                    createButton('admin_auto_role_add', 'Add AutoRole', ButtonStyle.Primary, '🤖'),
                    createButton('admin_auto_role_remove', 'Remover AutoRole', ButtonStyle.Secondary, '🤖')
                );
            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ embeds: [embed], components: [row] });
            } else {
                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            }
        }

        if (customId === 'admin_auto_role_add') {
            const row = new ActionRowBuilder()
                .addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId('auto_role_add_select')
                        .setPlaceholder('Selecione o cargo automático...')
                );
            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ components: [row] });
            } else {
                await interaction.reply({ components: [row], ephemeral: true });
            }
        }

        if (customId === 'admin_auto_role_remove') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            if (!config || config.roles.autoRoles.length === 0) {
                const msg = '❌ Nenhum cargo automático configurado.';
                if (interaction.replied || interaction.deferred) return interaction.followUp({ content: msg, ephemeral: true });
                return interaction.reply({ content: msg, ephemeral: true });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('auto_role_remove_select')
                        .setPlaceholder('Selecione o cargo para remover...')
                        .addOptions(config.roles.autoRoles.map(id => ({ label: interaction.guild.roles.cache.get(id)?.name || id, value: id })))
                );
            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ components: [row] });
            } else {
                await interaction.reply({ components: [row], ephemeral: true });
            }
        }

        if (customId === 'admin_staff_role_add') {
            const row = new ActionRowBuilder()
                .addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId('staff_role_add_select')
                        .setPlaceholder('Selecione o cargo staff...')
                );
            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ components: [row] });
            } else {
                await interaction.reply({ components: [row], ephemeral: true });
            }
        }

        if (customId === 'admin_staff_role_remove') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            if (!config || config.roles.staff.length === 0) {
                const msg = '❌ Nenhum cargo staff configurado.';
                if (interaction.replied || interaction.deferred) return interaction.followUp({ content: msg, ephemeral: true });
                return interaction.reply({ content: msg, ephemeral: true });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('staff_role_remove_select')
                        .setPlaceholder('Selecione o cargo para remover...')
                        .addOptions(config.roles.staff.map(id => ({ label: interaction.guild.roles.cache.get(id)?.name || id, value: id })))
                );
            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ components: [row] });
            } else {
                await interaction.reply({ components: [row], ephemeral: true });
            }
        }

        if (customId === 'admin_settings') {
            const config = await Config.findOne({ guildId: interaction.guildId }) || { settings: { privateThread: false, autoExpulsion: false } };
            const embed = createEmbed('🛠️ CONFIGURAÇÕES ADICIONAIS', 'Alterne as configurações globais do bot.');
            const row = new ActionRowBuilder()
                .addComponents(
                    createButton('admin_toggle_thread', `Threads Privadas: ${config.settings.privateThread ? '✅' : '❌'}`, ButtonStyle.Secondary),
                    createButton('admin_toggle_expulsion', `Auto-Expulsão: ${config.settings.autoExpulsion ? '✅' : '❌'}`, ButtonStyle.Secondary)
                );
            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ embeds: [embed], components: [row] });
            } else {
                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            }
        }

        if (customId === 'admin_toggle_thread') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            config.settings.privateThread = !config.settings.privateThread;
            await config.save();
            return this.execute(interaction, client); // Refresh panel
        }

        if (customId === 'admin_toggle_expulsion') {
            const config = await Config.findOne({ guildId: interaction.guildId });
            config.settings.autoExpulsion = !config.settings.autoExpulsion;
            await config.save();
            return this.execute(interaction, client); // Refresh panel
        }

        if (customId === 'admin_messages') {
            const config = await Config.findOne({ guildId: interaction.guildId }) || await Config.create({ guildId: interaction.guildId });
            
            const modal = new ModalBuilder()
                .setCustomId('modal_admin_messages')
                .setTitle('Personalizar Painel de Setagem');

            const titleInput = new TextInputBuilder()
                .setCustomId('setagem_title')
                .setLabel('Título do Painel')
                .setPlaceholder('Ex: 📋 SISTEMA DE SETAGEM')
                .setValue(config.messages.setagemTitle)
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const descInput = new TextInputBuilder()
                .setCustomId('setagem_desc')
                .setLabel('Descrição do Painel')
                .setPlaceholder('Digite a mensagem que aparecerá no painel...')
                .setValue(config.messages.setagemDescription)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(descInput)
            );

            await interaction.showModal(modal);
        }

        if (customId === 'admin_history') {
            const History = require('../models/History');
            const logs = await History.find({ guildId: interaction.guildId }).sort({ date: -1 }).limit(10);

            if (logs.length === 0) {
                const msg = '❌ Nenhum log global registrado.';
                if (interaction.replied || interaction.deferred) return interaction.followUp({ content: msg, ephemeral: true });
                return interaction.reply({ content: msg, ephemeral: true });
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

            if (interaction.isButton() || interaction.isAnySelectMenu()) {
                await interaction.update({ embeds: [embed], components: [] });
            } else {
                await interaction.reply({ embeds: [embed], components: [], ephemeral: true });
            }
        }
    }
};
