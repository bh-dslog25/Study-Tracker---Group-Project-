import React, { useState, useRef, useEffect } from 'react';
import axios from '../api/axios';
import './Chatbot.css';

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
    { id: 1, text: "Hi! I'm your Study Tracker AI Assistant. How can I help you today?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callGeminiAPI = async (userMessage, chatHistory) => {
    const cleanHistory = chatHistory.filter((msg, index) => !(index === 0 && msg.isBot));

    const res = await axios.post('/chatbot/chat', {
      message: userMessage,
      history: cleanHistory
    });

    return res.data.reply;
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
      const botReply = await callGeminiAPI(userText, messages);
      const botMsg = { id: Date.now() + 1, text: botReply, isBot: true };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errMsg = {
        id: Date.now() + 1,
        text: `Error: ${error.response?.data?.message || error.message || 'Failed to fetch'}`,
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
              <span>Study AI Assistant</span>
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
              placeholder="Type your message..."
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