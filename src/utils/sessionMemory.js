const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

class SessionMemory {
    constructor() {
        this.conversations = {};
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(CONVERSATIONS_FILE)) {
                const data = fs.readFileSync(CONVERSATIONS_FILE, 'utf8');
                this.conversations = JSON.parse(data);
            }
        } catch (error) {
            console.error("Error loading conversations:", error);
            this.conversations = {};
        }
    }

    save() {
        try {
            fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(this.conversations, null, 2));
        } catch (error) {
            console.error("Error saving conversations:", error);
        }
    }

    getSession(userId) {
        if (!this.conversations[userId]) {
            this.conversations[userId] = [];
        }
        return this.conversations[userId];
    }

    addMessageToSession(userId, message) {
        const session = this.getSession(userId);
        session.push(message);

        // No limit as requested by user.
        // Warning: This will grow indefinitely.

        this.save();
    }

    clearSession(userId) {
        delete this.conversations[userId];
        this.save();
    }
}

const sessionMemory = new SessionMemory();

module.exports = {
    getSession: (userId) => sessionMemory.getSession(userId),
    addMessageToSession: (userId, message) => sessionMemory.addMessageToSession(userId, message),
    clearSession: (userId) => sessionMemory.clearSession(userId)
};
