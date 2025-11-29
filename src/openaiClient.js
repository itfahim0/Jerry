const OpenAI = require("openai");
require('dotenv').config();
const systemPrompt = require('./systemPrompt');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getChatResponse(messages, imageUrl = null) {
    try {
        // If an image URL is provided, we need to format the last user message to include the image
        let finalMessages = [...messages];

        if (imageUrl) {
            const lastMessageIndex = finalMessages.length - 1;
            const lastMessage = finalMessages[lastMessageIndex];

            if (lastMessage.role === 'user') {
                finalMessages[lastMessageIndex] = {
                    role: 'user',
                    content: [
                        { type: "text", text: lastMessage.content },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageUrl,
                            },
                        },
                    ],
                };
            }
        }

        const conversation = [
            { role: "system", content: systemPrompt },
            ...finalMessages
        ];

        const completion = await openai.chat.completions.create({
            messages: conversation,
            model: "gpt-4o-mini", // Supports vision
            max_tokens: 500,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return "দুঃখিত বন্ধু, আমার মস্তিষ্কে একটু সমস্যা হচ্ছে। পরে আবার চেষ্টা করো!";
    }
}

module.exports = { getChatResponse };
