import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️  GROQ_API_KEY is missing from .env');
} else {
  console.log(`✅ Groq API key loaded (length: ${process.env.GROQ_API_KEY.length})`);
}

// ✅ VERIFIED WORKING Groq models as of June 2026
// DEAD (do not add back):
//   ❌ mixtral-8x7b-32768    — deprecated March 2025
//   ❌ llama3-70b-8192       — deprecated May 2025
//   ❌ llama3-8b-8192        — deprecated May 2025
//   ❌ gemma2-9b-it          — deprecated August 2025
//   ❌ llama-3.1-70b-versatile — deprecated Dec 2024 (auto-upgrades to 3.3)
const MODELS = [
  'llama-3.3-70b-versatile',  // ✅ Primary — best quality, fast
  'llama-3.1-8b-instant',     // ✅ Fallback — fastest, lighter
];

let groqClient = null;
const getGroqClient = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

export const generateText = async (prompt, maxTokens = 1024) => {
  const groq = getGroqClient();
  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);
      const response = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      });
      console.log(`✅ AI response from model: ${model}`);
      return response.choices[0].message.content;
    } catch (err) {
      const msg = err?.message || '';
      const status = err?.status || err?.statusCode;

      const isModelUnavailable =
        msg.includes('decommissioned') ||
        msg.includes('deprecated') ||
        msg.includes('not found') ||
        msg.includes('model_not_found') ||
        msg.includes('does not exist') ||
        msg.includes('No models') ||
        status === 404;

      const isRateLimit = status === 429 || msg.includes('rate_limit') || msg.includes('Rate limit');

      if (isModelUnavailable) {
        console.warn(`⚠️  Model "${model}" unavailable (${status || msg.slice(0, 60)}), trying next...`);
        lastError = err;
        continue;
      }

      if (isRateLimit) {
        console.warn(`⏳ Rate limited on "${model}", trying next...`);
        lastError = err;
        continue;
      }

      // Auth error — no point trying other models
      if (status === 401 || msg.includes('401') || msg.includes('Invalid API')) {
        console.error('❌ Groq API key is invalid or expired!');
        throw new Error('AI service authentication failed. Please check GROQ_API_KEY in environment variables.');
      }

      console.error(`❌ Groq API error with model "${model}":`, msg);
      throw err;
    }
  }

  console.error('❌ All Groq models failed. Last error:', lastError?.message);
  throw new Error('AI service is temporarily unavailable. Please try again in a few minutes.');
};