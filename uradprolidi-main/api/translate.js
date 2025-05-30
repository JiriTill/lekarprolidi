// api/translate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ result: 'Pouze metoda POST je podporována.' });
  }

  const { type, content } = req.body;

  if (!type || !content) {
    return res.status(400).json({ result: 'Chybí vstupní data.' });
  }

  try {
    let messages = [];

    const basePrompt = `
Přečti následující text oficiálního dokumentu (např. úřední dopis nebo oznámení) a převeď ho do lidsky srozumitelné formy podle této přehledné struktury. Pokud některé informace chybí, napiš „Neuvedeno“ nebo je odhadni z kontextu (označ jako *odhad*).

Struktura výstupu:

🏛️ Od koho je dopis:  
[název úřadu nebo organizace]

👤 Kdo záležitost vyřizuje:  
[jméno a kontakt odpovědné osoby, pokud je uvedeno]

🆔 Číslo jednací (č.j.):  
[číslo jednací + krátké vysvětlení: slouží k identifikaci dokumentu pro úřad]

🧾 Srozumitelný přehled:

🟨 O co se jedná:  
[stručné vysvětlení obsahu dopisu]

🟨 Co se po mně chce:  
[konkrétní požadavek]

🟨 Kdy to mám udělat:  
[termín nebo lhůta]

🟨 Jak to mám udělat:  
[způsob splnění požadavku]

📌 Důsledky nesplnění:  
[volitelně]

📣 Upozornění:  
[volitelně]

Nyní zpracuj následující dokument:
`;

    if (type === 'image') {
      messages = [
        {
          role: 'system',
          content: basePrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: content,
              },
            },
          ],
        },
      ];
    } else {
      messages = [
        {
          role: 'system',
          content: basePrompt,
        },
        {
          role: 'user',
          content: `"""${content}"""`,
        },
      ];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (data?.choices?.[0]?.message?.content) {
      res.status(200).json({ result: data.choices[0].message.content });
    } else {
      console.error('📦 Odpověď od OpenAI:', JSON.stringify(data, null, 2));
      res.status(500).json({ result: '⚠️ Chyba ve zpracování odpovědi od OpenAI.' });
    }

  } catch (error) {
    console.error('Chyba při komunikaci s OpenAI:', error);
    res.status(500).json({ result: '⚠️ Došlo k chybě při komunikaci s OpenAI.' });
  }
}

