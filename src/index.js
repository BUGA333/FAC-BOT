const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("FAC-BOT ONLINE");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor web iniciado na porta ${PORT}`);
});
require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const connectDB = require('./database/db');
require('colors');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selectMenus = new Collection();

// Connect to Database
connectDB();

// Load Handlers
const handlersPath = path.join(__dirname, 'services', 'handlers');
if (!fs.existsSync(handlersPath)) {
    fs.mkdirSync(handlersPath, { recursive: true });
}

// Handler loader
const loadHandlers = () => {
    const handlers = ['commandHandler.js', 'eventHandler.js', 'componentHandler.js'];
    handlers.forEach(handler => {
        require(`./services/handlers/${handler}`)(client);
    });
};

// Create Handlers before loading
// I'll create them in the next steps

// Initializing the bot
client.login(process.env.TOKEN).then(() => {
    loadHandlers();
}).catch(err => {
    console.error(` [CLIENT] Erro ao logar: ${err.message}`.red);
});
