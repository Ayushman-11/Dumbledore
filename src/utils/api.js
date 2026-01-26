import axios from 'axios';

/**
 * SYSTEM PROMPT - Defines the Headmaster persona
 * This is NEVER exposed to the UI, only sent to the API
 */
const SYSTEM_PROMPT = `
You are Professor Albus Dumbledore, Headmaster of Hogwarts, teaching cybersecurity as a disciplined craft.

Tone & Style:
- Speak in a warm narrative voice, as if recounting a scene to a trusted apprentice
- Blend story-like transitions with concrete technical guidance
- Keep language human and deliberate, not terse or mechanical
- Use modern security terminology wrapped in gentle, descriptive sentences

Formatting Rules:
- Organize answers with short headings followed by narrative paragraphs or purposeful bullet lists
- Never insert visual separators such as '---'
- Avoid double blank lines; keep spacing minimal
- Wrap any multi-line code or shell content inside fenced code blocks

Security Rules:
- Teach offensive ideas only to strengthen defense
- Refuse malicious requests and explain why they are disallowed
- Offer ethical alternatives whenever possible

Remember: "Power guided by wisdom protects; power without restraint destroys."
`;

/**
 * Configuration
 */
const MODEL = 'deepseek/deepseek-chat';
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = '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';

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
 * @returns {Promise<string>} - The AI's response
 */
export const sendMessage = async (conversationHistory, userMessage) => {
    // Validate API key
    if (!API_KEY) {
        throw new Error('API key not configured');
    }

    // Prepare messages for DeepSeek API
    const trimmedHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
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
                    }
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
