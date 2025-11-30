# 🤖 Jerry - The Friendly Bengali AI Discord Bot

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.9.0-green.svg)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991.svg)
![License](https://img.shields.io/badge/license-ISC-yellow.svg)

**Jerry** is an advanced, Bengali-first AI assistant designed for Discord communities. Powered by **OpenAI's GPT-4o** and **Whisper**, Jerry provides a unique "Frank" yet friendly persona, capable of voice interaction, intelligent thread summarization, and RAG-based server knowledge.

---

## 📑 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Bot](#-running-the-bot)
- [Deployment with PM2](#-deployment-with-pm2-production)
- [Usage Guide](#-usage-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **🇧🇩 Bengali-First Core**: Speaks natural, conversational Bangla by default.
- **🗣️ Voice Message Support**: Transcribes and responds to voice notes in Bangla using OpenAI Whisper.
- **🧠 RAG Knowledge Base**: "Learns" from your server's documents (PDF, TXT, JSON) to answer specific questions.
- **📝 Auto Thread Summary**: Summarizes long conversations into key points and decisions with a simple chat command.
- **🎭 Frank Persona**: A unique personality that is helpful, respectful, but honest and direct.
- **🛡️ Smart Moderation**: (Optional) Can be extended to handle basic moderation tasks.
- **🔌 Plugin System**: Modular architecture allowing for easy addition of new capabilities.
- **📱 Channel Awareness**: Understands the context of the channel it is chatting in.

---

## 📂 Project Structure

```graphql
Jerry/
├── documents/              # Knowledge base documents (PDF, TXT)
├── scripts/
│   └── deploy-commands.js  # Slash command registration script
├── src/
│   ├── commands/           # Slash command definitions
│   │   └── serverinfo.js
│   ├── events/             # Discord event handlers
│   │   ├── messageCreate.js
│   │   └── ...
│   ├── services/           # Core business logic & services
│   │   ├── knowledgeBase.js    # RAG engine
│   │   ├── summaryService.js   # Thread summarization logic
│   │   ├── voiceService.js     # Audio transcription logic
│   │   └── fileParser.js       # Document parsing
│   ├── utils/              # Helper utilities
│   │   └── sessionMemory.js
│   ├── index.js            # Main entry point
│   ├── openaiClient.js     # OpenAI API wrapper
│   └── systemPrompt.js     # Persona & behavior definition
├── .env                    # Environment variables (GitIgnored)
├── ecosystem.config.js     # PM2 configuration
├── package.json            # Dependencies & scripts
└── README.md               # Project documentation
```

---

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v16.9.0 or higher)
- **[Git](https://git-scm.com/)**
- **FFmpeg** (Required for voice processing on some systems)

You will also need:
- A **Discord Bot Token** from the [Discord Developer Portal](https://discord.com/developers/applications).
- An **OpenAI API Key** from [OpenAI Platform](https://platform.openai.com/).

---

## 📥 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/itfahim0/Jerry.git
    cd Jerry
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

---

## ⚙ Configuration

Create a `.env` file in the root directory and populate it with your credentials:

```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
GUILD_ID=your_target_guild_id_here (Optional, for dev)

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional
NODE_ENV=development
```

---

## 🚀 Running the Bot

### Development Mode
Runs the bot with `nodemon` for auto-reloading on file changes.
```bash
npm run dev
```

### Production Mode
Runs the bot normally.
```bash
npm start
```

### Deploying Slash Commands
If you add or modify slash commands, run this once to update them on Discord:
```bash
npm run deploy
```

---

## ☁ Deployment with PM2 (Production)

For a professional production deployment, use **PM2** to keep your bot running 24/7.

1.  **Install PM2 globally**
    ```bash
    npm install pm2 -g
    ```

2.  **Start the Bot**
    Use the included `ecosystem.config.js` file:
    ```bash
    pm2 start ecosystem.config.js
    ```
    *Or manually:*
    ```bash
    pm2 start src/index.js --name "JerryBot"
    ```

3.  **Monitor & Manage**
    ```bash
    pm2 status        # Check bot status
    pm2 logs JerryBot # View live logs
    pm2 stop JerryBot # Stop the bot
    pm2 restart JerryBot # Restart the bot
    ```

4.  **Save Process List** (Ensures bot starts on server reboot)
    ```bash
    pm2 save
    pm2 startup
    ```

---

## 📖 Usage Guide

### 💬 Chatting
- **Direct Chat**: Mention `@Jerry` or reply to his message.
- **DM**: Send him a Direct Message.
- **Language**: He speaks Bangla by default. Ask "Speak in English" to switch.

### 🎙️ Voice Features
- **Voice Notes**: Send a voice message in DM or Server. Jerry will listen and reply in text.
- **Audio Files**: Upload an `.mp3` or `.wav` file for transcription.

### 📝 Summarization
- **Trigger**: Type `summary dao`, `give me summary`, or `sar-songkhep`.
- **Effect**: Jerry reads the last 50 messages in the channel and produces a structured summary (Key Points, Decisions, Next Steps).

### 🎓 Teaching Jerry (Admin Only)
- **Command**: `Jerry learn: [Information]`
- **Example**: `Jerry learn: Our weekly meeting is on Sundays at 8 PM.`
- **Result**: Jerry saves this to his knowledge base and will answer future questions about it.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the **ISC License**.
