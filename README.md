# 📚 Spanish Learning Reader

An interactive web application that generates age-appropriate Spanish stories and provides instant English translations on hover. Perfect for K-12 students learning Spanish!

## Features

- **Grade-Level Appropriate Content**: Stories tailored for Kindergarten through 12th grade
- **Interactive Translation**: Hover over any Spanish word to see its English translation
- **AI-Powered Stories**: Each story is uniquely generated using GPT-4o-mini
- **Beautiful UI**: Clean, modern, and responsive design
- **Easy to Use**: Simple interface suitable for students of all ages

## Prerequisites

- Node.js (version 18 or higher)
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Git (for version control)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd spanish-learning-reader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## Project Structure

```
spanish-learning-reader/
├── index.html          # Main HTML file
├── style.css           # Stylesheet with responsive design
├── script.js           # Client-side JavaScript
├── server.js           # Express server with OpenAI integration
├── package.json        # Node.js dependencies and scripts
├── .env                # Environment variables (not in git)
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Deployment to Render.com

### Step 1: Prepare Your Repository

1. Make sure all files are committed to your Git repository
2. Push your code to GitHub, GitLab, or Bitbucket
3. **Important**: Do NOT commit your `.env` file with your actual API key

### Step 2: Create a Render Account

1. Go to [Render.com](https://render.com)
2. Sign up for a free account
3. Connect your GitHub/GitLab/Bitbucket account

### Step 3: Create a New Web Service

1. Click "New +" and select "Web Service"
2. Connect your repository
3. Configure the service:
   - **Name**: `spanish-learning-reader` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose "Free" for testing

### Step 4: Set Environment Variables

1. In the Render dashboard, go to your service
2. Navigate to "Environment" section
3. Add your environment variables:
   - Key: `OPENAI_API_KEY`
   - Value: Your actual OpenAI API key
4. Save changes

### Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically deploy your application
3. Once deployed, you'll receive a URL like: `https://spanish-learning-reader.onrender.com`

### Important Notes for Render Deployment

- The free tier may spin down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds to wake up
- For production use, consider upgrading to a paid plan
- Monitor your OpenAI API usage to avoid unexpected charges

## Usage

1. **Select a Grade Level**: Choose from Kindergarten through 12th grade
2. **Generate Story**: Click the "Generate Spanish Story" button
3. **Read and Learn**: Hover over any Spanish word to see its English translation
4. **Generate New Story**: Click "Generate New Story" to create another story

## API Usage and Costs

This application uses the OpenAI API (GPT-4o-mini model). Each story generation and translation will incur API costs. Monitor your usage at [OpenAI Platform](https://platform.openai.com/usage).

Estimated costs (as of 2024):
- Story generation: ~$0.001-0.003 per story
- Translations: ~$0.0001 per word

## Customization

### Adjusting Story Length

Edit `gradeConfigs` in `server.js`:

```javascript
const gradeConfigs = {
    'K': { complexity: 'very simple', wordCount: '50-75', vocabulary: 'basic animals, colors' },
    // ... modify as needed
};
```

### Changing AI Model

In `server.js`, modify the model parameter:

```javascript
model: 'gpt-4o-mini', // or 'gpt-4o' for higher quality
```

### Styling

Customize colors and design in `style.css`.

## Troubleshooting

### Server Won't Start

- Check that Node.js is installed: `node --version`
- Verify all dependencies are installed: `npm install`
- Ensure `.env` file exists with valid API key

### Stories Not Generating

- Verify your OpenAI API key is correct
- Check your API key has available credits
- Look at server console for error messages

### Translations Not Showing

- Clear browser cache
- Check browser console for JavaScript errors
- Verify server is running properly

## Security Notes

- **Never commit your `.env` file** to version control
- Keep your OpenAI API key private
- Consider implementing rate limiting for production use
- Monitor API usage regularly

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for educational purposes.

## Support

For issues with:
- **OpenAI API**: Visit [OpenAI Help Center](https://help.openai.com)
- **Render Deployment**: Visit [Render Docs](https://render.com/docs)
- **This Project**: Open an issue in the repository

## Acknowledgments

- Built with [OpenAI GPT-4o-mini](https://openai.com)
- Deployed on [Render](https://render.com)
- Created for Spanish language learners

---

Happy Learning! 🎉📖🇪🇸
