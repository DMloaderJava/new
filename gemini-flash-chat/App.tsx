
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageRole } from './types';
import { sendMessage, resetChatSession } from './services/geminiService';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  useEffect(() => {
    // Welcome message or initial prompt
    setMessages([
      { 
        id: Date.now().toString(), 
        role: MessageRole.MODEL, 
        text: "Hello! I'm Gemini Flash. How can I help you today?", 
        timestamp: Date.now() 
      }
    ]);
  }, []);


  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: MessageRole.USER,
      text: inputText,
      timestamp: Date.now(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendMessage(inputText);
      const modelMessage: Message = {
        id: Date.now().toString() + '-model',
        role: MessageRole.MODEL,
        text: responseText,
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, modelMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage); // Display error prominently
      const errorChatMessage: Message = {
        id: Date.now().toString() + '-error',
        role: MessageRole.ERROR,
        text: `Error: ${errorMessage}`,
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    resetChatSession();
    setMessages([
      { 
        id: Date.now().toString(), 
        role: MessageRole.MODEL, 
        text: "New chat started. How can I assist you?", 
        timestamp: Date.now() 
      }
    ]);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 antialiased">
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold tracking-tight">
          <span className="text-blue-400">Gemini</span> Flash Chat
        </h1>
        <button
          onClick={handleNewChat}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          New Chat
        </button>
      </header>

      <main className="flex-grow overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-center py-2">
            <LoadingSpinner />
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {error && !messages.some(m => m.role === MessageRole.ERROR && m.text.includes(error)) && (
         // Only show general error if not already shown as a chat message
        <div className="p-3 bg-red-600 text-white text-sm text-center">
          {error}
        </div>
      )}

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
