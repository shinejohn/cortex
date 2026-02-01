import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit,
  Lightbulb,
  MapPin,
  ThermometerIcon,
  AlertCircle,
  FileText,
  BarChart,
  Shield,
  Copy,
  Scale,
  Ruler,
  Zap,
  X,
  Save,
  Check } from
'lucide-react';
const ArticleReviewPage = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showManualEditModal, setShowManualEditModal] = useState(false);
  const [isRequestingAI, setIsRequestingAI] = useState(false);
  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };
  const handleRequestAIImprovements = () => {
    setIsRequestingAI(true);
    // Simulate API call
    setTimeout(() => {
      setIsRequestingAI(false);
      navigate('/create-article');
    }, 1500);
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
            AI Article Review
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Review the AI analysis of your article before publishing
          </p>
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-700 font-medium">
                Step 4 of 4: Final Review
              </div>
              <div className="text-gray-500">100% Complete</div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: '100%'
                }}>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 text-sm font-medium max-w-3xl mx-auto">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-2">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-green-600">Draft Article</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-0.5 bg-green-200"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-2">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-green-600">Metadata</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-0.5 bg-green-200"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-2">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-green-600">SEO</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-0.5 bg-green-200"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
                4
              </div>
              <span className="text-blue-600">Review</span>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-[1400px]">
          {/* Overall Score Banner */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Overall Score: 74/100
                  </h2>
                </div>
                <p className="text-yellow-700 mt-1">Needs Minor Improvements</p>
              </div>
              <div className="text-5xl font-bold text-yellow-600">74</div>
            </div>
          </div>
          {/* Review Sections Container */}
          <div className="space-y-6">
            {/* Grammar & Readability Card */}
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-green-100">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-gray-800">
                    Grammar & Readability
                  </h3>
                </div>
                <div className="text-green-600 font-semibold">92/100</div>
              </div>
              <div className="p-4">
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      No spelling errors detected
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      Reading level appropriate for general audience (Grade 8)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      2 instances of passive voice could be revised for clarity
                    </span>
                  </li>
                </ul>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleSection('grammar')}
                    className="text-blue-600 text-sm font-medium hover:underline flex items-center">

                    Show Details
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                    Auto-Fix
                    <Zap className="h-4 w-4 ml-1" />
                  </button>
                </div>
                {expandedSections.includes('grammar') &&
                <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm">
                    <p className="font-medium mb-2">Passive Voice Instances:</p>
                    <ul className="space-y-2">
                      <li>
                        <p className="text-yellow-700">
                          "The renovations were completed by the city council."
                        </p>
                        <p className="text-green-600 mt-1">
                          Suggestion: "The city council completed the
                          renovations."
                        </p>
                      </li>
                      <li>
                        <p className="text-yellow-700">
                          "Decisions were made without community input."
                        </p>
                        <p className="text-green-600 mt-1">
                          Suggestion: "Officials made decisions without
                          community input."
                        </p>
                      </li>
                    </ul>
                  </div>
                }
              </div>
            </div>
            {/* Credibility & Sources Card */}
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-yellow-100">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-medium text-gray-800">
                    Credibility & Sources
                  </h3>
                </div>
                <div className="text-yellow-600 font-semibold">68/100</div>
              </div>
              <div className="p-4">
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      Quotes are properly attributed
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-red-600">
                      Missing citation for budget figures
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-yellow-700">
                      Consider adding an official source for renovation timeline
                    </span>
                  </li>
                </ul>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleSection('credibility')}
                    className="text-blue-600 text-sm font-medium hover:underline flex items-center">

                    Show Details
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                    Auto-Fix
                    <Zap className="h-4 w-4 ml-1" />
                  </button>
                </div>
                {expandedSections.includes('credibility') &&
                <div className="mt-4 bg-yellow-100 bg-opacity-50 p-3 rounded-md text-sm">
                    <p className="font-medium mb-2">Source Recommendations:</p>
                    <ul className="space-y-3">
                      <li>
                        <p className="text-red-600 font-medium">
                          Missing Citation:
                        </p>
                        <p className="text-gray-700">
                          "The $3.2 million renovation project, which began last
                          year..."
                        </p>
                        <p className="text-blue-600 mt-1">
                          Suggestion: Add reference to city budget document or
                          official press release
                        </p>
                      </li>
                      <li>
                        <p className="text-yellow-600 font-medium">
                          Weak Source:
                        </p>
                        <p className="text-gray-700">
                          "Community members who attended the opening
                          celebration expressed their approval..."
                        </p>
                        <p className="text-blue-600 mt-1">
                          Suggestion: Include specific quotes from named
                          community members
                        </p>
                      </li>
                    </ul>
                  </div>
                }
              </div>
            </div>
            {/* Bias Detection Card */}
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-green-100">
                <div className="flex items-center">
                  <Scale className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Bias Detection</h3>
                </div>
                <div className="text-green-600 font-semibold">89/100</div>
              </div>
              <div className="p-4">
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      Article presents multiple perspectives
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      No significant political bias detected
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      Slightly favorable tone toward city administration
                    </span>
                  </li>
                </ul>
                <button
                  onClick={() => toggleSection('bias')}
                  className="text-blue-600 text-sm font-medium hover:underline flex items-center">

                  Show Details
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                {expandedSections.includes('bias') &&
                <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm">
                    <p className="mb-2">
                      The article maintains good balance overall, but uses more
                      positive adjectives when describing the city's actions
                      compared to community responses:
                    </p>
                    <div className="flex gap-4">
                      <div>
                        <p className="font-medium">City Administration:</p>
                        <p className="text-green-600">
                          "successful outcome", "thrilled with results",
                          "careful planning"
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Community Perspective:</p>
                        <p className="text-gray-600">
                          "expressed approval", "longtime resident"
                        </p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
            {/* Toxicity Check Card */}
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-green-100">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Toxicity Check</h3>
                </div>
                <div className="text-green-600 font-semibold">100/100</div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      No offensive language detected
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      No hate speech or discriminatory content
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      Content appropriate for all audiences
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            {/* Originality Card */}
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-green-100">
                <div className="flex items-center">
                  <Copy className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Originality</h3>
                </div>
                <div className="text-green-600 font-semibold">95/100</div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      Content appears to be original
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      No significant similarity to other published articles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      Quotes properly attributed
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            {/* Category Match Card */}
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-yellow-100">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Category Match</h3>
                </div>
                <div className="text-yellow-600 font-semibold">72/100</div>
              </div>
              <div className="p-4">
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      Article fits "Community" category
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-yellow-700">
                      Could also fit in "Local Government" category
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-yellow-700">
                      Consider adding "Infrastructure" as a secondary category
                    </span>
                  </li>
                </ul>
                <button
                  onClick={() => toggleSection('category')}
                  className="text-blue-600 text-sm font-medium hover:underline flex items-center">

                  Show Details
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                {expandedSections.includes('category') &&
                <div className="mt-4 bg-yellow-100 bg-opacity-50 p-3 rounded-md text-sm">
                    <p className="mb-2">Category match analysis:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <span className="w-32 font-medium">Community:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{
                            width: '85%'
                          }}>
                        </div>
                        </div>
                        <span className="ml-2">85%</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-32 font-medium">
                          Local Government:
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{
                            width: '72%'
                          }}>
                        </div>
                        </div>
                        <span className="ml-2">72%</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-32 font-medium">
                          Infrastructure:
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{
                            width: '65%'
                          }}>
                        </div>
                        </div>
                        <span className="ml-2">65%</span>
                      </li>
                    </ul>
                  </div>
                }
              </div>
            </div>
            {/* Structure & Length Card */}
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-yellow-100">
                <div className="flex items-center">
                  <Ruler className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-medium text-gray-800">
                    Structure & Length
                  </h3>
                </div>
                <div className="text-yellow-600 font-semibold">65/100</div>
              </div>
              <div className="p-4">
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      Good headline and introduction
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-yellow-700">
                      Article is shorter than recommended (450 words vs.
                      600-800)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-yellow-700">
                      Missing subheadings in the middle section
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-red-600">
                      Conclusion is abrupt and lacks a call to action
                    </span>
                  </li>
                </ul>
                <button
                  onClick={() => toggleSection('structure')}
                  className="text-blue-600 text-sm font-medium hover:underline flex items-center">

                  Show Details
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                {expandedSections.includes('structure') &&
                <div className="mt-4 bg-yellow-100 bg-opacity-50 p-3 rounded-md text-sm">
                    <p className="font-medium mb-2">Structure Analysis:</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-700 font-medium">
                          Introduction:{' '}
                          <span className="text-green-600">Strong</span>
                        </p>
                        <p className="text-gray-600">
                          Good hook and clear statement of purpose.
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
                          Body:{' '}
                          <span className="text-yellow-600">Needs Work</span>
                        </p>
                        <p className="text-gray-600">
                          Content is good but lacks clear organization. Consider
                          adding 2-3 subheadings to break up text.
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
                          Conclusion: <span className="text-red-600">Weak</span>
                        </p>
                        <p className="text-gray-600">
                          Ends abruptly. Add a summary of key points and
                          information about upcoming events or how readers can
                          learn more.
                        </p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
          {/* Recommended Actions Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mt-8">
            <div className="flex items-start mb-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <h3 className="font-medium text-gray-800">
                Recommended Actions:
              </h3>
            </div>
            <ol className="space-y-3 pl-6 list-decimal">
              <li className="text-gray-700">
                <span className="text-blue-600 font-medium">
                  Add source citation
                </span>{' '}
                for the renovation budget figures to improve credibility
              </li>
              <li className="text-gray-700">
                <span className="text-blue-600 font-medium">
                  Expand the article
                </span>{' '}
                with additional quotes from community members or details about
                specific improvements
              </li>
              <li className="text-gray-700">
                <span className="text-blue-600 font-medium">
                  Strengthen the conclusion
                </span>{' '}
                with a summary and information about upcoming events at the
                community center
              </li>
            </ol>
          </div>
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => navigate('/create-article/seo')}
              className="flex items-center text-gray-700 hover:text-gray-900 font-medium">

              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to SEO
            </button>
            <div className="flex items-center space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={() => setShowManualEditModal(true)}>

                <Edit className="h-4 w-4 mr-1.5" />
                Edit Manually
              </button>
              <button
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center ${isRequestingAI ? 'opacity-75 cursor-wait' : ''}`}
                onClick={handleRequestAIImprovements}
                disabled={isRequestingAI}>

                <Zap
                  className={`h-4 w-4 mr-1.5 ${isRequestingAI ? 'animate-pulse' : ''}`} />

                {isRequestingAI ? 'Processing...' : 'Request AI Improvements'}
              </button>
              <button
                onClick={() => {
                  // In a real app, this would publish the article
                  alert('Article submitted for human review!');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">

                <CheckCircle className="h-4 w-4 mr-1.5" />
                Submit for Human Review
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* Manual Edit Modal */}
      {showManualEditModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Manual Article Edit
              </h2>
              <button
              onClick={() => setShowManualEditModal(false)}
              className="text-gray-500 hover:text-gray-700">

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article Title
              </label>
              <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              defaultValue="Clearwater Community Center Reopens After $3.2M Renovation" />

            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article Content
              </label>
              <textarea
              className="w-full p-2 border border-gray-300 rounded-md h-64 font-serif"
              defaultValue={`The newly renovated Clearwater Community Center has officially reopened its doors, and residents are already calling it a major success for the city.
The $3.2 million renovation project, which began last year, has transformed the aging facility into a modern, accessible space that better serves the community's needs.
"We're absolutely thrilled with the results," said Mayor Jane Johnson during the ribbon-cutting ceremony on Saturday. "This center has always been the heart of our community, and now it has the facilities to match."
The renovations include an expanded library section, a state-of-the-art computer lab, multiple meeting rooms, and a large multipurpose space for events. Additionally, the building now features improved accessibility, energy-efficient systems, and updated safety measures.
Community members who attended the opening celebration expressed their approval of the changes. "I've been coming to this center for over 20 years, and I've never seen it look this good," said longtime resident Robert Chen, 67. "The new computer lab is going to be especially helpful for seniors like me who want to stay connected."
The project was completed on time and under budget, according to city officials, who credit careful planning and community input for the successful outcome.`}>
            </textarea>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800">
                    Review Suggestions
                  </h3>
                  <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                    <li>
                      Add source citation for the renovation budget figures
                    </li>
                    <li>
                      Expand with additional quotes from community members
                    </li>
                    <li>Add subheadings to organize content</li>
                    <li>
                      Strengthen conclusion with a summary and call to action
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
              onClick={() => setShowManualEditModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">

                Cancel
              </button>
              <button
              onClick={() => {
                setShowManualEditModal(false);
                // In a real app, this would save the changes
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">

                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};
export default ArticleReviewPage;