
# Dumbledore - Magical Academy Chatbot


 A React-based chatbot web application with a Hogwarts-inspired, magical-academy UI that interacts with the OpenRouter API (or compatible LLM APIs).


## 🎓 About

**Dumbledore** is an AI-powered mentor who leads Hogwarts' digital defense. The chatbot provides guidance on cybersecurity, ethical hacking, and digital ethics while maintaining a wise, professorial persona inspired by Professor Albus Dumbledore.


## ✨ Features

- **Dumbledore AI Persona**: The chatbot embodies Professor Albus Dumbledore, offering guidance in a warm, narrative, and ethical style inspired by the Hogwarts headmaster.
- **Cybersecurity Mentor**: Provides advice on cybersecurity, ethical hacking, and digital ethics, always prioritizing wisdom and ethical boundaries.
- **Story-like Explanations**: Answers are delivered in a narrative, professorial tone, blending technical guidance with magical storytelling.
- **Ethical Safeguards**: Refuses malicious requests, explains ethical reasoning, and offers safe alternatives.
- **Contextual Memory**: Remembers recent conversation context for more relevant and coherent responses.


## 🧪 Live Demo

Test the chatbot instantly here: [https://dumbledoreai.vercel.app/](https://dumbledoreai.vercel.app/)

---

### Prerequisites

- Automatically trimmed before each API call
- Formatted correctly for OpenRouter's API

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

## 🔒 Security & Ethics

- The system prompt defines ethical boundaries
- No malicious activities are assisted
- All refusal logic is handled by the AI, not the UI
- Conversation history is kept minimal for privacy

### Modifying the Persona
Edit the `SYSTEM_PROMPT` constant in `src/utils/api.js`.


## 🚀 Deploying to Vercel (or Other Cloud Platforms)

To deploy this app on Vercel (or any cloud platform), you must configure environment variables in the deployment dashboard. These variables are required for the app to connect to the OpenRouter API and function correctly.

### Required Environment Variables

Set the following variables in your Vercel project settings (or your cloud provider's environment configuration):

```
REACT_APP_OPENROUTER_API_KEY=sk-or-...your_api_key...
REACT_APP_MODEL=xiaomi/mimo-v2-flash:free
REACT_APP_API_ENDPOINT=https://openrouter.ai/api/v1/chat/completions
```

**Do not commit your .env file to version control.**

#### How to Set Environment Variables on Vercel
1. Go to your project in the Vercel dashboard.
2. Click on **Settings** > **Environment Variables**.
3. Add each variable and its value as shown above.
4. Redeploy your project after saving changes.

#### Common Deployment Issues
- If you see "Unknown API error" or the app does not respond, your environment variables may not be set or are incorrect.
- You can also set the API key at runtime using the in-app settings modal (gear icon in the sidebar).
- After updating environment variables, always redeploy your project.

---

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
- Powered by OpenRouter API (or compatible)

---

**Made with ⚡ for Hogwarts by Dumbledore**
