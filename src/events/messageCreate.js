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
                const lowerMessage = userMessage.toLowerCase();

                // --- 1. Invite Link Logic ---
                const inviteKeywords = ['invite link', 'server link', 'link dao', 'link den', 'invite koro'];
                if (inviteKeywords.some(keyword => lowerMessage.includes(keyword))) {
                    let invite;
                    if (message.guild) {
                        invite = await message.channel.createInvite({ maxAge: 0, maxUses: 0 }); // Never expires
                    } else {
                        // In DM, we can't create an invite to the DM channel. 
                        // We would need a specific server ID to create an invite for.
                        // For now, let's assume we want to invite to the main server if configured, 
                        // or ask the user to ask in a server channel.
                        // Ideally, fetch a default channel from config.
                        return message.reply("Please ask this in the server channel so I can generate a link for you, or configure a default server ID.");
                    }

                    if (invite) {
                        return message.reply(`Here is your invite link: ${invite.url}`);
                    }
                }

                // --- 2. RAG & Chat Logic ---

                // Search knowledge base (RAG)
                const contextResults = await knowledgeBase.search(userMessage);
                let contextText = "";

                if (contextResults.length > 0) {
                    contextText = contextResults.map(r => r.text).join("\n\n");
                    console.log(`Found ${contextResults.length} relevant context chunks.`);
                }

                // Retrieve conversation history
                const history = getSession(userId);

                // Construct message payload
                const messages = [];

                // System Prompt Configuration
                let systemContent = "You are Jerry, a friendly Bengali-speaking AI assistant.";

                // Check for "detailed" request
                const detailedKeywords = ['full details', 'bistarito', 'details dao', 'sob kichu'];
                const isDetailed = detailedKeywords.some(k => lowerMessage.includes(k));

                if (contextText) {
                    systemContent += `\n\nContext information is below.\n---------------------\n${contextText}\n---------------------\n`;
                    systemContent += "Given the context information and not prior knowledge, answer the query.";

                    if (isDetailed) {
                        systemContent += " Provide a comprehensive and detailed answer.";
                    } else {
                        systemContent += " Keep your answer short and concise (2-3 sentences) unless the user explicitly asks for details.";
                    }

                    systemContent += " Answer in the same language as the user (Bengali or English). If the user asks for a link, provide the URL from the context.";
                }

                messages.push({ role: "system", content: systemContent });

                // Append History
                messages.push(...history);

                // Append Current Message
                messages.push({ role: "user", content: userMessage });

                // Get Response
                const response = await getChatResponse(messages);

                // Save to History
                addMessageToSession(userId, { role: "user", content: userMessage });
                addMessageToSession(userId, { role: "assistant", content: response });

                // Send Response
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
