const express = require('express');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Grade level configurations
const gradeConfigs = {
    'K': { complexity: 'very simple', wordCount: '50-75', vocabulary: 'basic animals, colors, family words' },
    '1': { complexity: 'simple', wordCount: '75-100', vocabulary: 'basic nouns, common verbs, simple adjectives' },
    '2': { complexity: 'simple', wordCount: '100-150', vocabulary: 'everyday objects, simple actions, basic descriptions' },
    '3': { complexity: 'elementary', wordCount: '150-200', vocabulary: 'expanded vocabulary with simple past tense' },
    '4': { complexity: 'elementary', wordCount: '200-250', vocabulary: 'more complex sentences and common idioms' },
    '5': { complexity: 'intermediate', wordCount: '250-300', vocabulary: 'varied vocabulary with multiple tenses' },
    '6': { complexity: 'intermediate', wordCount: '300-350', vocabulary: 'descriptive language and compound sentences' },
    '7': { complexity: 'intermediate-advanced', wordCount: '350-400', vocabulary: 'more sophisticated vocabulary and expressions' },
    '8': { complexity: 'intermediate-advanced', wordCount: '400-450', vocabulary: 'complex sentence structures and varied vocabulary' },
    '9': { complexity: 'advanced', wordCount: '450-500', vocabulary: 'advanced vocabulary with subjunctive mood' },
    '10': { complexity: 'advanced', wordCount: '500-550', vocabulary: 'sophisticated expressions and literary devices' },
    '11': { complexity: 'advanced', wordCount: '550-600', vocabulary: 'complex grammar and nuanced vocabulary' },
    '12': { complexity: 'very advanced', wordCount: '600-700', vocabulary: 'near-native vocabulary and complex structures' }
};

// Generate Story Endpoint
app.post('/api/generate-story', async (req, res) => {
    try {
        const { gradeLevel } = req.body;
        
        if (!gradeLevel || !gradeConfigs[gradeLevel]) {
            return res.status(400).json({ error: 'Invalid grade level' });
        }
        
        const config = gradeConfigs[gradeLevel];
        
        const prompt = `Generate an engaging and educational Spanish story appropriate for a ${gradeLevel === 'K' ? 'Kindergarten' : 'Grade ' + gradeLevel} student learning Spanish. 

Requirements:
- Write ONLY in Spanish (no English in the story)
- Complexity level: ${config.complexity}
- Length: ${config.wordCount} words
- Use vocabulary appropriate for: ${config.vocabulary}
- Make the story interesting and age-appropriate
- Include simple dialogue if appropriate for the grade level
- Use proper Spanish grammar, accents, and punctuation
- Create a story with a clear beginning, middle, and end
- Choose a random topic (animals, family, school, adventure, nature, friends, etc.)

Write the complete story now in Spanish:`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a Spanish language teacher who creates engaging, age-appropriate stories in Spanish for students. You write ONLY in Spanish with proper grammar and accents.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.9,
            max_tokens: 1000
        });
        
        const story = completion.choices[0].message.content.trim();
        
        // Extract all unique Spanish words from the story
        const words = story.match(/[áéíóúñüÁÉÍÓÚÑÜa-zA-Z]+/g) || [];
        const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
        
        // Get translations for all words
        const translations = await getTranslations(uniqueWords);
        
        res.json({
            story,
            translations
        });
        
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({ error: 'Failed to generate story' });
    }
});

// Translate Word Endpoint
app.post('/api/translate', async (req, res) => {
    try {
        const { word } = req.body;
        
        if (!word) {
            return res.status(400).json({ error: 'Word is required' });
        }
        
        const translation = await translateWord(word);
        
        res.json({ translation });
        
    } catch (error) {
        console.error('Error translating word:', error);
        res.status(500).json({ error: 'Failed to translate word' });
    }
});

// Helper function to translate a single word
async function translateWord(word) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a Spanish-English translator. Provide concise, accurate translations. Return ONLY the English translation, nothing else.'
                },
                {
                    role: 'user',
                    content: `Translate this Spanish word to English: "${word}". Give only the most common English translation, no explanations.`
                }
            ],
            temperature: 0.3,
            max_tokens: 50
        });
        
        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error(`Error translating word "${word}":`, error);
        return word; // Return original word if translation fails
    }
}

// Helper function to get translations for multiple words
async function getTranslations(words) {
    const translations = {};
    
    // Common words cache to avoid API calls
    const commonTranslations = {
        'el': 'the', 'la': 'the', 'los': 'the', 'las': 'the',
        'un': 'a', 'una': 'a', 'unos': 'some', 'unas': 'some',
        'y': 'and', 'o': 'or', 'pero': 'but', 'porque': 'because',
        'de': 'of', 'en': 'in', 'a': 'to', 'con': 'with', 'por': 'by',
        'para': 'for', 'sin': 'without', 'sobre': 'about',
        'es': 'is', 'son': 'are', 'está': 'is', 'están': 'are',
        'ser': 'to be', 'estar': 'to be', 'tener': 'to have',
        'hacer': 'to do', 'ir': 'to go', 'ver': 'to see',
        'que': 'that', 'qué': 'what', 'como': 'like', 'cómo': 'how',
        'cuando': 'when', 'cuándo': 'when', 'donde': 'where', 'dónde': 'where',
        'quien': 'who', 'quién': 'who', 'cual': 'which', 'cuál': 'which',
        'si': 'if', 'sí': 'yes', 'no': 'no', 'muy': 'very',
        'más': 'more', 'menos': 'less', 'mucho': 'much', 'poco': 'little',
        'todo': 'all', 'cada': 'each', 'otro': 'other',
        'este': 'this', 'ese': 'that', 'aquel': 'that',
        'yo': 'I', 'tú': 'you', 'él': 'he', 'ella': 'she',
        'nosotros': 'we', 'vosotros': 'you', 'ellos': 'they', 'ellas': 'they',
        'mi': 'my', 'tu': 'your', 'su': 'his/her', 'nuestro': 'our'
    };
    
    // First, add common translations
    for (const word of words) {
        if (commonTranslations[word]) {
            translations[word] = commonTranslations[word];
        }
    }
    
    // Batch translate remaining words (limit to avoid rate limits)
    const wordsToTranslate = words.filter(w => !translations[w]).slice(0, 100);
    
    if (wordsToTranslate.length > 0) {
        try {
            const batchPrompt = `Translate these Spanish words to English. Return ONLY a JSON object with Spanish words as keys and English translations as values. Format: {"word1": "translation1", "word2": "translation2"}

Spanish words: ${wordsToTranslate.join(', ')}`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Spanish-English translator. Provide accurate translations in JSON format.'
                    },
                    {
                        role: 'user',
                        content: batchPrompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            });
            
            const result = completion.choices[0].message.content.trim();
            // Remove markdown code blocks if present
            const cleanResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const batchTranslations = JSON.parse(cleanResult);
            
            Object.assign(translations, batchTranslations);
        } catch (error) {
            console.error('Error in batch translation:', error);
        }
    }
    
    return translations;
}

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Spanish Learning Reader server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to use the application`);
});
