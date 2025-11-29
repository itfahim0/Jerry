const fs = require('fs');
const path = require('path');
const fileParser = require('./fileParser');
const knowledgeBase = require('./knowledgeBase');

const DOCUMENTS_DIR = path.join(__dirname, '../../documents');

// Ensure documents directory exists
if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

async function ingestAll() {
    console.log("Starting document ingestion...");

    try {
        const files = fs.readdirSync(DOCUMENTS_DIR);

        for (const file of files) {
            const filePath = path.join(DOCUMENTS_DIR, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) continue;
            if (file.startsWith('.')) continue; // Ignore hidden files like .gitkeep

            // Check if file is already in knowledge base
            // We now allow re-ingestion to support updates.
            // if (knowledgeBase.hasDocument(file)) {
            //     // console.log(`Skipping ${file} (already ingested)`);
            //     continue;
            // }

            console.log(`Ingesting new file: ${file}`);

            const text = await fileParser.parseFile(filePath);

            if (text && text.trim().length > 0) {
                await knowledgeBase.addDocument(text, file);
                console.log(`Successfully ingested ${file}`);
            } else {
                console.warn(`Could not extract text from ${file}`);
            }
        }

        console.log("Document ingestion complete.");
    } catch (error) {
        console.error("Error during document ingestion:", error);
    }
}

module.exports = { ingestAll };
