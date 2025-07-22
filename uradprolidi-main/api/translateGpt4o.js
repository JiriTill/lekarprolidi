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
      messages.push({
        role: 'user',
        content: [
          ...imageUrls.map((base64) => ({
            type: 'image_url',
            image_url: { url: base64 },
          })),
          {
            type: 'text',
            text: prompt,
          },
        ],
      });
    } else if (text) {
      messages.push({
        role: 'user',
        content: `${prompt}\n\n${text}`,
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || 'OpenAI API error.',
      });
    }

    res.status(200).json({ result: data.choices?.[0]?.message?.content || '' });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
}
