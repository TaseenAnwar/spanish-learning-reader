// DOM Elements - Authentication
const authLoading = document.getElementById('auth-loading');
const authButtons = document.getElementById('auth-buttons');
const userProfile = document.getElementById('user-profile');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userPoints = document.getElementById('user-points');
const logoutBtn = document.getElementById('logout-btn');
const mainNav = document.getElementById('main-nav');
const navHome = document.getElementById('nav-home');
const navAccount = document.getElementById('nav-account');

// DOM Elements - Sections
const generationSection = document.getElementById('generation-section');
const storySection = document.getElementById('story-section');
const quizSection = document.getElementById('quiz-section');
const accountSection = document.getElementById('account-section');

// DOM Elements - Story Generation
const languageSelect = document.getElementById('language-select');
const gradeSelect = document.getElementById('grade-level');
const generateBtn = document.getElementById('generate-btn');
const newStoryBtn = document.getElementById('new-story-btn');
const audioBtn = document.getElementById('audio-btn');
const quizBtn = document.getElementById('quiz-btn');
const saveStoryBtn = document.getElementById('save-story-btn');
const backToStoryBtn = document.getElementById('back-to-story-btn');
const retakeQuizBtn = document.getElementById('retake-quiz-btn');
const newStoryFromQuizBtn = document.getElementById('new-story-from-quiz-btn');

// DOM Elements - Content Display
const storyContent = document.getElementById('story-content');
const storyLanguageSpan = document.getElementById('story-language');
const loading = document.getElementById('loading');
const audioLoading = document.getElementById('audio-loading');
const quizLoading = document.getElementById('quiz-loading');
const errorMessage = document.getElementById('error-message');
const tooltip = document.getElementById('tooltip');
const tooltipText = document.getElementById('tooltip-text');
const tooltipSave = document.getElementById('tooltip-save');
const storyAudio = document.getElementById('story-audio');
const saveWordTip = document.getElementById('save-word-tip');

// DOM Elements - Quiz
const quizContent = document.getElementById('quiz-content');
const quizForm = document.getElementById('quiz-form');
const quizQuestions = document.getElementById('quiz-questions');
const quizResults = document.getElementById('quiz-results');
const scoreText = document.getElementById('score-text');
const scoreMessage = document.getElementById('score-message');
const pointsEarned = document.getElementById('points-earned');
const questionFeedback = document.getElementById('question-feedback');

// DOM Elements - Account
const accountPoints = document.getElementById('account-points');
const savedStoriesCount = document.getElementById('saved-stories-count');
const vocabCount = document.getElementById('vocab-count');
const savedStoriesList = document.getElementById('saved-stories-list');
const noStories = document.getElementById('no-stories');
const storiesLoading = document.getElementById('stories-loading');
const vocabularyTable = document.getElementById('vocabulary-table');
const noVocab = document.getElementById('no-vocab');
const vocabLoading = document.getElementById('vocab-loading');
const vocabFilter = document.getElementById('vocab-filter');

// State
let currentUser = null;
let currentStory = null;
let currentLanguage = null;
let currentGradeLevel = null;
let translations = {};
let audioUrl = null;
let isPlaying = false;
let quizData = null;
let currentWordForSaving = null;

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

// Event Listeners - Authentication
logoutBtn.addEventListener('click', logout);
navHome.addEventListener('click', () => navigateTo('home'));
navAccount.addEventListener('click', () => navigateTo('account'));

// Event Listeners - Story
generateBtn.addEventListener('click', generateStory);
newStoryBtn.addEventListener('click', showGenerationSection);
newStoryFromQuizBtn.addEventListener('click', showGenerationSection);
audioBtn.addEventListener('click', handleAudioClick);
quizBtn.addEventListener('click', showQuiz);
saveStoryBtn.addEventListener('click', saveCurrentStory);
backToStoryBtn.addEventListener('click', backToStory);
retakeQuizBtn.addEventListener('click', retakeQuiz);
quizForm.addEventListener('submit', submitQuiz);
tooltipSave.addEventListener('click', saveWord);

// Event Listeners - Account
vocabFilter.addEventListener('change', loadVocabulary);

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

// Initialize app
checkAuthStatus();

// ==================== AUTHENTICATION FUNCTIONS ====================

async function checkAuthStatus() {
    try {
        authLoading.classList.remove('hidden');
        
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            showUserProfile(data.user);
        } else {
            showLoginButton();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showLoginButton();
    } finally {
        authLoading.classList.add('hidden');
    }
}

function showUserProfile(user) {
    authButtons.classList.add('hidden');
    userProfile.classList.remove('hidden');
    mainNav.classList.remove('hidden');
    
    userAvatar.src = user.profilePicture || '/default-avatar.png';
    userName.textContent = user.name;
    userPoints.textContent = `${user.totalPoints} points`;
    
    // Show save buttons
    saveStoryBtn.classList.remove('hidden');
    saveWordTip.classList.remove('hidden');
}

function showLoginButton() {
    authButtons.classList.remove('hidden');
    userProfile.classList.add('hidden');
    mainNav.classList.add('hidden');
    
    // Hide save buttons
    saveStoryBtn.classList.add('hidden');
    saveWordTip.classList.add('hidden');
}

function logout() {
    window.location.href = '/auth/logout';
}

function navigateTo(section) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Hide all sections
    generationSection.classList.add('hidden');
    storySection.classList.add('hidden');
    quizSection.classList.add('hidden');
    accountSection.classList.add('hidden');
    
    if (section === 'home') {
        navHome.classList.add('active');
        if (currentStory) {
            storySection.classList.remove('hidden');
        } else {
            generationSection.classList.remove('hidden');
        }
    } else if (section === 'account') {
        navAccount.classList.add('active');
        accountSection.classList.remove('hidden');
        loadAccountData();
    }
}

// ==================== ACCOUNT FUNCTIONS ====================

async function loadAccountData() {
    await Promise.all([
        loadSavedStories(),
        loadVocabulary()
    ]);
    
    // Update stats
    accountPoints.textContent = currentUser.totalPoints;
}

async function loadSavedStories() {
    try {
        storiesLoading.classList.remove('hidden');
        noStories.classList.add('hidden');
        savedStoriesList.innerHTML = '';
        
        const response = await fetch('/api/user/saved-stories');
        const data = await response.json();
        
        if (data.stories && data.stories.length > 0) {
            savedStoriesCount.textContent = data.stories.length;
            
            data.stories.forEach(story => {
                const card = createStoryCard(story);
                savedStoriesList.appendChild(card);
            });
            
            noStories.classList.add('hidden');
        } else {
            savedStoriesCount.textContent = '0';
            noStories.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading saved stories:', error);
        showError('Failed to load saved stories.');
    } finally {
        storiesLoading.classList.add('hidden');
    }
}

function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    
    const header = document.createElement('div');
    header.className = 'story-card-header';
    
    const title = document.createElement('div');
    title.className = 'story-card-title';
    title.textContent = story.title;
    
    const actions = document.createElement('div');
    actions.className = 'story-card-actions';
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'story-card-btn';
    viewBtn.textContent = '👁️';
    viewBtn.title = 'View story';
    viewBtn.onclick = (e) => {
        e.stopPropagation();
        viewSavedStory(story);
    };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'story-card-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete story';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteSavedStory(story.id);
    };
    
    actions.appendChild(viewBtn);
    actions.appendChild(deleteBtn);
    
    header.appendChild(title);
    header.appendChild(actions);
    
    const meta = document.createElement('div');
    meta.className = 'story-card-meta';
    meta.innerHTML = `
        <span>📚 ${languageConfig[story.language]?.name || story.language}</span>
        <span>📊 Grade ${story.gradeLevel}</span>
        <span>📅 ${new Date(story.createdAt).toLocaleDateString()}</span>
    `;
    
    const preview = document.createElement('div');
    preview.className = 'story-card-preview';
    preview.textContent = story.storyText.substring(0, 150) + '...';
    
    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(preview);
    
    card.onclick = () => viewSavedStory(story);
    
    return card;
}

function viewSavedStory(story) {
    currentStory = story.storyText;
    currentLanguage = story.language;
    currentGradeLevel = story.gradeLevel;
    translations = {};
    
    displayStory(story.storyText, story.language);
    navigateTo('home');
}

async function deleteSavedStory(storyId) {
    if (!confirm('Are you sure you want to delete this story?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/user/saved-stories/${storyId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadSavedStories();
        } else {
            showError('Failed to delete story.');
        }
    } catch (error) {
        console.error('Error deleting story:', error);
        showError('Failed to delete story.');
    }
}

async function loadVocabulary() {
    try {
        vocabLoading.classList.remove('hidden');
        noVocab.classList.add('hidden');
        vocabularyTable.innerHTML = '';
        
        const language = vocabFilter.value;
        const url = language ? `/api/user/vocabulary?language=${language}` : '/api/user/vocabulary';
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.vocabulary && data.vocabulary.length > 0) {
            vocabCount.textContent = data.vocabulary.length;
            
            data.vocabulary.forEach(word => {
                const item = createVocabItem(word);
                vocabularyTable.appendChild(item);
            });
            
            noVocab.classList.add('hidden');
        } else {
            vocabCount.textContent = '0';
            noVocab.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        showError('Failed to load vocabulary.');
    } finally {
        vocabLoading.classList.add('hidden');
    }
}

function createVocabItem(word) {
    const item = document.createElement('div');
    item.className = 'vocab-item';
    
    const wordDiv = document.createElement('div');
    wordDiv.className = 'vocab-word';
    wordDiv.textContent = word.word;
    
    const translationDiv = document.createElement('div');
    translationDiv.className = 'vocab-translation';
    translationDiv.textContent = word.translation;
    
    const languageDiv = document.createElement('div');
    languageDiv.className = 'vocab-language';
    languageDiv.textContent = languageConfig[word.language]?.name || word.language;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'vocab-delete';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete word';
    deleteBtn.onclick = () => deleteVocabWord(word.id);
    
    item.appendChild(wordDiv);
    item.appendChild(translationDiv);
    item.appendChild(languageDiv);
    item.appendChild(deleteBtn);
    
    return item;
}

async function deleteVocabWord(wordId) {
    if (!confirm('Are you sure you want to delete this word?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/user/vocabulary/${wordId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadVocabulary();
        } else {
            showError('Failed to delete word.');
        }
    } catch (error) {
        console.error('Error deleting word:', error);
        showError('Failed to delete word.');
    }
}

// ==================== STORY GENERATION FUNCTIONS ====================

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
        currentGradeLevel = gradeLevel;
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

function displayStory(story, language) {
    storyContent.innerHTML = '';
    
    const langInfo = languageConfig[language];
    storyLanguageSpan.textContent = langInfo.name;
    
    const paragraphs = story.split('\n').filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        
        const tokens = paragraph.match(/[\wáéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙäöüßÄÖÜẞëïËÏâêîôûÂÊÎÔÛçÇčšžČŠŽæøåÆØÅ\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0900-\u097F]+|[^\wáéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙäöüßÄÖÜẞëïËÏâêîôûÂÊÎÔÛçÇčšžČŠŽæøåÆØÅ\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0900-\u097F\s]+/g) || [];
        
        tokens.forEach(token => {
            if (/[\wáéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙäöüßÄÖÜẞëïËÏâêîôûÂÊÎÔÛçÇčšžČŠŽæøåÆØÅ\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0900-\u097F]+/.test(token)) {
                const span = document.createElement('span');
                span.className = 'word';
                span.textContent = token;
                span.dataset.word = token.toLowerCase();
                
                span.addEventListener('mouseenter', showTranslation);
                span.addEventListener('mouseleave', hideTranslation);
                
                p.appendChild(span);
            } else {
                p.appendChild(document.createTextNode(token));
            }
        });
        
        storyContent.appendChild(p);
    });
    
    audioUrl = null;
    isPlaying = false;
    quizData = null;
    storyAudio.pause();
    storyAudio.src = '';
    updateAudioButton();
    
    generationSection.classList.add('hidden');
    quizSection.classList.add('hidden');
    storySection.classList.remove('hidden');
}

function showGenerationSection() {
    currentStory = null;
    currentLanguage = null;
    currentGradeLevel = null;
    translations = {};
    quizData = null;
    
    storySection.classList.add('hidden');
    quizSection.classList.add('hidden');
    generationSection.classList.remove('hidden');
}

// ==================== SAVE STORY FUNCTION ====================

async function saveCurrentStory() {
    if (!currentUser) {
        showError('Please sign in to save stories.');
        return;
    }
    
    if (!currentStory) {
        showError('No story to save.');
        return;
    }
    
    try {
        saveStoryBtn.disabled = true;
        saveStoryBtn.innerHTML = '<span>💾</span> Saving...';
        
        const response = await fetch('/api/user/save-story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storyText: currentStory,
                language: currentLanguage,
                gradeLevel: currentGradeLevel
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save story');
        }
        
        saveStoryBtn.innerHTML = '<span>✓</span> Saved!';
        setTimeout(() => {
            saveStoryBtn.innerHTML = '<span>💾</span> Save Story';
            saveStoryBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error saving story:', error);
        showError('Failed to save story. Please try again.');
        saveStoryBtn.innerHTML = '<span>💾</span> Save Story';
        saveStoryBtn.disabled = false;
    }
}

// ==================== AUDIO FUNCTIONS ====================

async function handleAudioClick() {
    if (isPlaying) {
        storyAudio.pause();
        isPlaying = false;
        updateAudioButton();
        return;
    }
    
    if (audioUrl) {
        storyAudio.play();
        isPlaying = true;
        updateAudioButton();
        return;
    }
    
    await generateAndPlayAudio();
}

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

// ==================== TRANSLATION FUNCTIONS ====================

async function showTranslation(event) {
    const word = event.target.dataset.word;
    const cleanWord = word.replace(/[¿?¡!,;:.。、！？]/g, '').toLowerCase();
    
    currentWordForSaving = {
        word: cleanWord,
        translation: null
    };
    
    if (translations[cleanWord]) {
        currentWordForSaving.translation = translations[cleanWord];
        displayTooltip(event.target, translations[cleanWord]);
        return;
    }
    
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
            currentWordForSaving.translation = data.translation;
            displayTooltip(event.target, data.translation);
        }
    } catch (error) {
        console.error('Error fetching translation:', error);
    }
}

function hideTranslation() {
    tooltip.classList.add('hidden');
}

function displayTooltip(element, translation) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    tooltipText.textContent = translation;
    
    // Show/hide save button based on auth status
    if (currentUser) {
        tooltipSave.classList.remove('hidden');
    } else {
        tooltipSave.classList.add('hidden');
    }
    
    tooltip.classList.remove('hidden');
    
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
    const top = rect.top + scrollTop - tooltipRect.height - 10;
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

// ==================== SAVE WORD FUNCTION ====================

async function saveWord() {
    if (!currentUser) {
        showError('Please sign in to save vocabulary words.');
        return;
    }
    
    if (!currentWordForSaving || !currentWordForSaving.translation) {
        return;
    }
    
    try {
        const response = await fetch('/api/user/save-word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                word: currentWordForSaving.word,
                translation: currentWordForSaving.translation,
                language: currentLanguage
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save word');
        }
        
        // Update tooltip to show success
        tooltipSave.textContent = '✓';
        setTimeout(() => {
            tooltipSave.textContent = '💾';
            hideTranslation();
        }, 1000);
        
    } catch (error) {
        console.error('Error saving word:', error);
        showError('Failed to save word. Please try again.');
    }
}

// ==================== QUIZ FUNCTIONS ====================

async function showQuiz() {
    if (quizData) {
        displayQuiz(quizData);
        return;
    }
    
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

function selectTrueFalse(e) {
    const option = e.target;
    const questionIndex = option.dataset.questionIndex;
    const value = option.dataset.value;
    
    document.querySelectorAll(`[data-question-index="${questionIndex}"]`).forEach(opt => {
        opt.classList.remove('selected');
    });
    
    option.classList.add('selected');
    option.dataset.selected = value;
}

async function submitQuiz(e) {
    e.preventDefault();
    
    const answers = [];
    
    try {
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
        
        const response = await fetch('/api/grade-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questions: quizData.questions,
                answers: answers,
                language: currentLanguage,
                gradeLevel: currentGradeLevel
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to grade quiz');
        }
        
        const results = await response.json();
        displayResults(results);
        
        // Update user points if logged in
        if (currentUser && results.totalPoints !== null) {
            currentUser.totalPoints = results.totalPoints;
            userPoints.textContent = `${currentUser.totalPoints} points`;
        }
        
    } catch (error) {
        if (error.message !== 'Incomplete quiz') {
            console.error('Error grading quiz:', error);
            showError('Sorry, there was an error grading the quiz. Please try again.');
        }
    }
}

function displayResults(results) {
    const score = results.score;
    const totalQuestions = results.results.length;
    
    scoreText.textContent = `${score}/${totalQuestions}`;
    
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
    
    // Show points earned if logged in
    if (currentUser) {
        pointsEarned.textContent = `+${score} points earned!`;
        pointsEarned.classList.remove('hidden');
    } else {
        pointsEarned.classList.add('hidden');
    }
    
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
        status.textContent = result.correct ? '✓ Correct!' : '✗ Incorrect';
        
        feedbackDiv.appendChild(questionText);
        feedbackDiv.appendChild(userAnswer);
        
        if (result.feedback) {
            const feedback = document.createElement('div');
            feedback.className = 'feedback-answer';
            feedback.textContent = result.feedback;
            feedbackDiv.appendChild(feedback);
        }
        
        feedbackDiv.appendChild(status);
        questionFeedback.appendChild(feedbackDiv);
    });
    
    quizContent.classList.add('hidden');
    quizResults.classList.remove('hidden');
}

function retakeQuiz() {
    quizData = null;
    showQuiz();
}

function backToStory() {
    quizSection.classList.add('hidden');
    storySection.classList.remove('hidden');
}

// ==================== UTILITY FUNCTIONS ====================

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}
