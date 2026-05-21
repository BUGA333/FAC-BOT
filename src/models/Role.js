const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    discordRoleId: { type: String, required: true },
    level: { type: Number, required: true }, // Higher number = higher rank
    tag: { type: String, default: "" }, // Nickname tag like [MEM]
    permissions: {
        canPromote: { type: Boolean, default: false },
        canDemote: { type: Boolean, default: false },
        canWarn: { type: Boolean, default: false }
    }
});

// Compound index to ensure role names are unique per guild
roleSchema.index({ guildId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
