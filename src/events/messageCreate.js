const { Events, EmbedBuilder, ChannelType } = require('discord.js');
const { getChatResponse } = require('../openaiClient');
const knowledgeBase = require('../services/knowledgeBase');
const { getSession, addMessageToSession } = require('../utils/sessionMemory');
const systemPrompt = require('../systemPrompt');
const { generateThreadSummary } = require('../services/summaryService');
const { handleVoiceMessage } = require('../services/voiceService');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // Check if the bot is mentioned or if it's a DM
        const isMentioned = message.mentions.users.has(message.client.user.id);
        const isDM = !message.guild;

        // Auto-Interjection Logic (5% chance)
        const shouldInterject = !isMentioned && !isDM && Math.random() < 0.05;

        // --- 0. Log Message to Knowledge Base (Channel Memory) ---
        if (!message.author.bot && !isDM) {
            // We don't await this to avoid blocking the response
            knowledgeBase.addChatLog(message).catch(err => console.error("Error logging chat:", err));
        }

        if (isMentioned || isDM || shouldInterject || message.attachments.size > 0) {
            try {
                await message.channel.sendTyping();

                let userMessage = message.content.replace(/<@!?[0-9]+>/g, '').trim();
                const userId = message.author.id;
                const lowerMessage = userMessage.toLowerCase();

                // --- Audio Handling (Service) ---
                const voiceResponse = await handleVoiceMessage(message);
                if (voiceResponse) {
                    userMessage += voiceResponse;
                }

                // If it was just an attachment with no text and not mentioned, we should still process if it's DM or if we decided to interject (or if it's an audio/image that needs analysis)
                if (!isMentioned && !isDM && !shouldInterject && message.attachments.size > 0 && !voiceResponse) {
                    // If it's just an image/file in a public channel without mention, ignore it (unless interject logic triggered)
                    // But if we transcribed audio, we assume they want a reply? Maybe not.
                    // Let's be safe: Only reply to attachments if mentioned, DM, or interject logic.
                    // BUT, the user explicitly asked for "Voice -> Bangla Chat Conversion".
                    // If I send a voice note, I expect a reply.
                    if (voiceResponse) {
                        // Treat audio as a direct interaction
                    } else {
                        return; // Ignore random images unless mentioned
                    }
                }

                // --- 1. Invite Link Logic (Only if explicitly mentioned or DM) ---
                if (isMentioned || isDM) {
                    const inviteKeywords = ['invite link', 'server link', 'link dao', 'link den', 'invite koro'];
                    if (inviteKeywords.some(keyword => lowerMessage.includes(keyword))) {
                        let invite;
                        if (message.guild) {
                            invite = await message.channel.createInvite({ maxAge: 0, maxUses: 0 }); // Never expires
                        } else {
                            return message.reply("Please ask this in the server channel so I can generate a link for you.");
                        }

                        if (invite) {
                            const embed = new EmbedBuilder()
                                .setColor(0x0099FF)
                                .setTitle('Server Invite Link')
                                .setDescription(`Here is your permanent invite link:\n${invite.url}`)
                                .setFooter({ text: 'Share this with your friends!' });

                            return message.reply({ embeds: [embed] });
                        }
                    }
                }

                // --- 2. Auto Thread Summary Logic (Service) ---
                const summaryKeywords = ['summary', 'sar-songkhep', 'summary dao', 'give me summary', 'discussion summary'];
                if ((isMentioned || isDM) && summaryKeywords.some(k => lowerMessage.includes(k))) {
                    return await generateThreadSummary(message);
                }

                // --- 2.5 Learning Mode (Admin Only) ---
                if (lowerMessage.startsWith('jerry learn:') || lowerMessage.startsWith('jerry shikho:')) {
                    if (message.member && message.member.permissions.has('Administrator')) {
                        const contentToLearn = message.content.replace(/jerry (learn|shikho):/i, '').trim();
                        if (contentToLearn.length > 10) {
                            await knowledgeBase.addDocument(contentToLearn, `learned_from_chat_${Date.now()}`);
                            return message.reply("ধন্যবাদ! আমি এই তথ্যটি শিখে নিয়েছি। (Added to Knowledge Base)");
                        } else {
                            return message.reply("তথ্যটি খুব ছোট। দয়া করে বিস্তারিত লিখুন।");
                        }
                    } else {
                        return message.reply("দুঃখিত, আমাকে শেখানোর অনুমতি শুধুমাত্র অ্যাডমিনদের আছে।");
                    }
                }

                // --- 3. RAG & Chat Logic ---

                // Search knowledge base (RAG)
                // Only search if mentioned or DM, or if interjecting and message is long enough
                let contextText = "";
                if (isMentioned || isDM || userMessage.length > 10 || voiceResponse) {
                    // Pass message.member to check permissions for chat logs
                    const contextResults = await knowledgeBase.search(userMessage, 5, message.member);
                    if (contextResults.length > 0) {
                        contextText = contextResults.map(r => {
                            if (r.type === 'chat') {
                                return `[Chat Log] ${r.authorName}: ${r.text}`;
                            }
                            return r.text;
                        }).join("\n\n");
                        console.log(`Found ${contextResults.length} relevant context chunks.`);
                    }
                }


                // Retrieve conversation history
                let history = getSession(userId);

                // If interjecting, fetch recent channel messages for context
                let recentContext = [];
                if (shouldInterject && message.channel) {
                    const recentMessages = await message.channel.messages.fetch({ limit: 5 });
                    recentContext = recentMessages.reverse().map(m => {
                        return { role: m.author.id === message.client.user.id ? "assistant" : "user", content: `${m.author.username}: ${m.content}` };
                    });
                    // Use recent context instead of personal session history for interjections
                    history = recentContext;
                }

                // --- 4. Immediate Context (Recent Channel History) ---
                // Fetch last 20 messages to get context of the current conversation
                let immediateContext = "";
                if (message.channel && !isDM) {
                    try {
                        const recentMessages = await message.channel.messages.fetch({ limit: 20 });
                        const today = new Date().toDateString();

                        const relevantMessages = recentMessages.filter(m => {
                            // Filter 1: Must be from today
                            const msgDate = m.createdAt.toDateString();
                            if (msgDate !== today) return false;

                            // Filter 2: Exclude the current message itself (to avoid duplication)
                            if (m.id === message.id) return false;

                            // Filter 3: Exclude bot messages (optional, but keeps context cleaner)
                            // if (m.author.bot) return false; 

                            return true;
                        });

                        if (relevantMessages.size > 0) {
                            // Sort by time (oldest first)
                            const sortedMessages = Array.from(relevantMessages.values()).reverse();
                            immediateContext = sortedMessages.map(m => `${m.author.username}: ${m.content}`).join("\n");
                        }
                    } catch (err) {
                        console.error("Error fetching immediate context:", err);
                    }
                }

                // Construct message payload
                const messages = [];

                // System Prompt Configuration
                let systemContent = systemPrompt;

                // Append Immediate Context
                if (immediateContext) {
                    systemContent += `\n\nRecent Chat History (Today):\n${immediateContext}\n`;
                    systemContent += "Use this history to understand the immediate context of the conversation (who said what just now).\n";
                }

                // --- Smart Mentions & Role Context ---
                if (message.guild) {
                    // 1. Channel & Role Structure
                    const channels = message.guild.channels.cache
                        .filter(c => c.type === ChannelType.GuildText)
                        .map(c => {
                            let info = `${c.name} (ID: ${c.id})`;
                            if (c.topic) info += ` - Desc: ${c.topic.substring(0, 50)}...`; // Add channel topic/description
                            return info;
                        })
                        .slice(0, 20) // Limit to avoid token overflow
                        .join("\n");

                    const roles = message.guild.roles.cache
                        .map(r => `${r.name} (ID: ${r.id})`)
                        .slice(0, 20)
                        .join(", ");

                    systemContent += `\n\nServer Structure:\nChannels:\n${channels}\nRoles: ${roles}\n`;
                    systemContent += "To mention a channel, use <#channelID>. To mention a role, use <@&roleID>. Use these IDs when referring to specific channels or roles.\n";
                    systemContent += "Use the 'Desc' (Topic) of channels to explain their purpose if asked.\n";

                    // 2. User Role Context
                    const member = message.member;
                    if (member) {
                        const userRoles = member.roles.cache.map(r => r.name).join(', ');
                        const isAdmin = member.permissions.has('Administrator');
                        systemContent += `\nUser Context:\nThe user asking this is ${message.author.username} (ID: ${message.author.id}).\nTheir Roles: ${userRoles}\nIs Admin: ${isAdmin}\n`;
                        systemContent += "Tailor your answer based on their permissions. If they are an Admin, acknowledge their authority.\n";
                    }
                }

                // Check for "detailed" request
                const detailedKeywords = ['full details', 'bistarito', 'details dao', 'sob kichu'];
                const isDetailed = detailedKeywords.some(k => lowerMessage.includes(k));

                if (contextText) {
                    systemContent += `\n\nContext information is below.\n---------------------\n${contextText}\n---------------------\n`;
                    systemContent += "Instructions:\n";
                    systemContent += "1. STRICTLY use ONLY the provided context to answer the query. Do NOT use outside knowledge about the server.\n";
                    systemContent += "2. If the answer is not in the context, explicitly say: 'I do not have that information in my documents.'\n";
                    systemContent += "3. If the user asks for a specific link (e.g. website), provide the URL exactly as shown in the context.\n";
                } else {
                    systemContent += "\nI do not have specific context for this query. Answer generally if it's casual chat. If asked about the server/rules/info and you don't have context, say 'I don't have that info right now'.";
                }

                if (shouldInterject) {
                    systemContent += "\nYou are interjecting in a conversation. Be helpful, funny, or insightful. Don't be annoying. Keep it brief.";
                }

                messages.push({ role: "system", content: systemContent });

                // Append History
                messages.push(...history);

                // Append Current Message (if not already in recentContext)
                if (!shouldInterject) {
                    messages.push({ role: "user", content: userMessage });
                }

                // --- 4. Vision (Image Handling) ---
                let imageUrl = null;
                if (message.attachments.size > 0) {
                    const attachment = message.attachments.first();
                    if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                        imageUrl = attachment.url;
                        console.log("Image detected:", imageUrl);
                    }
                }

                // Get Response
                const response = await getChatResponse(messages, imageUrl);

                // Save to History (only for direct interactions)
                if (!shouldInterject) {
                    addMessageToSession(userId, { role: "user", content: userMessage });
                    addMessageToSession(userId, { role: "assistant", content: response });
                }

                // --- 3. Send Response (with Embed detection) ---

                // Check if response contains a URL and user asked for a link
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const urls = response.match(urlRegex);
                const linkKeywords = ['link', 'website', 'url'];
                const askedForLink = linkKeywords.some(k => lowerMessage.includes(k));

                if (urls && askedForLink) {
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setDescription(response);

                    await message.reply({ embeds: [embed] });
                } else {
                    // Standard text response (split if too long)
                    if (response.length > 2000) {
                        const chunks = response.match(/[\s\S]{1,2000}/g) || [];
                        for (const chunk of chunks) {
                            await message.reply(chunk);
                        }
                    } else {
                        await message.reply(response);
                    }
                }

            } catch (error) {
                console.error("Error handling message:", error);
                // Don't reply with error if interjecting, just fail silently
                if (!shouldInterject) {
                    await message.reply("দুঃখিত, একটি সমস্যা হয়েছে।");
                }
            }
        }
    },
};
