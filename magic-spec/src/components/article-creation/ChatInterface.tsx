import React, { useEffect, useState, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
export const ChatInterface = ({ messages, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-[600px] flex flex-col">
      <div className="bg-white border-b p-4 flex items-center">
        <Bot className="w-5 h-5 text-news-primary mr-2" />
        <h2 className="font-semibold text-gray-800">AI Article Assistant</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) =>
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {message.role === 'assistant' &&
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
          }
            <div
            className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-news-primary text-white' : 'bg-gray-100 text-gray-800'}`}>

              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div
              className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>

                {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
              </div>
            </div>
            {message.role === 'user' &&
          <div className="w-8 h-8 bg-news-primary rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
          }
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4 flex items-center gap-2">

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-news-primary" />

        <button
          type="submit"
          className={`p-2 rounded-lg ${inputMessage.trim() ? 'bg-news-primary text-white hover:bg-news-primary-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          disabled={!inputMessage.trim()}>

          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>);

};