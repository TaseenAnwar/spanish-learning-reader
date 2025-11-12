// DOM Elements
const languageSelect = document.getElementById('language-select');
const gradeSelect = document.getElementById('grade-level');
const generateBtn = document.getElementById('generate-btn');
const newStoryBtn = document.getElementById('new-story-btn');
const audioBtn = document.getElementById('audio-btn');
const quizBtn = document.getElementById('quiz-btn');
const backToStoryBtn = document.getElementById('back-to-story-btn');
const retakeQuizBtn = document.getElementById('retake-quiz-btn');
const newStoryFromQuizBtn = document.getElementById('new-story-from-quiz-btn');

const generationSection = document.getElementById('generation-section');
const storySection = document.getElementById('story-section');
const quizSection = document.getElementById('quiz-section');

const storyContent = document.getElementById('story-content');
const storyLanguageSpan = document.getElementById('story-language');
const loading = document.getElementById('loading');
const audioLoading = document.getElementById('audio-loading');
const quizLoading = document.getElementById('quiz-loading');
const errorMessage = document.getElementById('error-message');
const tooltip = document.getElementById('tooltip');
const storyAudio = document.getElementById('story-audio');

const quizContent = document.getElementById('quiz-content');
const quizForm = document.getElementById('quiz-form');
const quizQuestions = document.getElementById('quiz-questions');
const quizResults = document.getElementById('quiz-results');
const scoreText = document.getElementById('score-text');
const scoreMessage = document.getElementById('score-message');
const questionFeedback = document.getElementById('question-feedback');

// State
let currentStory = null;
let currentLanguage = null;
let translations = {};
let audioUrl = null;
let isPlaying = false;
let quizData = null;

// Language configuration
const languageConfig = {
    spanish: { name: 'Spanish', nativeName: 'Español' },
    chinese: { name: 'Chinese', nativeName: '中文' },
    hindi: { name: 'Hindi', nativeName: 'हिन्दी' },
    urdu: { name: 'Urdu', nativeName: 'اردو' },
    french: { name: 'French', nativeName: 'Français' },
    arabic: { name: 'Arabic', nativeName: 'العربية' },
    russian: { name: 'Russian', nativeName: 'Русский' },
    german: { name: 'German', nativeName: 'Deutsch' },
    japanese: { name: 'Japanese', nativeName: '日本語' },
    korean: { name: 'Korean', nativeName: '한국어' }
};

// Event Listeners
generateBtn.addEventListener('click', generateStory);
newStoryBtn.addEventListener('click', showGenerationSection);
newStoryFromQuizBtn.addEventListener('click', showGenerationSection);
audioBtn.addEventListener('click', handleAudioClick);
quizBtn.addEventListener('click', showQuiz);
backToStoryBtn.addEventListener('click', backToStory);
retakeQuizBtn.addEventListener('click', retakeQuiz);
quizForm.addEventListener('submit', submitQuiz);

// Audio element event listeners
storyAudio.addEventListener('ended', () => {
    isPlaying = false;
    updateAudioButton();
});

storyAudio.addEventListener('play', () => {
    isPlaying = true;
    updateAudioButton();
});

storyAudio.addEventListener('pause', () => {
    isPlaying = false;
    updateAudioButton();
});

// Generate Story Function
async function generateStory() {
    const language = languageSelect.value;
    const gradeLevel = gradeSelect.value;
    
    if (!language) {
        showError('Please select a language first.');
        return;
    }
    
    if (!gradeLevel) {
        showError('Please select a grade level first.');
        return;
    }
    
    // UI Updates
    generateBtn.disabled = true;
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    
    try {
        const response = await fetch('/api/generate-story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ language, gradeLevel })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate story');
        }
        
        const data = await response.json();
        currentStory = data.story;
        currentLanguage = language;
        translations = data.translations;
        
        displayStory(currentStory, language);
        
    } catch (error) {
        console.error('Error generating story:', error);
        showError('Sorry, there was an error generating your story. Please try again.');
    } finally {
        generateBtn.disabled = false;
        loading.classList.add('hidden');
    }
}

// Display Story Function
function displayStory(story, language) {
    storyContent.innerHTML = '';
    
    // Update language display
    const langInfo = languageConfig[language];
    storyLanguageSpan.textContent = langInfo.name;
    
    // Split story into paragraphs
    const paragraphs = story.split('\n').filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        
        // Split paragraph into words and punctuation
        const tokens = paragraph.match(/[\wáéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙäöüßÄÖÜẞëïËÏâêîôûÂÊÎÔÛçÇčšžČŠŽæøåÆØÅ\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0900-\u097F]+|[^\wáéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙäöüßÄÖÜẞëïËÏâêîôûÂÊÎÔÛçÇčšžČŠŽæøåÆØÅ\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0900-\u097F\s]+/g) || [];
        
        tokens.forEach(token => {
            if (/[\wáéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙäöüßÄÖÜẞëïËÏâêîôûÂÊÎÔÛçÇčšžČŠŽæøåÆØÅ\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0900-\u097F]+/.test(token)) {
                // It's a word
                const span = document.createElement('span');
                span.className = 'word';
                span.textContent = token;
                span.dataset.word = token.toLowerCase();
                
                // Add event listeners for translation
                span.addEventListener('mouseenter', showTranslation);
                span.addEventListener('mouseleave', hideTranslation);
                
                p.appendChild(span);
            } else {
                // It's punctuation or space
                p.appendChild(document.createTextNode(token));
            }
        });
        
        storyContent.appendChild(p);
    });
    
    // Reset audio and quiz state
    audioUrl = null;
    isPlaying = false;
    quizData = null;
    storyAudio.pause();
    storyAudio.src = '';
    updateAudioButton();
    
    // Show story section and hide generation section
    generationSection.classList.add('hidden');
    quizSection.classList.add('hidden');
    storySection.classList.remove('hidden');
}

// Handle Audio Button Click
async function handleAudioClick() {
    if (isPlaying) {
        // Pause audio
        storyAudio.pause();
        isPlaying = false;
        updateAudioButton();
        return;
    }
    
    if (audioUrl) {
        // Play existing audio
        storyAudio.play();
        isPlaying = true;
        updateAudioButton();
        return;
    }
    
    // Generate and play new audio
    await generateAndPlayAudio();
}

// Generate and Play Audio
async function generateAndPlayAudio() {
    audioBtn.disabled = true;
    audioLoading.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: currentStory, language: currentLanguage })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate audio');
        }
        
        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
        
        storyAudio.src = audioUrl;
        storyAudio.play();
        isPlaying = true;
        updateAudioButton();
        
    } catch (error) {
        console.error('Error generating audio:', error);
        showError('Sorry, there was an error generating the audio. Please try again.');
    } finally {
        audioBtn.disabled = false;
        audioLoading.classList.add('hidden');
    }
}

// Update Audio Button Appearance
function updateAudioButton() {
    const audioIcon = audioBtn.querySelector('.audio-icon');
    const audioText = audioBtn.querySelector('.audio-text');
    
    if (isPlaying) {
        audioIcon.textContent = '⏸️';
        audioText.textContent = 'Pause Audio';
        audioBtn.classList.add('playing');
    } else if (audioUrl) {
        audioIcon.textContent = '▶️';
        audioText.textContent = 'Play Audio';
        audioBtn.classList.remove('playing');
    } else {
        audioIcon.textContent = '🔊';
        audioText.textContent = 'Listen to Story';
        audioBtn.classList.remove('playing');
    }
}

// Show Quiz
async function showQuiz() {
    if (quizData) {
        // Quiz already generated, just show it
        displayQuiz(quizData);
        return;
    }
    
    // Generate new quiz
    storySection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    quizLoading.classList.remove('hidden');
    quizContent.classList.add('hidden');
    quizResults.classList.add('hidden');
    
    try {
        const response = await fetch('/api/generate-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ story: currentStory, language: currentLanguage })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate quiz');
        }
        
        quizData = await response.json();
        displayQuiz(quizData);
        
    } catch (error) {
        console.error('Error generating quiz:', error);
        showError('Sorry, there was an error generating the quiz. Please try again.');
        backToStory();
    } finally {
        quizLoading.classList.add('hidden');
    }
}

// Display Quiz
function displayQuiz(quiz) {
    quizQuestions.innerHTML = '';
    
    quiz.questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        
        const questionNumber = document.createElement('div');
        questionNumber.className = 'question-number';
        questionNumber.textContent = `Question ${index + 1}`;
        
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.textContent = q.question;
        
        const questionType = document.createElement('div');
        questionType.className = 'question-type';
        questionType.textContent = q.type === 'true-false' ? '(True/False)' : '(Short Answer)';
        
        questionDiv.appendChild(questionNumber);
        questionDiv.appendChild(questionText);
        questionDiv.appendChild(questionType);
        
        if (q.type === 'true-false') {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'true-false-options';
            
            const trueOption = document.createElement('div');
            trueOption.className = 'tf-option';
            trueOption.textContent = 'True';
            trueOption.dataset.value = 'true';
            trueOption.dataset.questionIndex = index;
            
            const falseOption = document.createElement('div');
            falseOption.className = 'tf-option';
            falseOption.textContent = 'False';
            falseOption.dataset.value = 'false';
            falseOption.dataset.questionIndex = index;
            
            trueOption.addEventListener('click', selectTrueFalse);
            falseOption.addEventListener('click', selectTrueFalse);
            
            optionsDiv.appendChild(trueOption);
            optionsDiv.appendChild(falseOption);
            questionDiv.appendChild(optionsDiv);
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'answer-input';
            input.name = `answer-${index}`;
            input.placeholder = 'Type your answer here...';
            input.required = true;
            questionDiv.appendChild(input);
        }
        
        quizQuestions.appendChild(questionDiv);
    });
    
    storySection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    quizContent.classList.remove('hidden');
    quizResults.classList.add('hidden');
}

// Select True/False Option
function selectTrueFalse(e) {
    const option = e.target;
    const questionIndex = option.dataset.questionIndex;
    const value = option.dataset.value;
    
    // Deselect all options for this question
    document.querySelectorAll(`[data-question-index="${questionIndex}"]`).forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select this option
    option.classList.add('selected');
    option.dataset.selected = value;
}

// Submit Quiz
async function submitQuiz(e) {
    e.preventDefault();
    
    // Collect answers
    const answers = [];
    quizData.questions.forEach((q, index) => {
        if (q.type === 'true-false') {
            const selected = document.querySelector(`[data-question-index="${index}"].selected`);
            if (!selected) {
                showError('Please answer all questions before submitting.');
                throw new Error('Incomplete quiz');
            }
            answers.push(selected.dataset.value);
        } else {
            const input = document.querySelector(`input[name="answer-${index}"]`);
            if (!input.value.trim()) {
                showError('Please answer all questions before submitting.');
                throw new Error('Incomplete quiz');
            }
            answers.push(input.value.trim());
        }
    });
    
    // Grade quiz
    try {
        const response = await fetch('/api/grade-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questions: quizData.questions,
                answers: answers
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to grade quiz');
        }
        
        const results = await response.json();
        displayResults(results);
        
    } catch (error) {
        if (error.message !== 'Incomplete quiz') {
            console.error('Error grading quiz:', error);
            showError('Sorry, there was an error grading the quiz. Please try again.');
        }
    }
}

// Display Quiz Results
function displayResults(results) {
    const score = results.score;
    const totalQuestions = results.results.length;
    
    // Update score display
    scoreText.textContent = `${score}/${totalQuestions}`;
    
    // Update message
    const percentage = (score / totalQuestions) * 100;
    if (percentage === 100) {
        scoreMessage.textContent = '🎉 Perfect score! Excellent work!';
    } else if (percentage >= 66) {
        scoreMessage.textContent = '👏 Great job! Keep it up!';
    } else if (percentage >= 33) {
        scoreMessage.textContent = '👍 Good effort! Try reading the story again.';
    } else {
        scoreMessage.textContent = '💪 Keep practicing! You can do better!';
    }
    
    // Display feedback for each question
    questionFeedback.innerHTML = '';
    results.results.forEach((result, index) => {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `feedback-item ${result.correct ? 'correct' : 'incorrect'}`;
        
        const questionText = document.createElement('div');
        questionText.className = 'feedback-question';
        questionText.textContent = `Question ${index + 1}: ${quizData.questions[index].question}`;
        
        const userAnswer = document.createElement('div');
        userAnswer.className = 'feedback-answer';
        userAnswer.textContent = `Your answer: ${result.userAnswer}`;
        
        const status = document.createElement('div');
        status.className = `feedback-status ${result.correct ? 'correct' : 'incorrect'}`;
        status.textContent = result.correct ? '✓ Correct!' : `✗ Incorrect. ${result.feedback || ''}`;
        
        feedbackDiv.appendChild(questionText);
        feedbackDiv.appendChild(userAnswer);
        feedbackDiv.appendChild(status);
        
        questionFeedback.appendChild(feedbackDiv);
    });
    
    // Show results
    quizContent.classList.add('hidden');
    quizResults.classList.remove('hidden');
}

// Retake Quiz
function retakeQuiz() {
    displayQuiz(quizData);
}

// Back to Story
function backToStory() {
    quizSection.classList.add('hidden');
    storySection.classList.remove('hidden');
}

// Show Translation Function
async function showTranslation(event) {
    const word = event.target.dataset.word;
    const cleanWord = word.replace(/[¿?¡!,;:.。、！？]/g, '').toLowerCase();
    
    // Check if we already have the translation
    if (translations[cleanWord]) {
        displayTooltip(event.target, translations[cleanWord]);
        return;
    }
    
    // Fetch translation from server
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ word: cleanWord, language: currentLanguage })
        });
        
        if (response.ok) {
            const data = await response.json();
            translations[cleanWord] = data.translation;
            displayTooltip(event.target, data.translation);
        }
    } catch (error) {
        console.error('Error fetching translation:', error);
    }
}

// Hide Translation Function
function hideTranslation() {
    tooltip.classList.add('hidden');
}

// Display Tooltip Function
function displayTooltip(element, translation) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    tooltip.textContent = translation;
    tooltip.classList.remove('hidden');
    
    // Position tooltip above the word
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
    const top = rect.top + scrollTop - tooltipRect.height - 10;
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

// Show Generation Section Function
function showGenerationSection() {
    storySection.classList.add('hidden');
    quizSection.classList.add('hidden');
    generationSection.classList.remove('hidden');
    currentStory = null;
    currentLanguage = null;
    translations = {};
    audioUrl = null;
    isPlaying = false;
    quizData = null;
    
    // Clean up audio
    storyAudio.pause();
    storyAudio.src = '';
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }
}

// Show Error Function
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// Hide tooltip when scrolling
window.addEventListener('scroll', hideTranslation);
