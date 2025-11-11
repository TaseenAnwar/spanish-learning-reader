// DOM Elements
const gradeSelect = document.getElementById('grade-level');
const generateBtn = document.getElementById('generate-btn');
const newStoryBtn = document.getElementById('new-story-btn');
const audioBtn = document.getElementById('audio-btn');
const generationSection = document.getElementById('generation-section');
const storySection = document.getElementById('story-section');
const storyContent = document.getElementById('story-content');
const loading = document.getElementById('loading');
const audioLoading = document.getElementById('audio-loading');
const errorMessage = document.getElementById('error-message');
const tooltip = document.getElementById('tooltip');
const storyAudio = document.getElementById('story-audio');

// State
let currentStory = null;
let translations = {};
let audioUrl = null;
let isPlaying = false;

// Event Listeners
generateBtn.addEventListener('click', generateStory);
newStoryBtn.addEventListener('click', showGenerationSection);
audioBtn.addEventListener('click', handleAudioClick);

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
    const gradeLevel = gradeSelect.value;
    
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
            body: JSON.stringify({ gradeLevel })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate story');
        }
        
        const data = await response.json();
        currentStory = data.story;
        translations = data.translations;
        
        displayStory(currentStory);
        
    } catch (error) {
        console.error('Error generating story:', error);
        showError('Sorry, there was an error generating your story. Please try again.');
    } finally {
        generateBtn.disabled = false;
        loading.classList.add('hidden');
    }
}

// Display Story Function
function displayStory(story) {
    storyContent.innerHTML = '';
    
    // Split story into paragraphs
    const paragraphs = story.split('\n').filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        
        // Split paragraph into words and punctuation
        const tokens = paragraph.match(/[\wáéíóúñüÁÉÍÓÚÑÜ]+|[^\wáéíóúñüÁÉÍÓÚÑÜ\s]+/g) || [];
        
        tokens.forEach(token => {
            if (/[\wáéíóúñüÁÉÍÓÚÑÜ]+/.test(token)) {
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
    
    // Reset audio state
    audioUrl = null;
    isPlaying = false;
    storyAudio.pause();
    storyAudio.src = '';
    updateAudioButton();
    
    // Show story section and hide generation section
    generationSection.classList.add('hidden');
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
            body: JSON.stringify({ text: currentStory })
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

// Show Translation Function
async function showTranslation(event) {
    const word = event.target.dataset.word;
    const cleanWord = word.replace(/[¿?¡!,;:.]/g, '').toLowerCase();
    
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
            body: JSON.stringify({ word: cleanWord })
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
    generationSection.classList.remove('hidden');
    currentStory = null;
    translations = {};
    audioUrl = null;
    isPlaying = false;
    
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
