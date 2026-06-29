const translate = require('google-translate-api-x');

class TranslationService {
    constructor() {
        // No API keys needed for Google Translate Free API
    }

    async translate(text, sourceLang, targetLang) {
        if (!text || text.trim() === '') return text;

        try {
            // Max size for free Google Translate is 5000 characters. 
            // We use a conservative limit of 3500 characters to be safe.
            const MAX_CHUNK_SIZE = 3500;
            
            if (text.length <= MAX_CHUNK_SIZE) {
                const response = await translate(text, {
                    from: sourceLang === 'en' ? 'en' : sourceLang,
                    to: targetLang,
                    forceBatch: false
                });
                return response.text;
            }

            console.log(`Text is long (${text.length} chars). Splitting into chunks...`);
            const paragraphs = text.split('\n');
            const chunks = [];
            let currentChunk = '';

            for (const paragraph of paragraphs) {
                if ((currentChunk + '\n' + paragraph).length > MAX_CHUNK_SIZE) {
                    if (currentChunk.trim() !== '') {
                        chunks.push(currentChunk);
                        currentChunk = '';
                    }
                    
                    // If a single paragraph is larger than MAX_CHUNK_SIZE, split it by sentence or length
                    if (paragraph.length > MAX_CHUNK_SIZE) {
                        let tempParagraph = paragraph;
                        while (tempParagraph.length > MAX_CHUNK_SIZE) {
                            let splitIndex = tempParagraph.lastIndexOf('. ', MAX_CHUNK_SIZE);
                            if (splitIndex === -1) {
                                splitIndex = tempParagraph.lastIndexOf(' ', MAX_CHUNK_SIZE);
                            }
                            if (splitIndex === -1) {
                                splitIndex = MAX_CHUNK_SIZE;
                            }
                            chunks.push(tempParagraph.substring(0, splitIndex));
                            tempParagraph = tempParagraph.substring(splitIndex).trim();
                        }
                        if (tempParagraph.trim() !== '') {
                            currentChunk = tempParagraph;
                        }
                    } else {
                        currentChunk = paragraph;
                    }
                } else {
                    currentChunk = currentChunk === '' ? paragraph : currentChunk + '\n' + paragraph;
                }
            }
            if (currentChunk.trim() !== '') {
                chunks.push(currentChunk);
            }

            console.log(`Translating ${chunks.length} chunks...`);
            const translatedChunks = [];
            for (let i = 0; i < chunks.length; i++) {
                console.log(`Translating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`);
                const response = await translate(chunks[i], {
                    from: sourceLang === 'en' ? 'en' : sourceLang,
                    to: targetLang,
                    forceBatch: false
                });
                translatedChunks.push(response.text);
                // Introduce a tiny delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            return translatedChunks.join('\n');
        } catch (error) {
            console.error('Translation Error:', error);
            return text;
        }
    }
}

module.exports = new TranslationService();
