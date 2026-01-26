# The Grey Arcana - Magical Academy Chatbot

A React-based chatbot web application with a Hogwarts-inspired, magical-academy UI that interacts with OpenAI's API (or compatible LLM APIs).

## 🎓 About

**The Headmaster of the Grey Arcana** is an AI-powered mentor who leads a prestigious academy of ethical cyber arts. The chatbot provides guidance on cybersecurity, ethical hacking, and digital ethics while maintaining a wise, professorial persona.

## ✨ Features

- **Magical UI**: Dark, premium Hogwarts-inspired design with parchment-style chat bubbles
- **Smooth Animations**: Messages fade and slide in smoothly
- **Typing Indicator**: Elegant indicator while AI responds
- **Smart History Management**: Maintains last 6-8 messages to optimize API usage
- **Error Handling**: Graceful error states with helpful messages
- **Responsive Design**: Works beautifully on desktop and mobile

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key (or compatible LLM API)

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API key:
   ```
   REACT_APP_OPENAI_API_KEY=your_api_key_here
   REACT_APP_API_ENDPOINT=https://api.openai.com/v1/chat/completions
   REACT_APP_MODEL=gpt-4
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 UI Theme

The application features:
- Deep navy/charcoal background with magical gradient effects
- Parchment-style chat bubbles for AI responses
- Gold accents (#d4af37) throughout
- Serif fonts (Cinzel for headings, Lora for body text)
- Subtle animated sparkle effects
- Glowing decorative elements

## 🔧 Project Structure

```
src/
├── components/
│   ├── Chat.js              # Main chat interface
│   ├── Chat.css            # Chat styling
│   ├── Message.js          # Individual message component
│   ├── Message.css         # Message styling
│   ├── TypingIndicator.js  # Typing indicator component
│   └── TypingIndicator.css # Typing indicator styling
├── utils/
│   └── api.js              # API logic and system prompt
├── App.js                  # Main app component
├── App.css                 # App-level styling
├── index.js                # Entry point
└── index.css               # Global styles
```

## 📝 Key Implementation Details

### System Prompt
The chatbot's persona is defined by a system prompt in `src/utils/api.js`. This prompt:
- Defines "The Headmaster of the Grey Arcana" persona
- Establishes ethical guidelines
- Is NEVER exposed to the UI
- Is included in every API call

### Conversation History
- Maintains only the last 6-8 messages to avoid token overflow
- Automatically trimmed before each API call
- Formatted correctly for OpenAI's API

### Error Handling
- API key validation
- Network error detection
- Rate limit handling
- User-friendly error messages

## 🎯 Usage Tips

1. **API Key Security**: Never commit your `.env` file to version control
2. **Token Limits**: The app automatically manages conversation history
3. **Customization**: Modify the system prompt in `api.js` to change the AI's persona
4. **Styling**: Adjust colors and fonts in CSS files to match your branding

## 🛠️ Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (not recommended)

## 🔒 Security & Ethics

- The system prompt defines ethical boundaries
- No malicious activities are assisted
- All refusal logic is handled by the AI, not the UI
- Conversation history is kept minimal for privacy

## 📦 Dependencies

- `react` - UI framework
- `react-dom` - React DOM rendering
- `axios` - HTTP client for API calls
- `react-scripts` - Build tooling

## 🎨 Customization

### Changing Colors
Edit the CSS files to modify the color scheme. Key colors:
- Gold accent: `#d4af37`
- Background: `#0f0f1e`, `#1a1a2e`, `#16213e`
- Parchment: `rgba(250, 240, 215, 0.95)`

### Changing Fonts
Update the Google Fonts import in `public/index.html` and modify font-family in CSS files.

### Modifying the Persona
Edit the `SYSTEM_PROMPT` constant in `src/utils/api.js`.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🐛 Troubleshooting

### API Key Not Working
- Verify the key is correct in `.env`
- Ensure `.env` is in the root directory
- Restart the development server after changing `.env`

### No Response from AI
- Check your internet connection
- Verify API endpoint is correct
- Check browser console for errors

### Styling Issues
- Clear browser cache
- Check that all CSS files are imported correctly
- Verify Google Fonts are loading

## 📄 License

This project is created for educational and demonstration purposes.

## 🙏 Credits

- Design inspired by Hogwarts and magical academies
- Built with React
- Powered by OpenAI API (or compatible)

---

**Made with ⚡ for the Grey Arcana Academy**
