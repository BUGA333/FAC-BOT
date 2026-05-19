const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    rpName: { type: String, required: true },
    rpId: { type: String, required: true },
    rpNumber: { type: String, required: true },
    recruiter: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REFUSED'], default: 'PENDING' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
