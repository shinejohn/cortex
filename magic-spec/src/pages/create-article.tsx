import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Home,
  FileText,
  Target,
  Ruler,
  RefreshCw,
  Edit,
  Send,
  Bot,
  User,
  ChevronRight,
  MapPin,
  ThermometerIcon } from
'lucide-react';
import { ChatInterface } from '../components/article-creation/ChatInterface';
import { ArticlePreview } from '../components/article-creation/ArticlePreview';
import { ToneStyleModal } from '../components/article-creation/ToneStyleModal';
import { QuickActionsBar } from '../components/article-creation/QuickActionsBar';
const CreateArticlePage = () => {
  const navigate = useNavigate();
  const [article, setArticle] = useState({
    headline: '',
    author: 'John Doe',
    content: ''
  });
  const [showToneModal, setShowToneModal] = useState(false);
  const [tone, setTone] = useState('Objective News');
  const [style, setStyle] = useState('Professional');
  // Chat state
  const [messages, setMessages] = useState([
  {
    id: '1',
    role: 'assistant',
    content:
    "Welcome! I'll help you create your article. What would you like to write about today?",
    timestamp: new Date()
  }]
  );
  const handleSendMessage = (message) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: simulateAIResponse(message, tone, style),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiResponse]);
      // Update article based on conversation
      if (message.toLowerCase().includes('headline')) {
        setArticle((prev) => ({
          ...prev,
          headline:
          'Clearwater Community Center Renovation Exceeds Expectations'
        }));
      } else if (
      message.toLowerCase().includes('write') ||
      message.toLowerCase().includes('article'))
      {
        setArticle((prev) => ({
          ...prev,
          content: generateSampleContent()
        }));
      }
    }, 1000);
  };
  const simulateAIResponse = (message, tone, style) => {
    if (
    message.toLowerCase().includes('hello') ||
    message.toLowerCase().includes('hi'))
    {
      return "Hello! I'm your AI writing assistant. What topic would you like to write about today?";
    } else if (message.toLowerCase().includes('headline')) {
      return "I've created a headline for your article. How about: 'Clearwater Community Center Renovation Exceeds Expectations'? Would you like me to suggest alternatives?";
    } else if (
    message.toLowerCase().includes('write') ||
    message.toLowerCase().includes('article'))
    {
      return "I've started drafting your article about the community center renovation. You can see the preview on the right. Would you like me to continue, or would you prefer to adjust the tone or style?";
    } else {
      return `I'll help you write an article with a ${tone.toLowerCase()} tone in a ${style.toLowerCase()} style. What specific information would you like to include?`;
    }
  };
  const generateSampleContent = () => {
    return `The newly renovated Clearwater Community Center has officially reopened its doors, and residents are already calling it a major success for the city.
The $3.2 million renovation project, which began last year, has transformed the aging facility into a modern, accessible space that better serves the community's needs.
"We're absolutely thrilled with the results," said Mayor Jane Johnson during the ribbon-cutting ceremony on Saturday. "This center has always been the heart of our community, and now it has the facilities to match."
The renovations include an expanded library section, a state-of-the-art computer lab, multiple meeting rooms, and a large multipurpose space for events. Additionally, the building now features improved accessibility, energy-efficient systems, and updated safety measures.
Community members who attended the opening celebration expressed their approval of the changes. "I've been coming to this center for over 20 years, and I've never seen it look this good," said longtime resident Robert Chen, 67. "The new computer lab is going to be especially helpful for seniors like me who want to stay connected."
The project was completed on time and under budget, according to city officials, who credit careful planning and community input for the successful outcome.`;
  };
  const handleSetTone = () => {
    setShowToneModal(true);
  };
  const handleToneStyleChange = (newTone, newStyle) => {
    setTone(newTone);
    setStyle(newStyle);
    // Add system message about tone change
    setMessages((prev) => [
    ...prev,
    {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I've updated the article tone to "${newTone}" and style to "${newStyle}". Would you like me to adjust the current draft accordingly?`,
      timestamp: new Date()
    }]
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Community Bar */}
      <div className="bg-news-primary text-white py-2 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>Clearwater, FL</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <ThermometerIcon className="h-3.5 w-3.5 mr-1" />
                <span>78°F Sunny</span>
              </div>
              <span className="mx-2">•</span>
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Create Your Article with AI
          </h1>
          <p className="text-gray-600 mb-6">
            Our AI assistant will help you craft a well-written article for the
            Clearwater community
          </p>
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-700 font-medium">
                Step 1 of 4: Draft Article
              </div>
              <div className="text-gray-500">25% Complete</div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: '25%'
                }}>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 text-sm font-medium max-w-3xl mx-auto">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
                1
              </div>
              <span className="text-blue-600">Draft Article</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-0.5 bg-gray-200"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-2">
                2
              </div>
              <span className="text-gray-500">Metadata</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-0.5 bg-gray-200"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-2">
                3
              </div>
              <span className="text-gray-500">SEO</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-0.5 bg-gray-200"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-2">
                4
              </div>
              <span className="text-gray-500">Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Interface */}
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage} />

            {/* Article Preview */}
            <ArticlePreview article={article} />
          </div>
          {/* Quick Actions Bar */}
          <QuickActionsBar
            onSetTone={handleSetTone}
            onAdjustLength={() => {
              setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content:
                'Would you like me to make the article shorter or longer? I can adjust the length while maintaining the key information.',
                timestamp: new Date()
              }]
              );
            }}
            onRegenerate={() => {
              setArticle((prev) => ({
                ...prev,
                content: generateSampleContent()
              }));
              setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content:
                "I've regenerated the article with a fresh perspective. What do you think of this version?",
                timestamp: new Date()
              }]
              );
            }}
            onEditManually={() => {
              // This would typically open an editor
              setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content:
                "You can now edit the article directly. When you're finished, I can review it for you.",
                timestamp: new Date()
              }]
              );
            }} />

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => navigate('/create-article/metadata')}
              className="flex items-center justify-center gap-2 bg-news-primary hover:bg-news-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors">

              Continue to Metadata
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Tone & Style Modal */}
      <ToneStyleModal
        isOpen={showToneModal}
        onClose={() => setShowToneModal(false)}
        onApply={handleToneStyleChange}
        currentTone={tone}
        currentStyle={style} />

    </div>);

};
export default CreateArticlePage;