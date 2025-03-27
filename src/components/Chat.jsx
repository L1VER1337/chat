import { useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const resetContext = () => {
    setMessages([
      {
        type: 'system',
        content: 'Контекст сброшен'
      }
    ]);
    setIsTyping(false);
  };

  const clearChat = () => {
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-buttons">
          <button 
            className="reset-button"
            onClick={resetContext}
          >
            Сбросить контекст
          </button>
          <button 
            className="clear-button" 
            onClick={clearChat}
          >
            Очистить чат
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}-message`}>
            {message.content}
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        {/* Здесь ваш существующий код для ввода сообщений */}
      </div>
    </div>
  );
}

export default Chat; 