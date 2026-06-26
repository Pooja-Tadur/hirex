
import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY is missing from .env');
} else {
  console.log(`✅ Groq API key loaded (length: ${process.env.GROQ_API_KEY.length})`);
}

// Working Groq models as of June 2026
const MODELS = [
  'llama-3.1-8b-instant',
  'llama3-8b-8192',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
];

export const generateText = async (prompt) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  let lastError = null;

  for (const model of MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      });
      console.log(`✅ AI response from model: ${model}`);
      return response.choices[0].message.content;
    } catch (err) {
      const msg = err?.message || '';
      const status = err?.status || err?.statusCode;

      if (
        msg.includes('decommissioned') ||
        msg.includes('deprecated') ||
        msg.includes('not found') ||
        msg.includes('model_not_found') ||
        msg.includes('does not exist') ||
        status === 404 ||
        status === 429 ||
        msg.includes('rate_limit') ||
        msg.includes('Rate limit')
      ) {
        console.warn(`⚠️ Model "${model}" unavailable, trying next...`);
        lastError = err;
        continue;
      }

      console.error(`Groq API error with model "${model}":`, msg);
      throw err;
    }
  }

  console.error('All Groq models failed. Last error:', lastError?.message);
  throw new Error('AI service temporarily unavailable. Please try again in a few minutes.');
};
