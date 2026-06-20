import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY is missing from .env');
} else {
  console.log(`✅ Groq API key loaded (length: ${process.env.GROQ_API_KEY.length})`);
}

export const generateText = async (prompt) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error('Groq API error:', err.message);
    throw err;
  }
};