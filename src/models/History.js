const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    type: { type: String, enum: ['SETAGEM', 'PROMOCAO', 'REBAIXAMENTO', 'ADVERTENCIA', 'EXPULSAO'], required: true },
    memberId: { type: String, required: true },
    memberName: { type: String },
    executorId: { type: String, required: true },
    executorName: { type: String },
    oldRole: { type: String },
    newRole: { type: String },
    reason: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);
