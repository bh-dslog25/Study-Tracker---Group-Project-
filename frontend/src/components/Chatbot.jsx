import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const IconBot = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"></path>
    <rect x="4" y="8" width="16" height="12" rx="2" ry="2"></rect>
    <path d="M2 14h2"></path>
    <path d="M20 14h2"></path>
    <path d="M15 13v2"></path>
    <path d="M9 13v2"></path>
  </svg>
);

const IconSend = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào, tớ là trợ lý AI Tokuda Chatbot, tớ có thể giúp gì cho bạn?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callGeminiAPI = async (userMessage, chatHistory) => {
    // Chuyển lịch sử chat sang định dạng Gemini yêu cầu
    const contents = chatHistory.map(msg => ({
      role: msg.isBot ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Thêm tin nhắn mới nhất của user
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: "You are a helpful AI assistant for a Study Tracker web app. Help users with study planning, goal setting, task management, and productivity tips. Be concise and friendly."
          }]
        },
        contents
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const userMsg = { id: Date.now(), text: userText, isBot: false };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Truyền lịch sử (không tính tin nhắn vừa thêm) để Gemini có context
      const botReply = await callGeminiAPI(userText, messages);
      const botMsg = { id: Date.now() + 1, text: botReply, isBot: true };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errMsg = {
        id: Date.now() + 1,
        text: `⚠️ Error: ${error.message}`,
        isBot: true
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <IconBot />
              <span>Tokuda AI Assistant</span>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <IconClose />
            </button>
          </div>

          <div className="chatbot-messages custom-scrollbar">
            {messages.map(m => (
              <div key={m.id} className={`chatbot-bubble-row ${m.isBot ? 'bot' : 'user'}`}>
                <div className={`chatbot-bubble ${m.isBot ? 'bot' : 'user'}`}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Hiển thị trạng thái đang gõ */}
            {isLoading && (
              <div className="chatbot-bubble-row bot">
                <div className="chatbot-bubble bot">
                  <span className="typing-indicator">
                    <span></span><span></span><span></span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Nhập tin nhắn của bạn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="chatbot-send" disabled={!inputValue.trim() || isLoading}>
              <IconSend />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <IconBot />
        </button>
      )}
    </div>
  );
}