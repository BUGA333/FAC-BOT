const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channels: {
        setagem: { type: String, default: null },
        logs: { type: String, default: null },
        aprovacao: { type: String, default: null },
        logsSetagem: { type: String, default: null },
        logsPromocao: { type: String, default: null },
        logsRebaixamento: { type: String, default: null },
        logsAdvertencia: { type: String, default: null },
        logsConfig: { type: String, default: null }
    },
    roles: {
        staff: { type: [String], default: [] },
        autoRoles: { type: [String], default: [] }
    },
    messages: {
        setagemTitle: { type: String, default: "📋 SISTEMA DE SETAGEM" },
        setagemDescription: { type: String, default: "Clique no botão abaixo para solicitar sua setagem na facção." }
    },
    settings: {
        privateThread: { type: Boolean, default: false },
        autoExpulsion: { type: Boolean, default: false }
    }
});

module.exports = mongoose.model('Config', configSchema);
