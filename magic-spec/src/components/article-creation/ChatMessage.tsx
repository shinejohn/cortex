import React from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from './ArticleStore';
interface ChatMessageProps {
  message: ChatMessageType;
}
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.role === 'assistant';
  return (
    <div className={`flex gap-3 ${isAI ? '' : 'justify-end'}`}>
      {isAI &&
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
      }
      <div
        className={`${isAI ? 'flex-1 bg-gray-100 text-gray-800' : 'max-w-[80%] bg-blue-600 text-white'} rounded-lg p-3`}>

        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div
          className={`text-xs mt-1 ${isAI ? 'text-gray-500' : 'text-blue-100'}`}>

          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      {!isAI &&
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      }
    </div>);

};