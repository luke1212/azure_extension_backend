const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors'); // Add this line
require('dotenv').config();

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY environment variable is not set.");
  process.exit(1);
}

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided." });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }
    const reply = data.choices && data.choices.length > 0 ? data.choices[0].message.content : "No reply received.";
    res.json({ reply });
  } catch (error) {
    console.error("Error communicating with ChatGPT API:", error);
    res.status(500).json({ error: "Error communicating with ChatGPT API." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});