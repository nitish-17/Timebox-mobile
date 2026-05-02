import React, { useEffect } from 'react';
import { Shield, Star, Zap } from 'lucide-react';

export interface SystemMessage {
  id: string;
  type: 'QUEST_CLEARED' | 'LEVEL_UP' | 'SKILL_AWAKENED';
  title: string;
  description: string;
}

export const SystemNotifications: React.FC<{ messages: SystemMessage[]; onDismiss: (id: string) => void }> = ({ 
  messages, 
  onDismiss 
}) => {
  return (
    <div className="system-notifications-container">
      {messages.map((msg) => (
        <NotificationItem key={msg.id} message={msg} onDismiss={() => onDismiss(msg.id)} />
      ))}
      <style>{`
        .system-notifications-container {
          position: fixed;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999999;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          pointer-events: none;
        }
        .system-notification {
          background: rgba(2, 6, 23, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid var(--accent);
          padding: 1rem 2rem;
          border-radius: 4px;
          min-width: 300px;
          box-shadow: 0 0 30px rgba(14, 165, 233, 0.4);
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: system-slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
                     system-glow 2s infinite alternate;
          pointer-events: auto;
          cursor: pointer;
        }
        @keyframes system-slide-down {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes system-glow {
          from { box-shadow: 0 0 20px rgba(14, 165, 233, 0.2); }
          to { box-shadow: 0 0 40px rgba(14, 165, 233, 0.5); }
        }
        .system-notification-icon {
          color: var(--accent);
          filter: drop-shadow(0 0 5px var(--accent));
        }
        .system-notification-content {
          flex: 1;
        }
        .system-notification-title {
          font-family: var(--font-family);
          color: var(--accent);
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }
        .system-notification-desc {
          font-family: var(--font-family);
          color: #94a3b8;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

const NotificationItem: React.FC<{ message: SystemMessage; onDismiss: () => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (message.type) {
      case 'LEVEL_UP': return <Star className="system-notification-icon" size={24} />;
      case 'SKILL_AWAKENED': return <Zap className="system-notification-icon" size={24} />;
      default: return <Shield className="system-notification-icon" size={24} />;
    }
  };

  return (
    <div className="system-notification" onClick={onDismiss}>
      {getIcon()}
      <div className="system-notification-content">
        <div className="system-notification-title">{message.title}</div>
        <div className="system-notification-desc">{message.description}</div>
      </div>
    </div>
  );
};
