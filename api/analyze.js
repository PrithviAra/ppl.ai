const Anthropic = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType, day, goal } = req.body;

    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageBase64 },
          },
          {
            type: 'text',
            text: `You are an expert personal trainer analyzing a physique photo. The user is doing a ${day} day with an aesthetics focus.

Analyze their physique and identify specific muscle groups that appear underdeveloped or lagging. Then design a targeted workout to address those weaknesses.

Respond with ONLY valid JSON — no markdown, no extra text, no code fences:
{
  "weaknesses": "2 sentence honest assessment identifying 2-3 specific muscle groups to prioritize",
  "exercises": [
    { "name": "Exercise Name", "sets": "3 × 10", "note": "Why this directly addresses their weakness" }
  ],
  "tip": "One personalized coaching tip based on what you observe in the photo"
}

Include exactly 5 exercises. Be specific and direct.`,
          },
        ],
      }],
    });

    const text = response.content[0].text.trim();
    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
