const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const cheerio = require('cheerio');
const axios = require('axios');

async function parseFile(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();

    try {
        if (extension === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (extension === 'docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } else if (extension === 'txt' || extension === 'md') {
            return fs.readFileSync(filePath, 'utf8');
        } else {
            console.warn(`Unsupported file type: ${extension}`);
            return null;
        }
    } catch (error) {
        console.error(`Error parsing file ${filePath}:`, error);
        return null;
    }
}

async function parseUrl(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Remove scripts, styles, and other non-content elements
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove();

        // Get text from body
        const text = $('body').text();

        // Clean up whitespace
        return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.error(`Error parsing URL ${url}:`, error);
        return null;
    }
}

module.exports = { parseFile, parseUrl };
