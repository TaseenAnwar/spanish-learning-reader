# 📚 Language Learning Reader

An interactive web application that generates age-appropriate stories in **10 different languages** with instant English translations, authentic audio narration, and comprehension quizzes. Perfect for K-12 students learning a new language!

## ✨ Features

### 🌍 **Multi-Language Support**
Choose from 10 languages:
- Spanish (Español)
- Chinese (中文)
- Hindi (हिन्दी)
- Urdu (اردو)
- French (Français)
- Arabic (العربية)
- Russian (Русский)
- German (Deutsch)
- Japanese (日本語)
- Korean (한국어)

### 📖 **Core Features**
- **Grade-Level Appropriate Content**: Stories tailored for Kindergarten through 12th grade
- **Interactive Translation**: Hover over any word to see its English translation
- **🔊 Audio Narration**: Listen to stories read aloud in authentic native accent
- **📝 Quiz Yourself**: Test comprehension with 3 questions after each story
- **AI-Powered Stories**: Each story is uniquely generated using GPT-4o-mini
- **Beautiful UI**: Clean, modern, and responsive design

## 🆕 What's New in Version 2.0

- ✅ **10 languages** instead of just Spanish
- ✅ **Quiz feature** with 3 comprehension questions per story
- ✅ **Instant grading** with detailed feedback
- ✅ **Score display** showing correct/incorrect answers
- ✅ Authentic TTS voices for each language
- ✅ Enhanced UI with quiz styling

## Prerequisites

- Node.js (version 18 or higher)
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Git (for version control)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd language-learning-reader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## Project Structure

```
language-learning-reader/
├── index.html          # Main HTML with language selector and quiz UI
├── style.css           # Stylesheet with quiz styling
├── script.js           # Client-side JS with quiz functionality
├── server.js           # Express server with multi-language + quiz endpoints
├── package.json        # Dependencies
├── .env                # Environment variables (not in git)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Usage

1. **Select a Language**: Choose from 10 supported languages
2. **Select a Grade Level**: Choose from Kindergarten through 12th grade
3. **Generate Story**: Click "Generate Story" button
4. **Read and Learn**: Hover over any word to see its English translation
5. **🔊 Listen**: Click "Listen to Story" to hear authentic pronunciation
6. **📝 Quiz Yourself**: Click "Quiz Yourself" to test comprehension
   - Answer 3 questions about the story
   - Get instant feedback on your answers
   - See your score and detailed explanations
7. **Try Again**: Generate new stories or retake quizzes

## API Endpoints

### Story Generation
- **POST** `/api/generate-story`
- Body: `{ language: 'spanish', gradeLevel: '3' }`
- Returns: Story text + word translations

### Text-to-Speech
- **POST** `/api/text-to-speech`
- Body: `{ text: 'story text', language: 'spanish' }`
- Returns: MP3 audio file

### Quiz Generation
- **POST** `/api/generate-quiz`
- Body: `{ story: 'story text', language: 'spanish' }`
- Returns: 3 questions (2 true/false, 1 short answer)

### Quiz Grading
- **POST** `/api/grade-quiz`
- Body: `{ questions: [...], answers: [...] }`
- Returns: Score + detailed feedback

### Word Translation
- **POST** `/api/translate`
- Body: `{ word: 'palabra', language: 'spanish' }`
- Returns: English translation

## API Usage and Costs

Monitor your usage at [OpenAI Platform](https://platform.openai.com/usage).

### Estimated costs per story (as of 2024):
- **Story generation**: ~$0.001-0.003
- **Translations**: ~$0.0001 per word
- **Audio narration**: ~$0.015 per story
- **Quiz generation**: ~$0.001
- **Quiz grading**: ~$0.001
- **Total per complete session**: ~$0.018-0.022

Still less than 3 cents per complete learning session with story + audio + quiz!

## Language-Specific TTS Voices

Each language uses an optimized OpenAI voice:
- **Spanish**: nova
- **Chinese**: alloy
- **Hindi**: alloy
- **Urdu**: onyx
- **French**: nova
- **Arabic**: onyx
- **Russian**: alloy
- **German**: nova
- **Japanese**: alloy
- **Korean**: nova

## Deployment to Render.com

Same process as before:

1. Push code to GitHub
2. Connect repository to Render
3. Add `OPENAI_API_KEY` environment variable
4. Deploy!

Your app will be live at: `https://your-app-name.onrender.com`

## Customization

### Adding More Languages

Edit `languageConfig` in `server.js`:

```javascript
newlanguage: {
    name: 'Language Name',
    nativeName: 'Native Script',
    code: 'ISO code',
    voice: 'nova' // or alloy, echo, etc.
}
```

Then add to the dropdown in `index.html`.

### Adjusting Quiz Difficulty

Edit the quiz generation prompt in `server.js` to:
- Change number of questions
- Adjust question types
- Modify difficulty level

### Changing Voices

Modify the `voice` field in `languageConfig` in `server.js`. Available voices:
- `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Troubleshooting

### Stories Not Generating
- Verify OpenAI API key is correct
- Check API credits
- Look at server console for errors

### Audio Not Playing
- Check browser console
- Ensure TTS access on API key
- Try different browser

### Quiz Not Loading
- Check that story was generated successfully
- Look at network tab in browser dev tools
- Verify server is running

### Translations Not Showing
- Clear browser cache
- Check that language is supported
- Verify API key has sufficient credits

## Future Enhancements (Roadmap)

- [ ] User authentication (Google Sign-In)
- [ ] Points system for quizzes
- [ ] Save favorite stories
- [ ] Vocabulary word bank
- [ ] User profile page
- [ ] Progress tracking
- [ ] Leaderboards
- [ ] More languages

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

MIT License - free for educational use

## Support

For issues:
- **OpenAI API**: [OpenAI Help Center](https://help.openai.com)
- **Render Deployment**: [Render Docs](https://render.com/docs)
- **This Project**: Open an issue in the repository

## Acknowledgments

- Built with [OpenAI GPT-4o-mini](https://openai.com)
- Audio powered by [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech)
- Deployed on [Render](https://render.com)
- Created for language learners worldwide

## Changelog

### Version 2.0 (Current)
- ✨ Added 9 more languages (10 total)
- 📝 Added quiz feature with 3 questions per story
- 🎯 Added instant quiz grading with feedback
- 💯 Added score display with detailed results
- 🎨 Enhanced UI for quiz interface
- 🔧 Improved translation system for multiple languages

### Version 1.1
- ✨ Added authentic audio narration
- 🔊 Play/pause controls
- 💾 Audio caching

### Version 1.0
- Initial release
- Spanish story generation
- Interactive translations
- Grade-level content

---

Happy Learning! 🎉📖🌍🔊📝

## Screenshots

[Add screenshots of your app here once deployed]

---

Made with ❤️ for language learners everywhere
