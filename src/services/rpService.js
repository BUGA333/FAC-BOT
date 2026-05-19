const Role = require('../models/Role');
const Member = require('../models/Member');
const Config = require('../models/Config');

class RPService {
    static async canPerformAction(interaction, targetId, action) {
        const { guild, user } = interaction;
        const executor = await guild.members.fetch(user.id);
        
        // Administrator always can
        if (executor.permissions.has('Administrator')) return true;

        const config = await Config.findOne({ guildId: guild.id });
        if (!config) return false;

        // Check if executor has a staff role configured in the bot
        const hasStaffRole = executor.roles.cache.some(r => config.roles.staff.includes(r.id));
        if (!hasStaffRole) return false;

        const executorMember = await Member.findOne({ guildId: guild.id, discordId: user.id }).populate('currentRoleId');
        const targetMember = await Member.findOne({ guildId: guild.id, discordId: targetId }).populate('currentRoleId');

        // If not in DB as member, check if they have a staff role. If they have staff role but not in DB, 
        // they might be "External Staff". We'll allow if they are admin or have staff role.
        // But for RP hierarchy, they need to be in the system.
        
        if (!executorMember || !executorMember.currentRoleId) {
             // If they have staff role but aren't in the RP system, they can only perform actions if they are admins.
             return executor.permissions.has('Administrator');
        }

        // Check if executor's role has permission
        if (action === 'PROMOTE' && !executorMember.currentRoleId.permissions.canPromote) return false;
        if (action === 'DEMOTE' && !executorMember.currentRoleId.permissions.canDemote) return false;
        if (action === 'WARN' && !executorMember.currentRoleId.permissions.canWarn) return false;

        // Check hierarchy: Executor must be higher level than target
        if (targetMember && targetMember.currentRoleId) {
            if (executorMember.currentRoleId.level <= targetMember.currentRoleId.level) return false;
        }

        return true;
    }
}

module.exports = RPService;
