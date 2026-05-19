const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    memberId: { type: String, required: true },
    executorId: { type: String, required: true },
    reason: { type: String, required: true },
    severity: { type: String, enum: ['LEVE', 'MEDIA', 'GRAVE'], required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Warning', warningSchema);
