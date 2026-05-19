const mongoose = require('mongoose');
require('colors');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' [DB] MongoDB conectado com sucesso!'.green);
    } catch (err) {
        console.error(` [DB] Erro ao conectar ao MongoDB: ${err.message}`.red);
        process.exit(1);
    }
};

module.exports = connectDB;
