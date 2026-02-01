import React, { useEffect, useState } from 'react';
import {
  X,
  Send,
  Paperclip,
  User,
  Sparkles,
  Phone,
  Maximize2,
  Minimize2 } from
'lucide-react';
export const LiveChatWidget = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [agentName] = useState('Sarah Johnson');
  const [supportTicket] = useState(
    'TCK-' + Math.floor(100000 + Math.random() * 900000)
  );
  // Simulate agent typing and response
  const simulateAgentResponse = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
      'Thanks for reaching out! How can I help you today?',
      "I'd be happy to assist with that. Could you provide more details?",
      'Let me check that for you. It might take a moment.',
      "Is there anything else you'd like to know about our services?",
      "I've made a note of your feedback. Thank you for sharing that with us."];

      const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: randomResponse,
        sender: 'agent',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }]
      );
    }, 2000);
  };
  // Send a welcome message when chat opens
  useEffect(() => {
    setMessages([
    {
      id: 1,
      text: `Hello! I'm ${agentName} from Day.News support. How can I help you today?`,
      sender: 'agent',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }]
    );
  }, [agentName]);
  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Add user message
    setMessages((prev) => [
    ...prev,
    {
      id: Date.now(),
      text: message,
      sender: 'user',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }]
    );
    setMessage('');
    // Simulate agent response
    simulateAgentResponse();
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <div
      className={`fixed ${isMinimized ? 'bottom-4 right-4 w-72 h-16' : 'bottom-4 right-4 w-96 h-[32rem] max-h-[calc(100vh-2rem)]'} bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50 transition-all duration-300`}>

      {/* Chat Header */}
      <div className="bg-news-primary text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          {!isMinimized &&
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-news-primary" />
            </div>
          }
          <div>
            <h3 className="font-bold">
              {isMinimized ? 'Live Chat' : 'Day.News Support'}
            </h3>
            {!isMinimized &&
            <div className="text-xs flex items-center">
                <span className="h-2 w-2 bg-green-400 rounded-full mr-1"></span>
                <span>Agent Online</span>
              </div>
            }
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isMinimized &&
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:text-gray-200 transition-colors">

              <Minimize2 className="h-4 w-4" />
            </button>
          }
          {isMinimized &&
          <button
            onClick={() => setIsMinimized(false)}
            className="text-white hover:text-gray-200 transition-colors">

              <Maximize2 className="h-4 w-4" />
            </button>
          }
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors">

            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      {!isMinimized &&
      <>
          {/* Chat Info Bar */}
          <div className="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Agent:</span> {agentName}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Ticket:</span> {supportTicket}
            </div>
          </div>
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg) =>
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

                  <div
                className={`max-w-[70%] ${msg.sender === 'user' ? 'bg-news-primary text-white rounded-l-lg rounded-tr-lg' : 'bg-white border border-gray-200 text-gray-800 rounded-r-lg rounded-tl-lg'} px-4 py-2 shadow-sm`}>

                    <div className="text-sm">{msg.text}</div>
                    <div
                  className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>

                      {msg.time}
                    </div>
                  </div>
                </div>
            )}
              {isTyping &&
            <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-800 rounded-r-lg rounded-tl-lg px-4 py-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
            }
            </div>
          </div>
          {/* Priority Options */}
          <div className="bg-gray-50 border-t border-gray-200 p-2 flex justify-center">
            <div className="flex space-x-3">
              <button className="flex items-center text-xs text-gray-600 hover:text-news-primary px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                <Sparkles className="h-3 w-3 mr-1" />
                <span>Priority Support</span>
              </button>
              <button className="flex items-center text-xs text-gray-600 hover:text-news-primary px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                <Phone className="h-3 w-3 mr-1" />
                <span>Request Call</span>
              </button>
            </div>
          </div>
          {/* Chat Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center">
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1 mx-2">
                <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-news-primary focus:border-news-primary resize-none"
                rows={1}>
              </textarea>
              </div>
              <button
              onClick={handleSendMessage}
              className={`p-2 rounded-full ${message.trim() ? 'bg-news-primary text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!message.trim()}>

                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      }
    </div>);

};