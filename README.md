# 🎭 Bot de Gerenciamento de Facção RP

Um bot profissional e modular para Discord, desenvolvido com **Node.js**, **Discord.js v14** e **MongoDB**, focado no gerenciamento administrativo de facções em servidores de Roleplay.

## 🚀 Funcionalidades

-   **Painel Administrativo 100% In-Discord:** Configure canais, cargos e permissões sem tocar no código.
-   **Sistema de Setagem:** Painel fixo com botões, modais para coleta de dados e sistema de aprovação/recusa.
-   **Gerenciamento de Cargos RP:** Crie e remova cargos, defina hierarquias e permissões de promoção/rebaixamento.
-   **Promoção e Rebaixamento:** Sistema automático que altera cargos e nicknames no Discord.
-   **Sistema de Advertências:** 
    -   3 Leves = 1 Média.
    -   2 Médias = Rebaixamento Automático.
    -   1 Grave = Expulsão Automática (Configurável).
-   **Histórico Detalhado:** Acompanhe todas as ações de um membro ou visualize o log global.
-   **Logs Automáticos:** Canais separados para logs de setagem, promoção, advertência e configuração.

## 🛠️ Tecnologias

-   [Node.js](https://nodejs.org/)
-   [Discord.js v14](https://discord.js.org/)
-   [MongoDB](https://www.mongodb.com/) com [Mongoose](https://mongoosejs.com/)

## 📋 Pré-requisitos

-   Node.js v16.9.0 ou superior.
-   Uma instância do MongoDB (Local ou Atlas).
-   Um Bot no [Discord Developer Portal](https://discord.com/developers/applications).

## ⚙️ Instalação

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env`:
   ```env
   TOKEN=seu_token_aqui
   MONGO_URI=sua_uri_mongodb_aqui
   CLIENT_ID=id_do_seu_bot
   GUILD_ID=id_do_seu_servidor
   ```
4. Registre os comandos slash:
   ```bash
   npm run deploy
   ```
5. Inicie o bot:
   ```bash
   npm start
   ```

### 🔄 Mantendo o Bot Online (PM2)

Para garantir que o bot reinicie automaticamente caso crash ou o servidor reinicie, utilize o PM2:

1. Inicie o bot com PM2:
   ```bash
   npm run pm2:start
   ```
2. Veja os logs em tempo real:
   ```bash
   npm run pm2:logs
   ```
3. Outros comandos:
   - Parar: `npm run pm2:stop`
   - Reiniciar: `npm run pm2:restart`

## 🎮 Como Usar

1. Use `/admin` para abrir o painel principal.
2. Configure os **Canais** (Setagem, Aprovação, Logs).
3. Configure os **Cargos Staff** (quem pode gerenciar o bot).
4. Cadastre os **Cargos RP** em ordem hierárquica.
5. Envie o **Painel de Setagem** no canal desejado através do painel admin.

## 📂 Estrutura do Projeto

```text
src/
├── buttons/        # Manipuladores de botões
├── commands/       # Comandos Slash
├── config/         # Arquivos de configuração
├── database/       # Conexão com o banco de dados
├── events/         # Manipuladores de eventos do Discord
├── modals/         # Manipuladores de modais
├── models/         # Schemas do Mongoose
├── panels/         # Lógica de painéis visuais
├── selectMenus/    # Manipuladores de menus de seleção
├── services/       # Lógica de negócio e handlers
└── utils/          # Utilitários e helpers
```

## 📄 Licença

Este projeto está sob a licença ISC.
