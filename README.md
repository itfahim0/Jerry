# Jerry - The Friendly Bengali AI Bot

Jerry is a smart, friendly, Bengali-speaking Discord bot designed to assist the "Purrfect Universe" community. He uses OpenAI for intelligence and maintains a persistent memory of conversations.

## 🌟 Key Features

### 🧠 Intelligence & Memory
- **Bengali Persona**: Chats naturally in Bengali (with English mix).
- **Long-Term Memory**: Remembers user details (name, preferences) across conversations.
- **Context-Aware**: Reads all server messages to understand context but respects permissions (won't reveal private channel info).
- **RAG (Retrieval-Augmented Generation)**: Answers questions based on documents stored in `documents/`.

### 💬 Interaction
- **Direct Messages (DM)**: You can chat with Jerry privately in DMs.
- **Mentions**: Jerry understands and can use mentions for Users (`<@id>`), Channels (`<#id>`), and Roles (`<@&id>`).
- **Smart Replies**:
    - Ask "invite link" for a permanent server invite.
    - Ask "full details" for comprehensive answers.

### 🛡️ Safety & Moderation
- Refuses to discuss harmful or NSFW topics.
- Respects channel permissions (ViewChannel) before sharing information from chat logs.

## 🚀 Setup Guide

### Prerequisites
- Node.js (v16.9.0 or higher)
- A Discord Bot Token (with Message Content Intent enabled)
- An OpenAI API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/itfahim0/Jerry.git
    cd Jerry
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    DISCORD_TOKEN=your_discord_bot_token
    CLIENT_ID=your_discord_client_id
    OPENAI_API_KEY=your_openai_api_key
    ```

4.  **Deploy Slash Commands**
    ```bash
    npm run deploy
    ```

5.  **Start the Bot**
    ```bash
    npm start
    ```

## 📂 Project Structure

- `src/`
  - `commands/`: Slash commands (e.g., `/serverinfo`, `/help`)
  - `events/`: Event handlers (`messageCreate`, `ready`, etc.)
  - `services/`: Core logic (`knowledgeBase`, `documentIngestion`)
  - `utils/`: Helpers (`sessionMemory`)
- `documents/`: Place `.txt`, `.pdf`, or `.docx` files here for Jerry to learn from.
- `data/`: Stores persistent memory (`conversations.json`, `knowledge.json`).

## 🛠️ Production Deployment

Use PM2 to keep the bot running 24/7:

```bash
# Start the bot
npm run start:pm2

# View logs
pm2 logs jerry-bot

# Stop the bot
pm2 stop jerry-bot
```

## 📝 License
This project is licensed under the ISC License.
