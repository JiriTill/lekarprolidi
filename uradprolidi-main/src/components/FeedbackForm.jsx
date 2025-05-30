import React, { useState } from 'react';

export default function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      časové_razítko: new Date().toLocaleString(),
      zpráva: message,
      spokojenost: satisfaction,
      zařízení: navigator.userAgent,
      prohlížeč: navigator.vendor,
    };

    try {
      await fetch('https://api.sheetbest.com/sheets/46b92d04-c7d1-421e-baf5-fb6a64394214', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setSubmitted(true);
      setMessage('');
      setSatisfaction('');
    } catch (error) {
      alert('⚠️ Nepodařilo se odeslat zpětnou vazbu.');
      console.error(error);
    }
  };

  return (
    <div className="bg-white shadow rounded p-6 mt-12">
      <h2 className="text-xl font-bold mb-4">📝 Zpětná vazba</h2>
      {submitted ? (
        <p className="text-green-700 font-medium">Děkujeme za zpětnou vazbu!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            required
            placeholder="Napište, co bychom mohli zlepšit..."
            className="w-full p-3 border rounded resize-none"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <select
            required
            value={satisfaction}
            onChange={(e) => setSatisfaction(e.target.value)}
            className="w-full p-3 border rounded"
          >
            <option value="">Jak jste spokojeni?</option>
            <option value="👍 Spokojen/a">👍 Spokojen/a</option>
            <option value="👎 Nespokojen/a">👎 Nespokojen/a</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            Odeslat
          </button>
        </form>
      )}
    </div>
  );
}
