'use strict';
const router = require('express').Router();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Chuyển lịch sử chat sang định dạng Gemini
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.isBot ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Thêm tin nhắn mới
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }]
    });

    const response = await axios.post(GEMINI_API_URL, {
      system_instruction: {
        parts: [{
          text: "You are a helpful AI assistant for a Study Tracker web app. Help users with study planning, goal setting, task management, and productivity tips. Be concise and friendly."
        }]
      },
      contents
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const botReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    res.json({ success: true, reply: botReply });
  } catch (error) {
    console.error('Chatbot proxy error:', error.message);
    const errorMessage = error.response?.data?.error?.message || 'Failed to fetch response from AI service';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

module.exports = router;