import React, { useState } from 'react';
import './Message.css';

function Message({ text, sender, isTyping, id, onDelete, timestamp }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line.split(/(\*\*[^*]+\*\*)/).map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        {lineIndex < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      
      const notification = document.createElement('div');
      notification.className = 'copy-notification';
      notification.textContent = 'Скопировано!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 2000);
    } catch (err) {
      console.error('Ошибка при копировании:', err);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      if (onDelete && typeof onDelete === 'function') {
        onDelete(id);
      }
    }, 300); // Время анимации
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${sender} ${isTyping ? 'typing' : ''} ${isDeleting ? 'deleting' : ''}`}>
      <div className="message-content">
        {isTyping ? (
          <div className="typing-indicator">
            <span>печатает</span>
            <span className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        ) : (
          <>
            <div className="message-text">{formatText(text)}</div>
            <div className="message-footer">
              <span className="message-time">{formatTime(timestamp)}</span>
              <div className="message-actions">
                <button 
                  type="button"
                  onClick={handleCopy}
                  className="action-button copy-button"
                  style={{ cursor: 'pointer', zIndex: 1000 }}
                >
                  📋
                </button>
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="action-button delete-button"
                  style={{ cursor: 'pointer', zIndex: 1000 }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Message; 