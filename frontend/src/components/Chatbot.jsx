import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';



// ── Câu trả lời mặc định ─────────────────────────────
// Thêm câu hỏi mới vào đây, keywords là các từ khóa kích hoạt
const PREDEFINED_ANSWERS = [
  {
    keywords: ['toán cao cấp', 'học toán'],
    answer: `Chào cậu, lộ trình học Toán cao cấp đòi hỏi sự tuần tự từ nền tảng đến nâng cao, thường kéo dài 12-18 tháng. Lộ trình lý tưởng bao gồm 6 giai đoạn cốt lõi: Nền tảng, Giải tích, Đại số tuyến tính, Phương trình vi phân, Xác suất thống kê và Toán rời rạc.

Dưới đây là lộ trình chi tiết từng bước:

1. Nền tảng Toán học (Pre-Calculus)
- Mục tiêu: Củng cố kiến thức trước khi bước vào các khái niệm chuyên sâu.
- Nội dung: Lượng giác, hàm số, số phức, đa thức, lý thuyết tập hợp, bất đẳng thức.

2. Giải tích (Calculus & Real Analysis)
- Mục tiêu: Hiểu về sự biến thiên, giới hạn, đạo hàm và tích phân.
- Nội dung: Giới hạn, Đạo hàm, Tích phân, Chuỗi số, Đạo hàm riêng, tích phân bội.

3. Đại số tuyến tính (Linear Algebra)
- Mục tiêu: Trang bị tư duy không gian và xử lý dữ liệu đa chiều.
- Nội dung: Ma trận, định thức, hệ phương trình tuyến tính, không gian vectơ, trị riêng.

4. Phương trình vi phân (Differential Equations)
- Mục tiêu: Mô hình hóa các hiện tượng thực tế trong vật lý, kỹ thuật và kinh tế.
- Nội dung: PT vi phân cấp 1, cấp 2, hệ PT vi phân, biến đổi Laplace.

5. Xác suất & Thống kê (Probability & Statistics)
- Mục tiêu: Phân tích dữ liệu và ra quyết định dựa trên các mô hình ngẫu nhiên.
- Nội dung: Xác suất cơ bản, biến ngẫu nhiên, phân phối xác suất, kiểm định giả thuyết.

6. Toán rời rạc (Discrete Mathematics)
- Mục tiêu: Nền tảng cho Khoa học Máy tính, AI và Lập trình.
- Nội dung: Tổ hợp, lý thuyết đồ thị, logic mệnh đề, lý thuyết mật mã và thuật toán.`
  },
  {
    keywords: ['IELTS', '6.5'],
    answer: `Chào cậu! Để đạt điểm IELTS 6.5, bạn cần tập trung vào việc cải thiện 4 kỹ năng: Nghe, Nói, Đọc, Viết. Dưới đây là một số gợi ý:

1. Nghe: Luyện nghe hàng ngày với các tài liệu tiếng Anh như podcast, phim ảnh, tin tức.
2. Nói: Tham gia các nhóm thảo luận hoặc tìm người bản địa để luyện nói.
3. Đọc: Đọc các bài báo, sách tiếng Anh để mở rộng vốn từ vựng và hiểu biết.
4. Viết: Viết bài tập thường xuyên và nhờ người khác góp ý.

Ngoài ra, bạn cũng nên tham gia các khóa học IELTS để được hướng dẫn chuyên sâu.`


  },
  {
    keywords: ['lập trình', 'cơ bản'],
    answer: `Chào cậu! Để học lập trình hiệu quả, bạn nên bắt đầu với các ngôn ngữ lập trình phổ biến như Python hoặc JavaScript. Dưới đây là một lộ trình học lập trình cơ bản:

1. Hiểu các khái niệm cơ bản về lập trình: Biến, kiểu dữ liệu, cấu trúc điều khiển (if, for, while), hàm.
2. Học một ngôn ngữ lập trình: Bắt đầu với Python hoặc JavaScript để làm quen với cú pháp và cách viết mã.
3. Thực hành qua các dự án nhỏ: Tạo các ứng dụng đơn giản như máy tính, trò chơi nhỏ hoặc trang web tĩnh.
4. Nâng cao kỹ năng: Học về cấu trúc dữ liệu, thuật toán và các khái niệm nâng cao khác.
5. Tham gia cộng đồng: Tham gia các diễn đàn, nhóm học tập để trao đổi kiến thức và nhận phản hồi từ người khác.

Hãy kiên nhẫn và luyện tập thường xuyên để cải thiện kỹ năng lập trình của bạn!`
  },
  {
    keywords: ['thời gian biểu', 'Study Tracker'],
    answer: `Chào cậu! Để quản lý thời gian hiệu quả, bạn có thể sử dụng các công cụ như Study Tracker để lên kế hoạch học tập và theo dõi tiến độ. Dưới đây là một số mẹo để quản lý thời gian học tập:

1. Lên lịch học tập cụ thể và tuân thủ theo lịch.
2. Chia nhỏ thời gian học thành các khoảng thời gian ngắn.
3. Đặt mục tiêu rõ ràng cho từng buổi học.
4. Tránh các yếu tố gây xao nhãng trong quá trình học.
5. Sử dụng các công cụ quản lý thời gian và theo dõi tiến độ học tập.

Ví dụ, để học tốt tiếng Anh, thay vì học dồn dập nhiều giờ trong một ngày, bạn nên chia nhỏ thời gian thành các buổi từ 15–45 phút mỗi ngày để não bộ dễ dàng tiếp thu.
Nguyên tắc cốt lõi là duy trì sự đều đặn (mưa dầm thấm lâu) và cân bằng các kỹ năng (Nghe - Nói - Đọc - Viết).

1. Phân bổ thời gian theo kỹ năng (Gợi ý lịch học 45 phút/ngày)Nghe (10 phút): Tận dụng "thời gian chết" (dead time) như khi đi làm, tập thể dục hoặc nấu ăn để nghe. Bạn có thể chọn các bài Podcast ngắn hoặc video giải trí để làm quen với phát âm và ngữ điệu.
Từ vựng (10 phút): Không nên học quá nhiều từ cùng lúc. Thay vào đó, hãy học 10 từ vựng mới/ngày và tập đặt câu với chúng để nhớ lâu hơn.
Ngữ pháp & Đọc (15 phút): Đọc các mẩu tin ngắn, báo chí hoặc truyện. Đồng thời ôn tập các cấu trúc ngữ pháp cơ bản để áp dụng trực tiếp vào việc đọc và viết.
Nói (10 phút): Luyện phản xạ bằng cách tự nói chuyện trước gương (Self-talk) về các chủ đề quen thuộc trong ngày hoặc lặp lại các câu thoại từ những bộ phim yêu thích.

2. Các "Khung giờ vàng" trong ngày
5h - 7h sáng: Não bộ đã được nghỉ ngơi và tái tạo năng lượng. Đây là thời điểm tốt nhất để học từ vựng mới hoặc các cấu trúc ngữ pháp cần ghi nhớ nhiều.
12h - 13h trưa: Rất thích hợp để luyện nghe hoặc xem các video tiếng Anh ngắn thư giãn trong lúc nghỉ ngơi.Buổi tối (sau 20h): Thời điểm này não bộ tư duy và hoạt động rất hiệu quả, thích hợp để học các bài học chuyên sâu, ngữ pháp hoặc làm bài tập.

3. Tạo môi trường tiếng Anh (Immersion)
Thay vì chỉ ngồi vào bàn học, hãy biến tiếng Anh thành một phần lối sống:
Đổi ngôn ngữ trên điện thoại và máy tính sang tiếng Anh.
Xem phim hoặc nghe nhạc có phụ đề/lời bài hát bằng tiếng Anh.
Tham khảo thêm các cách học tiếng Anh hiệu quả từ các chuyên gia ngôn ngữ.

Hãy sử dụng Study Tracker để theo dõi và tối ưu hóa thời gian học tập của bạn!`
  }

  // Thêm câu hỏi mới ở đây theo cùng format



];

// Kiểm tra câu hỏi có khớp predefined không
const checkPredefined = (message) => {
  const lowerMsg = message.toLowerCase();
  for (const item of PREDEFINED_ANSWERS) {
    // Phải khớp TẤT CẢ keywords trong một entry
    const matched = item.keywords.every(kw => lowerMsg.includes(kw.toLowerCase()));
    if (matched) return item.answer;
  }
  return null;
};

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`;


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

      const predefined = checkPredefined(userText);
      const botReply = predefined ?? await callGeminiAPI(userText, messages);
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