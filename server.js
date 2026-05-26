require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY is not set in .env');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname)));

const client = new Anthropic();

app.post('/api/analyze', async (req, res) => {
  try {
    const { imageBase64, mimeType, day, goal } = req.body;

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
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`ppl.ai running at http://localhost:${PORT}`);
});
