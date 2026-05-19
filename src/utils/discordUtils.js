const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    createEmbed(title, description, color = '#0099ff', fields = []) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
        
        if (fields.length > 0) {
            embed.addFields(fields);
        }
        
        return embed;
    },

    createButton(id, label, style = ButtonStyle.Primary, emoji = null) {
        const button = new ButtonBuilder()
            .setCustomId(id)
            .setLabel(label)
            .setStyle(style);
        
        if (emoji) {
            button.setEmoji(emoji);
        }
        
        return button;
    }
};
