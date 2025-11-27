const { Events } = require('discord.js');
const { getChatResponse } = require('../openaiClient');
const knowledgeBase = require('../services/knowledgeBase');
const { getSession, addMessageToSession } = require('../utils/sessionMemory');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // Check if the bot is mentioned or if it's a DM
        const isMentioned = message.mentions.users.has(message.client.user.id);
        const isDM = !message.guild;

        if (isMentioned || isDM) {
            try {
                await message.channel.sendTyping();

                const userMessage = message.content.replace(/<@!?[0-9]+>/g, '').trim();
                const userId = message.author.id;

                // 1. Search knowledge base (RAG)
                const contextResults = await knowledgeBase.search(userMessage);
                let contextText = "";

                if (contextResults.length > 0) {
                    contextText = contextResults.map(r => r.text).join("\n\n");
                    console.log(`Found ${contextResults.length} relevant context chunks.`);
                }

                // 2. Retrieve conversation history
                const history = getSession(userId);

                // 3. Construct message payload
                const messages = [];

                // System Prompt + RAG Context
                let systemContent = "You are Jerry, a friendly Bengali-speaking AI assistant.";
                if (contextText) {
                    systemContent += `\n\nContext information is below.\n---------------------\n${contextText}\n---------------------\nGiven the context information and not prior knowledge, answer the query.`;
                }
                messages.push({ role: "system", content: systemContent });

                // Append History
                messages.push(...history);

                // Append Current Message
                messages.push({ role: "user", content: userMessage });

                // 4. Get Response
                const response = await getChatResponse(messages);

                // 5. Save to History
                addMessageToSession(userId, { role: "user", content: userMessage });
                addMessageToSession(userId, { role: "assistant", content: response });

                // 6. Send Response
                if (response.length > 2000) {
                    const chunks = response.match(/[\s\S]{1,2000}/g) || [];
                    for (const chunk of chunks) {
                        await message.reply(chunk);
                    }
                } else {
                    await message.reply(response);
                }

            } catch (error) {
                console.error("Error handling message:", error);
                await message.reply("দুঃখিত, একটি সমস্যা হয়েছে।");
            }
        }
    },
};
