const Config = require('../models/Config');

class ConfigService {
    static async getConfig(guildId) {
        let config = await Config.findOne({ guildId });
        if (!config) {
            config = await Config.create({ guildId });
        }
        return config;
    }

    static async updateChannel(guildId, type, channelId) {
        const config = await this.getConfig(guildId);
        config.channels[type] = channelId;
        await config.save();
        return config;
    }

    static async addStaffRole(guildId, roleId) {
        const config = await this.getConfig(guildId);
        if (!config.roles.staff.includes(roleId)) {
            config.roles.staff.push(roleId);
            await config.save();
        }
        return config;
    }
}

module.exports = ConfigService;
