const { EmbedBuilder } = require('discord.js');
const { getChatResponse } = require('../openaiClient');

async function generateThreadSummary(message) {
    try {
        const limit = 50;
        const messages = await message.channel.messages.fetch({ limit: limit });

        if (messages.size === 0) {
            return message.reply("এই চ্যানেলে কোনো বার্তা নেই।");
        }

        const sortedMessages = Array.from(messages.values()).reverse();
        const conversationText = sortedMessages.map(m => `${m.author.username}: ${m.content}`).join('\n');

        const summaryPrompt = `
নিচের কথোপকথনটি সারসংক্ষেপ (Summarize) করো।
"AUTO THREAD SUMMARY" মডিউল ব্যবহার করো।

ফরম্যাট:
**মূল পয়েন্ট**
...
**গুরুত্বপূর্ণ আলোচনা**
...
**নির্ণয় / সিদ্ধান্ত**
...
**পরবর্তী Step**
...

কথোপকথন:
${conversationText}
        `;

        const aiResponse = await getChatResponse([{ role: "user", content: summaryPrompt }]);

        const embed = new EmbedBuilder()
            .setColor(0x00AA00)
            .setTitle('📝 আলোচনার সারসংক্ষেপ (Thread Summary)')
            .setDescription(aiResponse)
            .setFooter({ text: 'Jerry - Auto Thread Summary' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    } catch (err) {
        console.error("Error generating summary:", err);
        return message.reply("দুঃখিত, সারসংক্ষেপ তৈরি করতে সমস্যা হয়েছে।");
    }
}

module.exports = { generateThreadSummary };
