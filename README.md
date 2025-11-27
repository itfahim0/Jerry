# Jerry - The Friendly Bengali AI Bot

Jerry is a Discord bot designed to be a friendly, Bengali-speaking companion. He can chat casually, provide server information, and explain technical concepts in an easy-to-understand way.

## Features

- **Friendly Chat**: Converses in Bengali (with some English mix) in a casual, supportive tone.
- **Server Info**: Can explain the purpose of the server, channels, and roles.
- **Technical Explanations**: Capable of explaining code structures, architectures, and designs.
- **Safety**: Refuses to engage in harmful or NSFW topics.

## Setup

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment:**
    - Rename `.env.example` (if provided) or create a `.env` file.
    - Add your `DISCORD_TOKEN`, `CLIENT_ID`, and `OPENAI_API_KEY`.
4.  **Deploy Commands:**
    ```bash
    npm run deploy
    ```
5.  **Start the Bot:**
    ```bash
    npm start
    ```

## Project Structure

- `src/`: Source code
  - `commands/`: Slash commands
  - `events/`: Event handlers
  - `utils/`: Utility functions
  - `services/`: RAG and logic services
- `documents/`: Knowledge base files (PDF, DOCX, TXT, MD)
- `config/`: Configuration files
- `scripts/`: Deployment scripts

## New Features (RAG & Utilities)

- **Knowledge Base**: Jerry learns from files in the `documents/` folder.
- **Smart Answers**: 
  - Ask "Tell me about the server" for a concise summary.
  - Ask "Tell me full details" for a comprehensive explanation.
- **Invite Links**: Ask "invite link", "link dao", or "server link" to get a permanent invite.
- **Link Retrieval**: Ask for specific website links (e.g., "Purrfect Universe link") to get them from `documents/links.md`.

## Production Deployment (PM2)

To run the bot continuously in production:

```bash
npm run start:pm2
```

Useful PM2 commands:
- `pm2 status`: Check bot status
- `pm2 logs jerry-bot`: View logs
- `pm2 restart jerry-bot`: Restart the bot

