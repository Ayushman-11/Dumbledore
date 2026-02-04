import axios from 'axios';


// Persona system prompts
const SYSTEM_PROMPTS = {
    dumbledore: `
You are Professor Albus Dumbledore, Headmaster of Hogwarts, and a world authority on defensive cybersecurity and blue team operations.

Tone & Style:
- Speak in a warm, narrative voice, as if recounting a scene to a trusted apprentice
- Blend story-like transitions with concrete technical guidance
- Keep language human and deliberate, not terse or mechanical
- Use modern security terminology wrapped in gentle, descriptive sentences

Formatting Rules:
- Organize answers with short headings followed by narrative paragraphs or purposeful bullet lists
- Never insert visual separators such as '---'
- Avoid double blank lines; keep spacing minimal
- Wrap any multi-line code or shell content inside fenced code blocks

Domain Scope (STRICT):
- Answer ONLY topics related to cybersecurity, blue team practices, system defense, detection, prevention, monitoring, logs, incident response, threat hunting, and hardening
- You are NOT a general knowledge assistant
- Do NOT answer questions about health, history, school subjects, casual trivia, or unrelated topics

Refusal Behavior:
- If a question is outside cybersecurity, politely decline
- Gently guide the user back toward defensive security topics

Security Rules:
- Focus exclusively on defensive techniques, blue team strategies, detection, prevention, incident response, and hardening systems
- Never provide offensive, black hat, exploit, or attack instructions
- Refuse malicious or unethical requests and explain why
- Offer ethical, defensive alternatives whenever possible

Remember: "Power guided by wisdom protects; power without restraint destroys."
`,
    snape: `
You are Professor Severus Snape, Potions Master and Defense Against the Dark Arts teacher at Hogwarts, and a master of offensive cybersecurity and adversarial thinking.

Tone & Style:
- Speak in a dry, sharp, and occasionally sarcastic tone
- Be concise, direct, and sometimes intimidating, but never cruel
- Use advanced vocabulary and a hint of disdain for incompetence
- Provide technical explanations with precision and blunt clarity

Formatting Rules:
- Use short, clear headings and bullet points for instructions
- Avoid unnecessary embellishments or pleasantries
- Wrap any code or shell content in fenced code blocks

Domain Scope (STRICT):
- Answer ONLY cybersecurity, ethical hacking, red team tactics, bug bounty strategies, exploits in a legal context, tooling, and attack simulations
- You are NOT a general knowledge assistant
- Do NOT answer unrelated questions (science, health, daily life, trivia, etc.)

Refusal Behavior:
- If a question is outside cybersecurity, refuse briefly and redirect the user to security topics
- If the request is illegal or unethical, refuse and explain the legal boundary

Security Rules:
- Provide only legal, ethical, and educational offensive security knowledge
- Never assist real-world harm or illegal activity
- Focus on learning, testing, labs, and bug bounty contexts

Remember: "Foolish wand-waving and silly incantations will not protect you. Only knowledge and discipline will."
`
};

/**
 * Configuration
 */


// Only use OpenRouter API configuration
const MODEL = process.env.REACT_APP_MODEL;
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
function getApiKey() {
    // Prefer user-set key from localStorage, fallback to .env
    if (typeof window !== 'undefined') {
        const userKey = window.localStorage.getItem('openrouter_api_key');
        if (userKey && userKey.trim()) return userKey.trim();
    }
    return process.env.REACT_APP_OPENROUTER_API_KEY;
}

// Maximum number of messages to keep in history (to avoid token overflow)
const MAX_HISTORY_LENGTH = 4; // Keep less history to lower token usage per call
const MAX_RETRIES = 2; // Retries only for real server errors (single user action = max 3 calls)
const BASE_BACKOFF_MS = 3000; // Base backoff delay in ms (increases per attempt)
const RETRYABLE_STATUS = new Set([500]); // 429 is excluded to avoid hammering the quota
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const jitter = () => Math.floor(Math.random() * 400); // Small random jitter to avoid thundering herd

/**
 * Sends a message to the LLM API
 * @param {Array} conversationHistory - Array of previous messages
 * @param {string} userMessage - The latest user input
 * @param {AbortSignal} abortSignal - Optional abort signal
 * @param {string} persona - Persona key ('dumbledore' or 'snape')
 * @param {string} systemPromptOverride - Optional custom system prompt to override persona
 * @returns {Promise<string>} - The AI's response
 */
export const sendMessage = async (conversationHistory, userMessage, abortSignal, persona = 'dumbledore', systemPromptOverride) => {
    // Validate API key
    const API_KEY = getApiKey();
    if (!API_KEY) {
        throw new Error('API key not configured');
    }

    // Select system prompt
    const systemPrompt = systemPromptOverride || SYSTEM_PROMPTS[persona] || SYSTEM_PROMPTS['dumbledore'];

    // Prepare messages for API
    const trimmedHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
    const messages = [
        { role: 'system', content: systemPrompt },
        ...trimmedHistory,
        { role: 'user', content: userMessage }
    ];

    // Retry loop for transient errors (429/500)
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post(
                API_ENDPOINT,
                {
                    model: MODEL,
                    messages,
                    temperature: 0.7,
                    stream: false
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    signal: abortSignal
                }
            );

            // Extract and return the assistant's message from OpenRouter response
            const data = response.data;
            const choice = data?.choices?.[0];
            const assistantMessage = choice?.message?.content?.trim();

            if (assistantMessage) {
                return assistantMessage;
            }

            const finishReason = choice?.finish_reason;

            if (finishReason === 'length') {
                throw new Error('The response was truncated. Please ask a shorter question.');
            }

            if (finishReason === 'content_filter') {
                throw new Error('The academy blocked this request for safety reasons. Please rephrase and keep it compliant.');
            }

            if (finishReason) {
                throw new Error(`The Headmaster could not finish: ${finishReason}.`);
            }

            throw new Error('The Headmaster remained silent. Please try again in a moment.');
        } catch (error) {
            // Only treat as user stop if axios specifically throws due to abort
            if (error.code === 'ERR_CANCELED' || (error.name === 'CanceledError')) {
                throw new Error('Query stopped by user.');
            }
            const isLastAttempt = attempt === MAX_RETRIES;
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.error?.message || 'Unknown API error';
                const isRetryable = RETRYABLE_STATUS.has(status);

                if (status === 429) {
                    if (!isLastAttempt) {
                        const retryAfterHeader = error.response.headers?.['retry-after'];
                        const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : BASE_BACKOFF_MS * (attempt + 1) + jitter();
                        await sleep(retryAfterMs);
                        continue;
                    }
                    throw new Error('Rate limit exceeded. Please wait before sending another request.');
                }

                if (isRetryable && !isLastAttempt) {
                    const backoff = BASE_BACKOFF_MS * (attempt + 1) + jitter();
                    await sleep(backoff);
                    continue; // retry
                }

                if (status === 401 || status === 403) {
                    throw new Error('Invalid API key. Please check your OpenRouter API configuration.');
                } else if (status === 500) {
                    throw new Error('OpenRouter API service error. Please try again later.');
                } else {
                    throw new Error(`API Error: ${message}`);
                }
            } else if (error.request) {
                // Request was made but no response received
                if (!isLastAttempt) {
                    const backoff = BASE_BACKOFF_MS * (attempt + 1) + jitter();
                    await sleep(backoff);
                    continue;
                }
                throw new Error('No response from API. Please check your internet connection.');
            } else {
                // Something else went wrong
                throw new Error(error.message || 'Failed to send message');
            }
        }
    }
};

/**
 * Formats conversation history for API
 * Converts UI message format to API message format
 * @param {Array} messages - Array of message objects from UI
 * @returns {Array} - Formatted messages for API
 */
export const formatConversationHistory = (messages) => {
    return messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
    }));
};
