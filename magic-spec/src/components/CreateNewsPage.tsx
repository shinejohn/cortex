import React, { useState } from 'react';
import {
  FileText,
  MapPin,
  Info,
  X,
  Upload,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Edit,
  Eye,
  Sparkles,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Shield,
  CheckSquare,
  AlertTriangle,
  Search } from
'lucide-react';
export const CreateNewsPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: '',
    tags: [],
    content: '',
    imageDescription: '',
    location: '',
    sourceReference: ''
  });
  const [currentTag, setCurrentTag] = useState('');
  const [charCount, setCharCount] = useState({
    subtitle: 0,
    content: 0
  });
  const [activeStep, setActiveStep] = useState(1);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [validationResults, setValidationResults] = useState({
    isValidated: false,
    moderationPassed: false,
    sourcesValidated: false,
    finalDecision: 'pending',
    moderationNotes:
    'The article contains inappropriate language, lacks clarity, and does not provide relevant or detailed information for the local community. The tone is unprofessional, and the content does not clearly relate to a specific event or topic.',
    suggestedFixes:
    'Remove offensive language, clarify the main topic or event, provide relevant details about the subject (e.g., why Shine is the best), and ensure the content is appropriate and informative for the local audience.',
    sourceValid: false,
    validationNotes: '',
    confidenceLevel: 'low' // low, medium, high
  });
  const [aiView, setAiView] = useState('chat'); // chat, preview, validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === 'subtitle') {
      setCharCount((prev) => ({
        ...prev,
        subtitle: value.length
      }));
    } else if (name === 'content') {
      setCharCount((prev) => ({
        ...prev,
        content: value.length
      }));
    }
  };
  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };
  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  const handleNextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      // Submit the form
      validateArticle();
    }
  };
  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };
  const validateArticle = () => {
    // In a real app, this would send the data to the backend for validation
    // Here we'll just simulate the validation process
    setValidationResults({
      ...validationResults,
      isValidated: true,
      finalDecision: formData.content.length > 200 ? 'approved' : 'rejected'
    });
    setAiView('validation');
    setShowAIPanel(true);
  };
  const simulateAIResponse = () => {
    // In a real app, this would call an AI API
    // Here we'll just simulate the AI response
    setAiResponse(`Based on your prompt: "${aiPrompt}", here's a draft article:
# ${formData.title || 'Local Community Center Reopens After Renovation'}
${formData.subtitle || 'Residents celebrate the return of a vital community hub with new facilities and programs'}
The local community center has reopened its doors after an extensive six-month renovation project. The $2.3 million renovation includes updated meeting spaces, a new computer lab, and improved accessibility features.
"We're thrilled to welcome everyone back to our improved facility," said Community Director Jane Smith. "These upgrades will allow us to better serve our community with more programs and services."
The grand reopening ceremony, held on Saturday, attracted over 300 residents who enjoyed tours, refreshments, and demonstrations of new programs that will be offered.
Local officials praised the renovation as a vital investment in the community's future. Mayor Robert Johnson highlighted the importance of having modern, accessible spaces for community gatherings and activities.
The center will resume its regular schedule starting Monday, with expanded hours on weekends to accommodate more community events.`);
    setAiView('preview');
  };
  const applyAIContent = () => {
    // Apply the AI-generated content to the form
    const contentLines = aiResponse.
    split('\n').
    filter((line) => line.trim() !== '');
    if (contentLines.length > 0) {
      // Extract title (assuming it starts with # )
      const titleLine = contentLines.find((line) => line.startsWith('# '));
      const title = titleLine ? titleLine.replace('# ', '') : '';
      // Extract subtitle (assuming it's the next line after title)
      const subtitleIndex = contentLines.indexOf(titleLine) + 1;
      const subtitle =
      subtitleIndex < contentLines.length ? contentLines[subtitleIndex] : '';
      // The rest is content
      const content = contentLines.slice(subtitleIndex + 1).join('\n');
      setFormData((prev) => ({
        ...prev,
        title: title || prev.title,
        subtitle: subtitle || prev.subtitle,
        content: content || prev.content
      }));
      setCharCount((prev) => ({
        ...prev,
        subtitle: subtitle.length,
        content: content.length
      }));
      setShowAIPanel(false);
    }
  };
  const renderStepIndicator = () => {
    return (
      <div className="flex justify-between items-center mb-8 px-4 py-3 bg-bg-secondary rounded-lg">
        {[1, 2, 3].map((step) =>
        <div
          key={step}
          className="flex flex-1 items-center"
          onClick={() => setActiveStep(step)}>

            <div
            className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${activeStep === step ? 'bg-news-primary text-white' : activeStep > step ? 'bg-community-green-light bg-opacity-20 text-community-green border border-community-green' : 'bg-bg-tertiary text-text-tertiary'}`}>

              {activeStep > step ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            <div className="flex-1">
              <div
              className={`text-sm font-ui font-medium ${activeStep >= step ? 'text-text-primary' : 'text-text-tertiary'}`}>

                {step === 1 && 'Contextualize'}
                {step === 2 && 'Add content'}
                {step === 3 && 'Validate'}
              </div>
            </div>
            {step < 3 &&
          <div className="flex-1 h-1 bg-bg-tertiary mx-2">
                <div
              className={`h-1 ${activeStep > step ? 'bg-community-green' : 'bg-bg-tertiary'}`}
              style={{
                width: activeStep > step ? '100%' : '0%'
              }}>
            </div>
              </div>
          }
          </div>
        )}
      </div>);

  };
  const renderAIPanel = () => {
    if (!showAIPanel) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-bg-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-border-light p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-civic-purple-light bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <Sparkles className="h-5 w-5 text-civic-purple" />
              </div>
              <h2 className="text-xl font-display font-bold text-text-primary">
                AI Assistant
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAiView('chat')}
                className={`px-3 py-1.5 rounded-md text-sm font-ui flex items-center ${aiView === 'chat' ? 'bg-civic-purple-light bg-opacity-10 text-civic-purple' : 'text-text-secondary hover:bg-bg-tertiary'}`}>

                <MessageSquare className="h-4 w-4 mr-1.5" />
                Chat
              </button>
              <button
                onClick={() => setAiView('preview')}
                className={`px-3 py-1.5 rounded-md text-sm font-ui flex items-center ${aiView === 'preview' ? 'bg-civic-purple-light bg-opacity-10 text-civic-purple' : 'text-text-secondary hover:bg-bg-tertiary'}`}>

                <Eye className="h-4 w-4 mr-1.5" />
                Preview
              </button>
              <button
                onClick={() => setAiView('validation')}
                className={`px-3 py-1.5 rounded-md text-sm font-ui flex items-center ${aiView === 'validation' ? 'bg-civic-purple-light bg-opacity-10 text-civic-purple' : 'text-text-secondary hover:bg-bg-tertiary'}`}>

                <Shield className="h-4 w-4 mr-1.5" />
                Validation
              </button>
              <button
                onClick={() => setShowAIPanel(false)}
                className="text-text-tertiary hover:text-text-secondary">

                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {aiView === 'chat' &&
            <div className="p-4 h-full flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 bg-bg-secondary rounded-lg p-4">
                  {aiResponse ?
                <div className="mb-4">
                      <div className="bg-civic-purple-light bg-opacity-10 rounded-lg p-3 inline-block max-w-[80%]">
                        <p className="text-sm font-ui text-text-secondary">
                          {aiPrompt}
                        </p>
                      </div>
                      <div className="mt-2 bg-bg-primary border border-border-light rounded-lg p-3 inline-block max-w-[80%]">
                        <p className="text-sm font-ui text-text-secondary whitespace-pre-line">
                          {aiResponse}
                        </p>
                      </div>
                    </div> :

                <div className="h-full flex flex-col items-center justify-center text-center text-text-tertiary">
                      <Sparkles className="h-8 w-8 mb-2 text-civic-purple" />
                      <h3 className="font-ui font-medium mb-1 text-text-primary">
                        AI Content Generation
                      </h3>
                      <p className="text-sm font-ui max-w-md">
                        Ask the AI to help you create content for your article.
                        You can provide a topic, keywords, or specific details.
                      </p>
                    </div>
                }
                </div>
                <div className="flex">
                  <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI to generate content (e.g., Write an article about the local community center reopening)"
                  className="flex-1 px-4 py-3 border border-border-medium rounded-l-lg font-ui focus:outline-none focus:ring-2 focus:ring-civic-purple-light" />

                  <button
                  onClick={simulateAIResponse}
                  className="bg-civic-purple text-white px-4 py-2 rounded-r-lg hover:bg-civic-purple-dark flex items-center">

                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </button>
                </div>
              </div>
            }
            {aiView === 'preview' &&
            <div className="p-6">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-display font-bold text-text-primary">
                    AI Generated Content Preview
                  </h3>
                  <button
                  onClick={applyAIContent}
                  className="bg-civic-purple text-white px-4 py-2 rounded-md hover:bg-civic-purple-dark flex items-center">

                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Content
                  </button>
                </div>
                <div className="bg-bg-primary border border-border-light rounded-lg p-6 article-body">
                  <div className="whitespace-pre-line">{aiResponse}</div>
                </div>
              </div>
            }
            {aiView === 'validation' &&
            <div className="p-6">
                <h3 className="text-lg font-display font-bold mb-6 text-text-primary">
                  AI Review Results
                </h3>
                <div className="space-y-6">
                  {/* Moderation Analysis */}
                  <div className="border border-border-light rounded-lg overflow-hidden">
                    <div className="bg-breaking-red-light bg-opacity-10 px-4 py-3 border-b border-border-light flex items-center">
                      <div className="h-5 w-5 bg-breaking-red-light bg-opacity-20 rounded-sm flex items-center justify-center mr-2">
                        <AlertTriangle className="h-3 w-3 text-breaking-red" />
                      </div>
                      <h4 className="font-ui font-medium text-breaking-red">
                        Moderation Analysis
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start">
                        <X className="h-4 w-4 text-breaking-red mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-ui font-medium text-sm">
                            Approved?
                          </span>
                          <span className="text-sm font-ui ml-1 text-breaking-red">
                            no
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Info className="h-4 w-4 text-text-tertiary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-ui font-medium text-sm">
                            Moderation Notes:
                          </span>
                          <p className="text-sm font-ui text-text-secondary mt-1">
                            {validationResults.moderationNotes}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Edit className="h-4 w-4 text-civic-purple mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-ui font-medium text-sm">
                            Suggested Fixes:
                          </span>
                          <p className="text-sm font-ui text-text-secondary mt-1">
                            {validationResults.suggestedFixes}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Source Validation */}
                  <div className="border border-border-light rounded-lg overflow-hidden">
                    <div className="bg-news-primary-light bg-opacity-10 px-4 py-3 border-b border-border-light flex items-center">
                      <div className="h-5 w-5 bg-news-primary-light bg-opacity-20 rounded-sm flex items-center justify-center mr-2">
                        <Search className="h-3 w-3 text-news-primary" />
                      </div>
                      <h4 className="font-ui font-medium text-news-primary">
                        Source Validation
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start">
                        <X className="h-4 w-4 text-breaking-red mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-ui font-medium text-sm">
                            Source Valid?
                          </span>
                          <span className="text-sm font-ui ml-1 text-breaking-red">
                            no
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Info className="h-4 w-4 text-text-tertiary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-ui font-medium text-sm">
                            Validation Notes:
                          </span>
                          <p className="text-sm font-ui text-text-secondary mt-1">
                            Unable to verify the source information. Please
                            provide credible references or citations to support
                            the claims made in the article.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-text-tertiary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-ui font-medium text-sm">
                            Confidence Level:
                          </span>
                          <div className="flex items-center mt-1">
                            <div className="h-2 w-24 bg-bg-tertiary rounded-full overflow-hidden">
                              <div className="h-full bg-breaking-red w-1/4"></div>
                            </div>
                            <span className="text-xs font-ui text-text-tertiary ml-2">
                              Low
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Final Decision */}
                  <div className="border border-border-light rounded-lg overflow-hidden">
                    <div className="bg-breaking-red-light bg-opacity-10 px-4 py-3 border-b border-border-light flex items-center">
                      <div className="h-5 w-5 bg-breaking-red-light bg-opacity-20 rounded-sm flex items-center justify-center mr-2">
                        <CheckSquare className="h-3 w-3 text-breaking-red" />
                      </div>
                      <h4 className="font-ui font-medium text-breaking-red">
                        Final Decision
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-breaking-red mr-2" />
                        <div>
                          <span className="font-ui font-medium text-sm">
                            Final Result:
                          </span>
                          <span className="text-sm font-ui ml-1 font-bold text-breaking-red">
                            Rejected
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
          <div className="border-t border-border-light p-4 flex justify-between">
            <button
              onClick={() => setShowAIPanel(false)}
              className="px-4 py-2 border border-border-medium rounded-md font-ui text-text-secondary hover:bg-bg-secondary">

              Close
            </button>
            <div className="flex space-x-2">
              {aiView === 'preview' &&
              <button
                onClick={applyAIContent}
                className="px-4 py-2 bg-civic-purple text-white rounded-md hover:bg-civic-purple-dark flex items-center">

                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Content
                </button>
              }
              {aiView === 'validation' &&
              <button
                onClick={() => setAiView('chat')}
                className="px-4 py-2 bg-civic-purple text-white rounded-md hover:bg-civic-purple-dark flex items-center">

                  <Edit className="h-4 w-4 mr-2" />
                  Improve with AI
                </button>
              }
            </div>
          </div>
        </div>
      </div>);

  };
  return (
    <div className="flex-1 overflow-auto bg-bg-primary">
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-news-primary" />
            <h1 className="text-xl font-display font-bold text-text-primary">
              Create News
            </h1>
          </div>
          <button
            onClick={() => {
              setShowAIPanel(true);
              setAiView('chat');
            }}
            className="flex items-center bg-news-primary text-white rounded-full px-4 py-2 text-sm font-ui font-medium hover:bg-news-primary-light">

            <span className="mr-2">Create with AI</span>
            <div className="flex items-center justify-center h-5 w-5 bg-white rounded-full">
              <span className="text-xs font-ui font-bold text-news-primary">
                AI
              </span>
            </div>
          </button>
        </div>
        {/* Step Indicator */}
        {renderStepIndicator()}
        {/* Form */}
        <div className="space-y-8">
          {/* Section 1: Contextualize your news */}
          <div
            className={`border border-border-light rounded-lg p-6 ${activeStep === 1 ? '' : 'opacity-60'}`}>

            <h2 className="text-lg font-display font-semibold mb-6 flex items-center text-text-primary">
              <span className="bg-news-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                1
              </span>
              Contextualize your news
            </h2>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-ui font-medium text-text-secondary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Local Market Reopens After Renovation"
                  className="w-full px-3 py-2 border border-border-medium rounded-md font-ui focus:outline-none focus:ring-1 focus:ring-news-primary-light"
                  disabled={activeStep !== 1} />

              </div>
              {/* Subtitle */}
              <div>
                <label className="block text-sm font-ui font-medium text-text-secondary mb-1">
                  Subtitle
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Short summary of the article"
                    className="w-full px-3 py-2 border border-border-medium rounded-md font-ui focus:outline-none focus:ring-1 focus:ring-news-primary-light"
                    maxLength={150}
                    disabled={activeStep !== 1} />

                  <div className="absolute right-2 bottom-2 text-xs font-ui text-text-tertiary">
                    {charCount.subtitle} of 150 chars
                  </div>
                </div>
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-ui font-medium text-text-secondary mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-medium rounded-md font-ui focus:outline-none focus:ring-1 focus:ring-news-primary-light bg-bg-primary"
                  disabled={activeStep !== 1}>

                  <option value="" disabled>
                    Choose an option...
                  </option>
                  <option value="local">Local News</option>
                  <option value="business">Business</option>
                  <option value="sports">Sports</option>
                  <option value="politics">Politics</option>
                  <option value="events">Events</option>
                  <option value="education">Education</option>
                </select>
              </div>
              {/* Tags */}
              <div>
                <label className="block text-sm font-ui font-medium text-text-secondary mb-1 flex items-center">
                  Tags <Info className="h-3.5 w-3.5 ml-1 text-text-tertiary" />
                </label>
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add keywords (e.g. class, music, event)"
                      className="w-full px-3 py-2 border border-border-medium rounded-l-md font-ui focus:outline-none focus:ring-1 focus:ring-news-primary-light"
                      disabled={activeStep !== 1} />

                    {formData.tags.length > 0 &&
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex flex-wrap gap-1">
                        {formData.tags.map((tag) =>
                      <div
                        key={tag}
                        className="flex items-center bg-bg-tertiary text-text-secondary text-xs font-ui rounded-full px-2 py-1">

                            {tag}
                            <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-text-tertiary hover:text-text-secondary"
                          disabled={activeStep !== 1}>

                              <X className="h-3 w-3" />
                            </button>
                          </div>
                      )}
                      </div>
                    }
                  </div>
                  <button
                    onClick={handleAddTag}
                    className="bg-text-tertiary text-white px-4 py-2 rounded-r-md hover:bg-text-secondary font-ui"
                    disabled={activeStep !== 1}>

                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Section 2: Add visual value to your news */}
          <div
            className={`border border-border-light rounded-lg p-6 ${activeStep === 2 ? '' : 'opacity-60'}`}>

            <h2 className="text-lg font-display font-semibold mb-6 flex items-center text-text-primary">
              <span className="bg-news-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                2
              </span>
              Add visual value to your news
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Content */}
              <div className="md:col-span-1">
                <label className="block text-sm font-ui font-medium text-text-secondary mb-1">
                  Content
                </label>
                <div className="relative">
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write the full content of your article (max 3000 chars)"
                    rows={10}
                    className="w-full px-3 py-2 border border-border-medium rounded-md font-ui focus:outline-none focus:ring-1 focus:ring-news-primary-light"
                    maxLength={3000}
                    disabled={activeStep !== 2}>
                  </textarea>
                  <div className="absolute left-2 bottom-2 text-xs font-ui text-text-tertiary">
                    {charCount.content} of 3000 chars
                  </div>
                </div>
              </div>
              {/* Image Upload */}
              <div className="md:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-ui font-medium text-text-secondary mb-1">
                    Image
                  </label>
                  <div className="border border-dashed border-border-medium rounded-md p-6 flex flex-col items-center justify-center h-[250px] bg-bg-secondary">
                    <Upload className="h-6 w-6 text-text-tertiary mb-2" />
                    <p className="text-sm font-ui text-text-tertiary">
                      Click to upload an image
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-ui font-medium text-text-secondary mb-1">
                    Image description
                  </label>
                  <input
                    type="text"
                    name="imageDescription"
                    value={formData.imageDescription}
                    onChange={handleInputChange}
                    placeholder="Describe the image for accessibility / SEO"
                    className="w-full px-3 py-2 border border-border-medium rounded-md font-ui focus:outline-none focus:ring-1 focus:ring-news-primary-light"
                    disabled={activeStep !== 2} />

                </div>
              </div>
            </div>
          </div>
          {/* Section 3: Validate your news content */}
          <div
            className={`border border-border-light rounded-lg p-6 ${activeStep === 3 ? '' : 'opacity-60'}`}>

            <h2 className="text-lg font-display font-semibold mb-6 flex items-center text-text-primary">
              <span className="bg-news-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                3
              </span>
              Validate your news content
            </h2>
            <div className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-ui font-medium text-text-secondary mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Search address..."
                  className="w-full px-3 py-2 border border-border-medium rounded-md font-ui focus:outline-none focus:ring-1 focus:ring-news-primary-light"
                  disabled={activeStep !== 3} />

                <div className="mt-2 h-48 bg-bg-secondary rounded-md overflow-hidden">
                  <img
                    src="/image.png"
                    alt="Map"
                    className="w-full h-full object-cover" />

                </div>
              </div>
              {/* Source reference */}
              <div>
                <label className="block text-sm font-ui font-medium text-text-secondary mb-1">
                  Source reference (optional)
                </label>
                <input
                  type="text"
                  name="sourceReference"
                  value={formData.sourceReference}
                  onChange={handleInputChange}
                  placeholder="Enter the source (URL or citation)"
                  className="w-full px-3 py-2 border border-border-medium rounded-md font-ui focus:outline-none focus:ring-1 focus:ring-news-primary-light"
                  disabled={activeStep !== 3} />

              </div>
              {/* AI Validation Button */}
              <div className="bg-civic-purple-light bg-opacity-10 p-4 rounded-lg border border-civic-purple-light border-opacity-20">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-civic-purple-light bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    <Sparkles className="h-6 w-6 text-civic-purple" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-ui font-medium text-text-primary">
                      AI Content Validation
                    </h3>
                    <p className="text-sm font-ui text-text-secondary">
                      Let our AI check your article for quality, accuracy, and
                      compliance with community guidelines.
                    </p>
                  </div>
                  <button
                    onClick={validateArticle}
                    className="bg-civic-purple text-white px-4 py-2 rounded-md hover:bg-civic-purple-dark flex items-center text-sm font-ui"
                    disabled={activeStep !== 3}>

                    <Shield className="h-4 w-4 mr-2" />
                    Validate Content
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-between">
            {activeStep === 1 ?
            <button className="px-4 py-2 border border-border-medium rounded-md font-ui text-text-secondary hover:bg-bg-secondary">
                Cancel
              </button> :

            <button
              onClick={handlePrevStep}
              className="px-4 py-2 border border-border-medium rounded-md font-ui text-text-secondary hover:bg-bg-secondary flex items-center">

                <ChevronRight className="h-4 w-4 mr-1 transform rotate-180" />
                Back
              </button>
            }
            <button
              onClick={handleNextStep}
              className={`px-4 py-2 ${activeStep === 3 ? 'bg-community-green hover:bg-community-green-dark' : 'bg-news-primary hover:bg-news-primary-light'} text-white rounded-md flex items-center font-ui`}>

              {activeStep === 3 ?
              <>
                  Validate news
                  <CheckCircle className="h-4 w-4 ml-2" />
                </> :

              <>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              }
            </button>
          </div>
        </div>
      </div>
      {/* AI Panel */}
      {renderAIPanel()}
    </div>);

};