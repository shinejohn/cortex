import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Image,
  Type,
  Hash,
  MapPin,
  Calendar,
  Clock,
  Users,
  Tag,
  Info,
  AlertTriangle,
  Check,
  ArrowRight,
  Save,
  X,
  User,
  ThermometerIcon } from
'lucide-react';
const CreateArticlePage = () => {
  const navigate = useNavigate();
  // State for article content
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isFirstArticle, setIsFirstArticle] = useState(true); // For tracking first article status
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally would save to database here
    // If this is the user's first article, direct them to create an author profile
    if (isFirstArticle) {
      navigate('/author/profile-creator', {
        state: {
          fromFirstArticle: true,
          articleTitle: title
        }
      });
    } else {
      // Otherwise go to the next step in article creation
      navigate('/create-article/metadata');
    }
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

      {/* Newspaper title header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-news-primary">
            CLEARWATER DAY NEWS
          </h1>
          <p className="text-gray-600 italic mt-1">
            "Your Community, Your News"
          </p>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4 text-center">
            Create Your Article with AI
          </h1>
          <p className="text-gray-600 mb-6 text-center">
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
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-6">
                  <form onSubmit={handleSubmit}>
                    {/* Title Input */}
                    <div className="mb-6">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Article Title*
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a compelling title..."
                        required />

                    </div>
                    {/* Category Selection */}
                    <div className="mb-6">
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Category*
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required>

                        <option value="" disabled>
                          Select a category
                        </option>
                        <option value="local-news">Local News</option>
                        <option value="community">Community</option>
                        <option value="business">Business</option>
                        <option value="education">Education</option>
                        <option value="politics">Politics</option>
                        <option value="environment">Environment</option>
                        <option value="arts">Arts & Culture</option>
                        <option value="sports">Sports</option>
                        <option value="opinion">Opinion</option>
                      </select>
                    </div>
                    {/* Article Content */}
                    <div className="mb-6">
                      <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Article Content*
                      </label>
                      <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[400px]"
                        placeholder="Write your article here... (minimum 200 characters)"
                        required>
                      </textarea>
                      <p className="mt-1 text-sm text-gray-500">
                        {content.length} characters (minimum 200 recommended)
                      </p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-8">
                      <button
                        type="button"
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center"
                        onClick={() => navigate('/')}>

                        <X className="h-4 w-4 mr-1.5" />
                        Cancel
                      </button>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-md font-medium hover:bg-blue-50 transition-colors flex items-center"
                          onClick={() => {
                            // Would save draft here in a real app
                            alert('Draft saved');
                          }}>

                          <Save className="h-4 w-4 mr-1.5" />
                          Save Draft
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center"
                          disabled={!title || !content || !category}>

                          {isFirstArticle ?
                          <>
                              Continue to Author Profile
                              <ArrowRight className="h-4 w-4 ml-1.5" />
                            </> :

                          <>
                              Continue
                              <ArrowRight className="h-4 w-4 ml-1.5" />
                            </>
                          }
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Tips Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Writing Tips
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Use a clear, attention-grabbing headline
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Start with the most important information
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Include relevant details: who, what, when, where, why
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Use short paragraphs and subheadings
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Verify facts and cite sources when needed
                    </span>
                  </li>
                </ul>
              </div>
              {/* Author Profile Card */}
              {isFirstArticle &&
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <User className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">
                      Become an Author
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    After submitting your first article, you'll create your
                    author profile to:
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                        <Check className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        Showcase your expertise and credentials
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                        <Check className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        Build your reputation in the community
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                        <Check className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        Track your articles' performance
                      </span>
                    </li>
                  </ul>
                </div>
              }
              {/* Guidelines Card */}
              <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6">
                <div className="flex items-start mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-gray-900">
                    Community Guidelines
                  </h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  All articles must adhere to our community guidelines:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• No hate speech or discriminatory content</li>
                  <li>• Verify facts before publishing</li>
                  <li>• Disclose conflicts of interest</li>
                  <li>• Respect copyright and intellectual property</li>
                  <li>• No explicit or graphic content</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  <p className="text-xs text-gray-500">
                    Articles that violate these guidelines may be removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};
export default CreateArticlePage;