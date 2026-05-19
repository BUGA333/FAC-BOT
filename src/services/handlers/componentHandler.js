const fs = require('fs');
const path = require('path');
require('colors');

module.exports = (client) => {
    const componentTypes = ['buttons', 'modals', 'selectMenus'];

    componentTypes.forEach(type => {
        const componentsPath = path.join(__dirname, '..', '..', type);
        if (!fs.existsSync(componentsPath)) return;

        const componentFiles = fs.readdirSync(componentsPath).filter(file => file.endsWith('.js'));

        for (const file of componentFiles) {
            const filePath = path.join(componentsPath, file);
            const component = require(filePath);
            
            if (component.customId) {
                client[type].set(component.customId, component);
                console.log(` [COMPONENTS] ${type.toUpperCase()} carregado: ${component.customId}`.yellow);
            }
        }
    });
};
