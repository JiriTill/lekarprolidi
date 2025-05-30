export default async function handler(req, res) {
  console.log("Translate API was called");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Pouze metoda POST je povolena" });
  }

  const { type, content, prompt } = req.body;

  if (!content || !prompt) {
    return res.status(400).json({ error: "Chybí obsah nebo prompt." });
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: content }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    const json = await openaiResponse.json();

    if (json.error) {
      console.error("Chyba OpenAI:", json.error);
      return res.status(500).json({ error: json.error.message });
    }

    const result = json.choices?.[0]?.message?.content?.trim();

    console.log("Výstup GPT:", result?.substring(0, 100));

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Chyba při komunikaci s OpenAI:", error);
    return res.status(500).json({ error: "Došlo k chybě při komunikaci s OpenAI." });
  }
}
