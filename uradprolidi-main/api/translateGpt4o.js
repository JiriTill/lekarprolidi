export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, imageUrls, prompt } = req.body;

  if (!prompt || (!text && !imageUrls)) {
    return res.status(400).json({ error: 'Missing input or prompt.' });
  }

  try {
    const messages = [];

    if (Array.isArray(imageUrls)) {
      // Multi-modal input (images + prompt)
      messages.push({
        role: 'user',
        content: [
          ...imageUrls.map((url) => ({
            type: 'image_url',
            image_url: { url }
          })),
          {
            type: 'text',
            text: prompt
          }
        ]
      });
    } else if (text) {
      // Text-only input
      messages.push({
        role: 'user',
        content: `${prompt}\n\n${text}`
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
