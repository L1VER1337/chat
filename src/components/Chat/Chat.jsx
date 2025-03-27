import React, { useState, useRef, useEffect } from 'react';
import Message from '../Message/Message';
import InputField from '../InputField/InputField';
import './Chat.css';

const MAX_CONTEXT_LENGTH = 10;
const MISTRAL_API_KEY = '4EHBej6N9xzxlT1tvygU8DR0DioOtOpQ';

function Chat() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }
    return [{
      id: 'welcome',
      text: 'Привет! Пожалуйста, напишите ваш запрос.',
      sender: 'bot',
      timestamp: Date.now()
    }];
  });
  
  const [context, setContext] = useState(() => {
    const savedContext = localStorage.getItem('chatContext');
    return savedContext ? JSON.parse(savedContext) : [];
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatContext', JSON.stringify(context));
  }, [context]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatResponse = (text) => {
    return text
      .replace(/\n\n/g, '\n') 
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  const generateMistralResponse = async (prompt) => {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [...context, { role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const generatedText = formatResponse(data.choices[0].message.content);

      const newContext = [
        ...context,
        { role: "user", content: prompt },
        { role: "assistant", content: generatedText }
      ];

      if (newContext.length > MAX_CONTEXT_LENGTH * 2) {
        setContext(newContext.slice(-MAX_CONTEXT_LENGTH * 2));
      } else {
        setContext(newContext);
      }

      return generatedText;
    } catch (error) {
      console.error("Ошибка при генерации текста:", error);
      return "Произошла ошибка при обработке запроса.";
    }
  };

  const handleSendMessage = async (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    setIsTyping(true);
    const typingMessage = {
      id: 'typing',
      text: 'печатает...',
      sender: 'bot',
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);
    
    const botResponse = await generateMistralResponse(text);
    
    setIsTyping(false);
    setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
    
    const botMessage = {
      id: Date.now() + 1,
      text: botResponse,
      sender: 'bot',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, botMessage]);
  };

  const handleDeleteMessage = (id) => {
    const messageToDelete = messages.find(message => message.id === id);
    if (messageToDelete) {
      setTimeout(() => {
        setMessages(prev => prev.filter(message => message.id !== id));
      }, 300); 
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      text: 'Привет! Пожалуйста, напишите ваш запрос.',
      sender: 'bot',
      timestamp: Date.now()
    }]);
    setContext([]);
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('chatContext');
  };

  const handleResetContext = () => {
    const systemMessage = {
      id: 'reset',
      text: 'Контекст сброшен',
      sender: 'system',
      timestamp: Date.now()
    };
    
    // Фильтруем старые системные сообщения и добавляем новое
    setMessages(prev => [...prev.filter(msg => msg.sender !== 'system'), systemMessage]);
    setContext([]);
    localStorage.removeItem('chatContext');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Чат</h2>
        <div className="header-buttons">
          <button onClick={handleClearChat} className="clear-chat-button">
            Очистить чат
          </button>
          <button 
            className="reset-button"
            onClick={handleResetContext}
          >
            Сбросить контекст
          </button>
        </div>
      </div>
      <div className="messages-container">
        {messages.map(message => (
          <Message 
            key={message.id} 
            {...message} 
            onDelete={handleDeleteMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <InputField onSend={handleSendMessage} />
    </div>
  );
}

export default Chat; 