/**
 * Hook for chat messaging with character agents
 */

import { useState, useCallback } from 'react';

interface Message {
  sender: 'player' | 'character';
  text: string;
  timestamp: number;
  affectionChange?: number;
}

interface SendMessageResponse {
  response: string;
  timestamp: number;
  affectionChange: number;
  agentStatus: string;
}

export function useChat(tokenId: number, playerName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string, authToken: string) => {
    if (!text.trim()) return;

    setIsSending(true);
    setError(null);

    // Optimistically add player message
    const playerMessage: Message = {
      sender: 'player',
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, playerMessage]);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          message: text.trim(),
          playerName,
        }),
      });

      if (!response.ok) {
        // Error response has different structure
        const errorData = await response.json();
        const errorMsg = errorData.details || errorData.error || 'Failed to send message';
        throw new Error(errorMsg);
      }

      const data: SendMessageResponse = await response.json();

      // Add character response
      const characterMessage: Message = {
        sender: 'character',
        text: data.response,
        timestamp: data.timestamp * 1000, // Convert to ms
        affectionChange: data.affectionChange,
      };

      setMessages(prev => [...prev, characterMessage]);

      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1));
      throw err;
    } finally {
      setIsSending(false);
    }
  }, [tokenId, playerName]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const setInitialMessages = useCallback((initialMessages: Message[]) => {
    setMessages(initialMessages);
  }, []);

  return {
    messages,
    sendMessage,
    isSending,
    error,
    clearMessages,
    addMessage,
    setInitialMessages,
  };
}
