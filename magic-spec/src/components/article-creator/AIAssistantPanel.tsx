import React, { useState } from 'react';
import {
  Sparkles,
  MessageCircle,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  Zap,
  ArrowRight,
  RefreshCw,
  ThumbsUp,
  X,
  BarChart2,
  Link,
  Send } from
'lucide-react';
export const AIAssistantPanel = ({
  headline,
  content,
  articleType,
  handleImproveHeadline,
  handleGenerateContent,
  aiSuggestion,
  isAiAnalyzing,
  aiScore
}) => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
  {
    role: 'assistant',
    content:
    "Hi! I'm your AI newsroom assistant. I'm here to help you create engaging content for your community. What are you writing about today?"
  }]
  );
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    // Add user message to chat
    setChatHistory([
    ...chatHistory,
    {
      role: 'user',
      content: chatMessage
    }]
    );
    setChatMessage('');
    // Simulate AI response
    setTimeout(() => {
      let response =
      "I'll help you with that! What specific aspects would you like assistance with?";
      if (chatMessage.toLowerCase().includes('headline')) {
        response =
        'For a compelling headline, try to be specific, use active voice, and include a key detail that will interest your readers. Would you like me to suggest some headline formats?';
      } else if (chatMessage.toLowerCase().includes('quote')) {
        response =
        "Adding quotes from local sources makes your story more credible and engaging. Consider reaching out to community leaders, business owners, or residents affected by the topic you're covering.";
      }
      setChatHistory((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: response
      }]
      );
    }, 1000);
  };
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border-light p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-civic-purple-light bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <Sparkles className="h-5 w-5 text-civic-purple" />
          </div>
          <h2 className="font-display font-bold text-text-primary">
            Your AI Newsroom Assistant
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`p-1.5 rounded-md text-sm flex items-center ${activeTab === 'assistant' ? 'bg-civic-purple-light bg-opacity-10 text-civic-purple' : 'text-text-secondary hover:bg-bg-secondary'}`}>

            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`p-1.5 rounded-md text-sm flex items-center ${activeTab === 'analysis' ? 'bg-civic-purple-light bg-opacity-10 text-civic-purple' : 'text-text-secondary hover:bg-bg-secondary'}`}>

            <BarChart2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`p-1.5 rounded-md text-sm flex items-center ${activeTab === 'research' ? 'bg-civic-purple-light bg-opacity-10 text-civic-purple' : 'text-text-secondary hover:bg-bg-secondary'}`}>

            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'assistant' &&
        <div className="flex flex-col h-full">
            {/* Quick actions */}
            <div className="p-4 border-b border-border-light">
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                onClick={handleImproveHeadline}
                disabled={!headline}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${headline ? 'bg-civic-purple text-white hover:bg-civic-purple-dark' : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'}`}>

                  <Sparkles className="h-4 w-4 mr-1.5" />
                  <span>Improve Headline</span>
                </button>
                <button className="flex items-center px-3 py-2 bg-bg-secondary text-text-secondary hover:bg-bg-tertiary rounded-md text-sm">
                  <FileText className="h-4 w-4 mr-1.5" />
                  <span>Suggest Lead</span>
                </button>
                <button className="flex items-center px-3 py-2 bg-bg-secondary text-text-secondary hover:bg-bg-tertiary rounded-md text-sm">
                  <Search className="h-4 w-4 mr-1.5" />
                  <span>Fact Check</span>
                </button>
                <button className="flex items-center px-3 py-2 bg-bg-secondary text-text-secondary hover:bg-bg-tertiary rounded-md text-sm">
                  <Link className="h-4 w-4 mr-1.5" />
                  <span>Add Local Data</span>
                </button>
                <button
                onClick={handleGenerateContent}
                disabled={!headline}
                className={`flex items-center px-3 py-2 rounded-md text-sm col-span-2 ${headline ? 'bg-civic-purple-light bg-opacity-20 text-civic-purple hover:bg-opacity-30' : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'}`}>

                  <Zap className="h-4 w-4 mr-1.5" />
                  <span>Generate Full Story</span>
                </button>
              </div>
            </div>
            {/* AI suggestions */}
            {aiSuggestion &&
          <div className="p-4 border-b border-border-light">
                <div className="bg-civic-purple-light bg-opacity-5 border border-civic-purple-light border-opacity-20 rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="h-6 w-6 bg-civic-purple-light bg-opacity-20 rounded-full flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-civic-purple" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-civic-purple mb-1">
                        AI Writing Tip
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {aiSuggestion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          }
            {/* Chat interface */}
            <div className="flex-1 flex flex-col overflow-hidden p-4">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {chatHistory.map((message, index) =>
              <div
                key={index}
                className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>

                    <div
                  className={`max-w-[80%] rounded-lg p-3 ${message.role === 'assistant' ? 'bg-civic-purple-light bg-opacity-10 text-text-primary' : 'bg-news-primary-light bg-opacity-10 text-text-primary'}`}>

                      {message.role === 'assistant' &&
                  <div className="flex items-center mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-civic-purple mr-1.5" />
                          <span className="text-xs font-medium text-civic-purple">
                            AI Assistant
                          </span>
                        </div>
                  }
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
              )}
                {isAiAnalyzing &&
              <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-civic-purple-light bg-opacity-10 text-text-primary">
                      <div className="flex items-center mb-1">
                        <RefreshCw className="h-3.5 w-3.5 text-civic-purple mr-1.5 animate-spin" />
                        <span className="text-xs font-medium text-civic-purple">
                          AI thinking...
                        </span>
                      </div>
                      <p className="text-sm">Analyzing your content...</p>
                    </div>
                  </div>
              }
              </div>
              <div className="flex items-center">
                <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask AI for help with your story..."
                className="flex-1 px-3 py-2 border border-border-medium rounded-l-md text-sm focus:outline-none focus:ring-1 focus:ring-civic-purple"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />

                <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className={`px-3 py-2 rounded-r-md ${chatMessage.trim() ? 'bg-civic-purple text-white hover:bg-civic-purple-dark' : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'}`}>

                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        }
        {activeTab === 'analysis' &&
        <div className="p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-text-secondary mb-3">
              Content Analysis
            </h3>
            <div className="space-y-4">
              {/* Content score */}
              <div className="bg-bg-secondary rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-text-primary">
                    AI Quality Score
                  </h4>
                  <div className="text-lg font-bold text-civic-purple">
                    {aiScore}/100
                  </div>
                </div>
                <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                  className="h-full bg-civic-purple"
                  style={{
                    width: `${aiScore}%`
                  }}>
                </div>
                </div>
              </div>
              {/* Analysis items */}
              <div className="space-y-2">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-community-green mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-text-primary">
                      Headline strength: Strong
                    </div>
                    <p className="text-sm text-text-secondary">
                      Your headline is clear and compelling.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-breaking-red mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-text-primary">
                      Missing: Local quotes
                    </div>
                    <p className="text-sm text-text-secondary">
                      Adding quotes from local sources will make your story more
                      credible.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-breaking-red mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-text-primary">
                      Suggested: Add specific location
                    </div>
                    <p className="text-sm text-text-secondary">
                      Mentioning specific neighborhoods or streets will help
                      readers connect with your story.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-community-green mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-text-primary">
                      Readability: Grade 8 (Good)
                    </div>
                    <p className="text-sm text-text-secondary">
                      Your content is accessible to a wide audience.
                    </p>
                  </div>
                </div>
              </div>
              <button className="w-full px-3 py-2 bg-civic-purple text-white rounded-md text-sm font-medium hover:bg-civic-purple-dark flex items-center justify-center">
                <Sparkles className="h-4 w-4 mr-1.5" />
                <span>Get Detailed Analysis</span>
              </button>
            </div>
          </div>
        }
        {activeTab === 'research' &&
        <div className="p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-text-secondary mb-3">
              Research Helper
            </h3>
            <div className="mb-4">
              <div className="relative">
                <input
                type="text"
                placeholder="Search for local information..."
                className="w-full px-3 py-2 pl-9 border border-border-medium rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-civic-purple" />

                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">
                  Related Local Info
                </h4>
                <div className="bg-bg-secondary rounded-lg p-3 space-y-2">
                  <div className="flex items-start">
                    <div className="h-5 w-5 bg-news-primary-light bg-opacity-20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-news-primary" />
                    </div>
                    <p className="text-sm">City Council voted 4-3 on May 15</p>
                  </div>
                  <div className="flex items-start">
                    <div className="h-5 w-5 bg-news-primary-light bg-opacity-20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-news-primary" />
                    </div>
                    <p className="text-sm">Project budget: $2.3 million</p>
                  </div>
                  <div className="flex items-start">
                    <div className="h-5 w-5 bg-news-primary-light bg-opacity-20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-news-primary" />
                    </div>
                    <p className="text-sm">Affects 1,200 daily commuters</p>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button className="text-xs text-civic-purple font-medium hover:underline">
                    Import Facts
                  </button>
                  <span className="mx-2 text-text-tertiary">|</span>
                  <button className="text-xs text-civic-purple font-medium hover:underline">
                    Find Sources
                  </button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">
                  Suggested Interviews
                </h4>
                <div className="bg-bg-secondary rounded-lg p-3 space-y-2">
                  <div className="flex items-start">
                    <div className="h-5 w-5 bg-news-primary-light bg-opacity-20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <MessageCircle className="h-3 w-3 text-news-primary" />
                    </div>
                    <p className="text-sm">Mayor Johnson (quoted 3 times)</p>
                  </div>
                  <div className="flex items-start">
                    <div className="h-5 w-5 bg-news-primary-light bg-opacity-20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <MessageCircle className="h-3 w-3 text-news-primary" />
                    </div>
                    <p className="text-sm">Local Business Owner Association</p>
                  </div>
                  <div className="flex items-start">
                    <div className="h-5 w-5 bg-news-primary-light bg-opacity-20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <MessageCircle className="h-3 w-3 text-news-primary" />
                    </div>
                    <p className="text-sm">Traffic Department Spokesperson</p>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button className="text-xs text-civic-purple font-medium hover:underline">
                    Generate Interview Questions
                  </button>
                </div>
              </div>
              <button className="w-full px-3 py-2 bg-civic-purple-light bg-opacity-20 text-civic-purple rounded-md text-sm font-medium hover:bg-opacity-30 flex items-center justify-center">
                <Sparkles className="h-4 w-4 mr-1.5" />
                <span>Generate Story Template</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>);

};