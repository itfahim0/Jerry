# Jerry - The Friendly Bengali AI Bot

Jerry is a smart, friendly, Bengali-speaking Discord bot designed to assist the "Purrfect Universe" community. He uses OpenAI for intelligence and maintains a persistent memory of conversations.

## 🌟 Key Features

### 🧠 Intelligence & Memory
- **Bengali Persona**: Chats naturally in Bengali (with English mix).
- **Long-Term Memory**: Remembers user details (name, preferences) across conversations.
- **Context-Aware**: Reads all server messages to understand context but respects permissions (won't reveal private channel info).
- **RAG (Retrieval-Augmented Generation)**: Answers questions based on documents stored in `documents/`.
- 
- ### Example interactions
**User:** `/serverinfo`  
**Jerry:** "এই সার্ভারের উদ্দেশ্য হলো সদস্যদের সহযোগিতা এবং প্রকল্প আলোচনা। প্রধান চ্যানেল: #general, #support। রোল: Moderator (সার্ভার মডারেশন), Member (সাধারণ)।"

**User (DM):** "Jerry, explain #jobs channel in Bangla"  
**Jerry (DM):** "এই চ্যানেলটি চাকরির বিজ্ঞপ্তি শেয়ার করার জন্য..."


### 💬 Interaction
- **Direct Messages (DM)**: You can chat with Jerry privately in DMs.
- **Mentions**: Jerry understands and can use mentions for Users (`<@id>`), Channels (`<#id>`), and Roles (`<@&id>`).
- **Smart Replies**:
    - Ask "invite link" for a permanent server invite.
    - Ask "full details" for comprehensive answers.

# RAG ingestion
- Supported: .md, .txt, .pdf
- Chunk size: 500 tokens, 50 overlap
- Embedding model: openai-text-embedding-3-small (or configurable)
- Vector store: pgvector (Postgres) or Redis Vector
- To ingest: `node scripts/ingest.js --dir documents/`


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

## Env-check snippet (src/index.js)

```bash
const required = ["DISCORD_TOKEN","OPENAI_API_KEY"];
for(const k of required){
  if(!process.env[k]) {
    console.error(`Missing ${k} — set it in .env or GitHub Secrets.`);
    process.exit(1);
  }
}
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
