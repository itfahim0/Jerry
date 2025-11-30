const { transcribeAudio } = require('../openaiClient');

async function handleVoiceMessage(message) {
    const audioAttachment = message.attachments.find(a => a.contentType && a.contentType.startsWith('audio/'));
    if (!audioAttachment) return null;

    console.log("Audio detected, transcribing...");
    const transcription = await transcribeAudio(audioAttachment.url);

    if (transcription) {
        console.log("Transcription:", transcription);
        return `\n[User sent an audio file. Transcription: "${transcription}"]`;
    } else {
        return `\n[User sent an audio file, but transcription failed.]`;
    }
}

module.exports = { handleVoiceMessage };
