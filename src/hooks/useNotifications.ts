import { useState, useCallback } from 'react';
import type { SystemMessage } from '../types';

export function useNotifications() {
  const [messages, setMessages] = useState<SystemMessage[]>([]);

  const addMessage = useCallback(
    (type: SystemMessage["type"], title: string, description: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      setMessages((prev) => [...prev, { id, type, title, description }]);
    },
    [],
  );

  const dismissMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const dismissAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    dismissMessage,
    dismissAllMessages,
  };
}
