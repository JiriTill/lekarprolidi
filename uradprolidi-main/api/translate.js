export default async function handler(req, res) {
  console.log("Translate API was called");

  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, prompt } = req.body;

  if (!content || !prompt) {
    return res.status(400).json({ error: "Chybí obsah nebo prompt." });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OpenAI API key.");
    return res.status(500).json({ error: "Serverová chyba: chybí API klíč." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: content }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    const json = await response.json();

    if (!response.ok || json.error) {
      console.error("OpenAI Error:", json.error);
      return res.status(500).json({
        error: json.error?.message || "Chyba při zpracování požadavku na OpenAI.",
      });
    }

    const result = json.choices?.[0]?.message?.content?.trim();

    if (!result) {
      return res.status(500).json({ error: "OpenAI nevrátil odpověď." });
    }

    return res.status(200).json({ result });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Došlo k chybě při komunikaci se serverem. Zkuste to prosím znovu.",
    });
  }
}
