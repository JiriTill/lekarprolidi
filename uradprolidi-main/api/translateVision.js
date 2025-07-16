import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { base64Image, prompt } = req.body;

  if (!base64Image || !prompt) {
    return res.status(400).json({ error: 'Missing image or prompt.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: base64Image } },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const result = response.choices?.[0]?.message?.content;
    res.status(200).json({ result });
  } catch (error) {
    console.error('GPT Vision error:', error);
    res.status(500).json({ error: 'GPT Vision processing failed.' });
  }
}
