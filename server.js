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

// Language configurations
const languageConfig = {
    spanish: {
        name: 'Spanish',
        nativeName: 'Español',
        code: 'es',
        voice: 'nova'
    },
    chinese: {
        name: 'Chinese',
        nativeName: '中文',
        code: 'zh',
        voice: 'alloy'
    },
    hindi: {
        name: 'Hindi',
        nativeName: 'हिन्दी',
        code: 'hi',
        voice: 'alloy'
    },
    urdu: {
        name: 'Urdu',
        nativeName: 'اردو',
        code: 'ur',
        voice: 'onyx'
    },
    french: {
        name: 'French',
        nativeName: 'Français',
        code: 'fr',
        voice: 'nova'
    },
    arabic: {
        name: 'Arabic',
        nativeName: 'العربية',
        code: 'ar',
        voice: 'onyx'
    },
    russian: {
        name: 'Russian',
        nativeName: 'Русский',
        code: 'ru',
        voice: 'alloy'
    },
    german: {
        name: 'German',
        nativeName: 'Deutsch',
        code: 'de',
        voice: 'nova'
    },
    japanese: {
        name: 'Japanese',
        nativeName: '日本語',
        code: 'ja',
        voice: 'alloy'
    },
    korean: {
        name: 'Korean',
        nativeName: '한국어',
        code: 'ko',
        voice: 'nova'
    }
};

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
        const { language, gradeLevel } = req.body;
        
        if (!language || !languageConfig[language]) {
            return res.status(400).json({ error: 'Invalid language' });
        }
        
        if (!gradeLevel || !gradeConfigs[gradeLevel]) {
            return res.status(400).json({ error: 'Invalid grade level' });
        }
        
        const langInfo = languageConfig[language];
        const config = gradeConfigs[gradeLevel];
        
        const prompt = `Generate an engaging and educational ${langInfo.name} story appropriate for a ${gradeLevel === 'K' ? 'Kindergarten' : 'Grade ' + gradeLevel} student learning ${langInfo.name}. 

Requirements:
- Write ONLY in ${langInfo.name} (${langInfo.nativeName}) - no English in the story
- Complexity level: ${config.complexity}
- Length: ${config.wordCount} words
- Use vocabulary appropriate for: ${config.vocabulary}
- Make the story interesting and age-appropriate
- Include simple dialogue if appropriate for the grade level
- Use proper ${langInfo.name} grammar, accents, and punctuation
- Create a story with a clear beginning, middle, and end
- Choose a random topic (animals, family, school, adventure, nature, friends, etc.)

Write the complete story now in ${langInfo.name}:`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a ${langInfo.name} language teacher who creates engaging, age-appropriate stories in ${langInfo.name} for students. You write ONLY in ${langInfo.name} with proper grammar and accents.`
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
        
        // Extract all unique words from the story
        const words = story.match(/[\wáéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙäöüßÄÖÜẞëïËÏâêîôûÂÊÎÔÛçÇčšžČŠŽæøåÆØÅ\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0900-\u097F]+/g) || [];
        const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
        
        // Get translations for all words
        const translations = await getTranslations(uniqueWords, language);
        
        res.json({
            story,
            translations
        });
        
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({ error: 'Failed to generate story' });
    }
});

// Text-to-Speech Endpoint
app.post('/api/text-to-speech', async (req, res) => {
    try {
        const { text, language } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        if (!language || !languageConfig[language]) {
            return res.status(400).json({ error: 'Invalid language' });
        }
        
        const langInfo = languageConfig[language];
        
        // Generate speech using OpenAI TTS API
        const mp3Response = await openai.audio.speech.create({
            model: 'tts-1',
            voice: langInfo.voice,
            input: text,
            speed: 1.0
        });
        
        // Convert the response to a buffer
        const buffer = Buffer.from(await mp3Response.arrayBuffer());
        
        // Set appropriate headers
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'public, max-age=31536000'
        });
        
        res.send(buffer);
        
    } catch (error) {
        console.error('Error generating audio:', error);
        res.status(500).json({ error: 'Failed to generate audio' });
    }
});

// Generate Quiz Endpoint
app.post('/api/generate-quiz', async (req, res) => {
    try {
        const { story, language } = req.body;
        
        if (!story) {
            return res.status(400).json({ error: 'Story is required' });
        }
        
        const langInfo = languageConfig[language] || { name: 'target language' };
        
        const prompt = `Based on the following ${langInfo.name} story, generate 3 comprehension questions in English. The questions should test understanding of the story content.

Story:
${story}

Generate exactly 3 questions with the following format:
- 2 questions should be TRUE/FALSE questions
- 1 question should be a SHORT ANSWER question that can be answered in 1-3 words

Return ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "true-false",
      "correctAnswer": "true"
    },
    {
      "question": "Another question here",
      "type": "true-false",
      "correctAnswer": "false"
    },
    {
      "question": "Short answer question here",
      "type": "short-answer",
      "correctAnswer": "expected answer"
    }
  ]
}

DO NOT include any text outside the JSON object. Make questions clear and unambiguous.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a language teacher creating quiz questions. Return ONLY valid JSON, no other text.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });
        
        let result = completion.choices[0].message.content.trim();
        // Remove markdown code blocks if present
        result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const quizData = JSON.parse(result);
        
        res.json(quizData);
        
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// Grade Quiz Endpoint
app.post('/api/grade-quiz', async (req, res) => {
    try {
        const { questions, answers } = req.body;
        
        if (!questions || !answers || questions.length !== answers.length) {
            return res.status(400).json({ error: 'Invalid quiz data' });
        }
        
        const results = [];
        let score = 0;
        
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const userAnswer = answers[i];
            const correctAnswer = question.correctAnswer.toLowerCase();
            
            let isCorrect = false;
            let feedback = '';
            
            if (question.type === 'true-false') {
                isCorrect = userAnswer.toLowerCase() === correctAnswer;
                if (!isCorrect) {
                    feedback = `The correct answer is: ${correctAnswer.charAt(0).toUpperCase() + correctAnswer.slice(1)}`;
                }
            } else {
                // For short answer, use GPT to evaluate
                const evalPrompt = `Evaluate if the user's answer is correct for this question.

Question: ${question.question}
Expected Answer: ${correctAnswer}
User's Answer: ${userAnswer}

Return ONLY a JSON object in this format:
{
  "correct": true or false,
  "feedback": "brief explanation if incorrect, empty string if correct"
}`;

                const evalCompletion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are evaluating quiz answers. Be lenient with spelling and accept synonyms. Return ONLY valid JSON.'
                        },
                        {
                            role: 'user',
                            content: evalPrompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 100
                });
                
                let evalResult = evalCompletion.choices[0].message.content.trim();
                evalResult = evalResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const evaluation = JSON.parse(evalResult);
                
                isCorrect = evaluation.correct;
                feedback = evaluation.feedback || '';
            }
            
            if (isCorrect) {
                score++;
            }
            
            results.push({
                correct: isCorrect,
                userAnswer: userAnswer,
                feedback: feedback
            });
        }
        
        res.json({
            score: score,
            total: questions.length,
            results: results
        });
        
    } catch (error) {
        console.error('Error grading quiz:', error);
        res.status(500).json({ error: 'Failed to grade quiz' });
    }
});

// Translate Word Endpoint
app.post('/api/translate', async (req, res) => {
    try {
        const { word, language } = req.body;
        
        if (!word) {
            return res.status(400).json({ error: 'Word is required' });
        }
        
        const langInfo = languageConfig[language] || { name: 'target language' };
        const translation = await translateWord(word, langInfo.name);
        
        res.json({ translation });
        
    } catch (error) {
        console.error('Error translating word:', error);
        res.status(500).json({ error: 'Failed to translate word' });
    }
});

// Helper function to translate a single word
async function translateWord(word, languageName) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a translator. Provide concise, accurate translations. Return ONLY the English translation, nothing else.'
                },
                {
                    role: 'user',
                    content: `Translate this ${languageName} word to English: "${word}". Give only the most common English translation, no explanations.`
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
async function getTranslations(words, language) {
    const translations = {};
    const langInfo = languageConfig[language];
    
    // Common words cache for supported languages
    const commonTranslations = {
        spanish: {
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
            'todo': 'all', 'cada': 'each', 'otro': 'other'
        },
        french: {
            'le': 'the', 'la': 'the', 'les': 'the', 'un': 'a', 'une': 'a',
            'et': 'and', 'ou': 'or', 'mais': 'but', 'de': 'of', 'à': 'to',
            'dans': 'in', 'avec': 'with', 'pour': 'for', 'sur': 'on',
            'est': 'is', 'sont': 'are', 'être': 'to be', 'avoir': 'to have',
            'que': 'that', 'qui': 'who', 'oui': 'yes', 'non': 'no'
        },
        german: {
            'der': 'the', 'die': 'the', 'das': 'the', 'ein': 'a', 'eine': 'a',
            'und': 'and', 'oder': 'or', 'aber': 'but', 'in': 'in', 'zu': 'to',
            'mit': 'with', 'für': 'for', 'auf': 'on', 'von': 'from',
            'ist': 'is', 'sind': 'are', 'sein': 'to be', 'haben': 'to have',
            'ja': 'yes', 'nein': 'no', 'nicht': 'not'
        }
    };
    
    // Apply common translations if available
    if (commonTranslations[language]) {
        for (const word of words) {
            if (commonTranslations[language][word]) {
                translations[word] = commonTranslations[language][word];
            }
        }
    }
    
    // Batch translate remaining words (limit to avoid rate limits)
    const wordsToTranslate = words.filter(w => !translations[w]).slice(0, 100);
    
    if (wordsToTranslate.length > 0) {
        try {
            const batchPrompt = `Translate these ${langInfo.name} words to English. Return ONLY a JSON object with ${langInfo.name} words as keys and English translations as values. Format: {"word1": "translation1", "word2": "translation2"}

${langInfo.name} words: ${wordsToTranslate.join(', ')}`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a ${langInfo.name}-English translator. Provide accurate translations in JSON format.`
                    },
                    {
                        role: 'user',
                        content: batchPrompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1500
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
    console.log(`Language Learning Reader server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to use the application`);
});
