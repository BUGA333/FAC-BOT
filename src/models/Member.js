const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    discordId: { type: String, required: true },
    rpName: { type: String, required: true },
    rpId: { type: String, required: true },
    rpNumber: { type: String, required: true },
    currentRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    warnings: {
        light: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        heavy: { type: Number, default: 0 }
    },
    history: [{
        action: String, // 'SETAGEM', 'PROMOCAO', 'REBAIXAMENTO', 'ADVERTENCIA'
        details: String,
        executorId: String,
        date: { type: Date, default: Date.now }
    }],
    joinedAt: { type: Date, default: Date.now }
});

memberSchema.index({ guildId: 1, discordId: 1 }, { unique: true });

module.exports = mongoose.model('Member', memberSchema);
