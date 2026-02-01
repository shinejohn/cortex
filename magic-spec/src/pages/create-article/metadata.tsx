import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  MapPin,
  Tag,
  Users,
  Building2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Edit,
  Check,
  X,
  Plus,
  ThermometerIcon } from
'lucide-react';
const ArticleMetadataPage = () => {
  const navigate = useNavigate();
  // Mock data that would come from the previous step
  const [metadata, setMetadata] = useState({
    articleType: 'News Article',
    primaryCategory: 'Community',
    secondaryCategories: [
    'Local Government',
    'Infrastructure',
    'Public Spaces'],

    tags: [
    'Community Center',
    'Renovation',
    'Public Facilities',
    'City Budget',
    'Accessibility'],

    primaryLocation: 'Clearwater Community Center',
    relevanceLevel: 'High',
    otherLocations: ['Downtown Clearwater', 'Coachman Park', 'City Hall'],
    people: ['Mayor Jane Johnson', 'Robert Chen', 'City Officials'],
    organizations: [
    'Clearwater City Council',
    'Parks Department',
    'Community Services'],

    readingLevel: 'Grade 8',
    readTime: '4 min',
    objectivityScore: '92%',
    seoScore: '87'
  });
  // Modal states
  const [showArticleTypeModal, setShowArticleTypeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showEditMetadataModal, setShowEditMetadataModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  // New tag input
  const [newTagInput, setNewTagInput] = useState('');
  const handleRemoveTag = (tagToRemove) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };
  const handleAddTag = () => {
    setShowTagModal(true);
  };
  const handleAddTagSubmit = () => {
    if (newTagInput && !metadata.tags.includes(newTagInput)) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...prev.tags, newTagInput]
      }));
      setNewTagInput('');
    }
    setShowTagModal(false);
  };
  const handleChangeArticleType = (newType) => {
    setMetadata((prev) => ({
      ...prev,
      articleType: newType
    }));
    setShowArticleTypeModal(false);
  };
  const handleChangeCategory = (newCategory) => {
    setMetadata((prev) => ({
      ...prev,
      primaryCategory: newCategory
    }));
    setShowCategoryModal(false);
  };
  const handleRegenerate = () => {
    setIsRegenerating(true);
    // Simulate regeneration
    setTimeout(() => {
      setMetadata({
        articleType: 'Feature Story',
        primaryCategory: 'Infrastructure',
        secondaryCategories: ['Community', 'Local Government', 'Public Spaces'],
        tags: [
        'Renovation Project',
        'Community Space',
        'Public Investment',
        'Civic Improvement',
        'Accessibility Upgrades'],

        primaryLocation: 'Clearwater Community Center',
        relevanceLevel: 'Very High',
        otherLocations: ['Downtown Clearwater', 'Coachman Park', 'City Hall'],
        people: [
        'Mayor Jane Johnson',
        'Robert Chen',
        'Project Manager Sarah Williams'],

        organizations: [
        'Clearwater City Council',
        'Parks Department',
        'Community Services',
        'Accessibility Committee'],

        readingLevel: 'Grade 7',
        readTime: '5 min',
        objectivityScore: '94%',
        seoScore: '92'
      });
      setIsRegenerating(false);
    }, 1500);
  };
  // Article types and categories for modals
  const articleTypes = [
  'News Article',
  'Feature Story',
  'Editorial',
  'Opinion Piece',
  'Profile',
  'Interview',
  'Investigative Report'];

  const categories = [
  'Community',
  'Local Government',
  'Infrastructure',
  'Business',
  'Education',
  'Environment',
  'Public Safety',
  'Health',
  'Arts & Culture',
  'Sports'];

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
            Review Article Metadata
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Verify and edit the AI-generated metadata for your article
          </p>
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-700 font-medium">
                Step 2 of 4: Review Metadata
              </div>
              <div className="text-gray-500">50% Complete</div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: '50%'
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
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
                2
              </div>
              <span className="text-blue-600">Metadata</span>
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
          {/* Main Card Container */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {/* Card Header */}
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-news-primary mr-2" />
              <h2 className="text-2xl font-display font-bold text-gray-900">
                Generated Article Metadata
              </h2>
            </div>

            {/* Article Classification Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                Article Classification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Article Type</div>
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                      {metadata.articleType}
                    </span>
                    <button
                      className="ml-2 text-blue-600 text-sm hover:underline"
                      onClick={() => setShowArticleTypeModal(true)}>

                      Change
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Primary Category
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
                      {metadata.primaryCategory}
                    </span>
                    <button
                      className="ml-2 text-blue-600 text-sm hover:underline"
                      onClick={() => setShowCategoryModal(true)}>

                      Change
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  Secondary Categories
                </div>
                <div className="flex flex-wrap gap-2">
                  {metadata.secondaryCategories.map((category) =>
                  <span
                    key={category}
                    className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm">

                      {category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Suggested Tags Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-news-primary" />
                Suggested Tags (AI Generated)
              </h3>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag) =>
                <div
                  key={tag}
                  className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm flex items-center">

                    {tag}
                    <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700">

                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <button
                  onClick={handleAddTag}
                  className="border border-dashed border-gray-300 text-gray-600 rounded-full px-3 py-1 text-sm flex items-center hover:bg-gray-50">

                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Tag
                </button>
              </div>
            </div>

            {/* Geographic Relevance Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-news-primary" />
                Geographic Relevance
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">
                      {metadata.primaryLocation}
                    </div>
                    <div className="text-sm text-gray-600">
                      Relevance: {metadata.relevanceLevel}
                    </div>
                  </div>
                  <button className="text-blue-600 text-sm hover:underline">
                    View on Map
                  </button>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <div>Other relevant locations:</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {metadata.otherLocations.map((location) =>
                    <span
                      key={location}
                      className="bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 text-xs">

                        {location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detected Entities Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-news-primary" />
                Detected Entities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-2 text-gray-700">
                    <Users className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">People</span>
                  </div>
                  <ul className="space-y-1">
                    {metadata.people.map((person) =>
                    <li key={person} className="text-sm text-gray-600">
                        {person}
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center mb-2 text-gray-700">
                    <Building2 className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Organizations</span>
                  </div>
                  <ul className="space-y-1">
                    {metadata.organizations.map((org) =>
                    <li key={org} className="text-sm text-gray-600">
                        {org}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Content Metrics Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-news-primary" />
                Content Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Reading Level</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {metadata.readingLevel}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Read Time</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {metadata.readTime}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Objectivity</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {metadata.objectivityScore}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">SEO Score</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {metadata.seoScore}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/create-article')}
              className="flex items-center text-gray-700 hover:text-gray-900 font-medium">

              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Editing
            </button>
            <div className="flex items-center space-x-3">
              <button
                className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
                onClick={() => setShowEditMetadataModal(true)}>

                <Edit className="h-4 w-4 mr-1.5" />
                Edit Metadata
              </button>
              <button
                className={`flex items-center text-gray-700 hover:text-gray-900 font-medium ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleRegenerate}
                disabled={isRegenerating}>

                <RefreshCw
                  className={`h-4 w-4 mr-1.5 ${isRegenerating ? 'animate-spin' : ''}`} />

                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
              <button
                onClick={() => navigate('/create-article/seo')}
                className="flex items-center bg-news-primary hover:bg-news-primary-dark text-white px-4 py-2 rounded-lg transition-colors">

                Continue to SEO
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Article Type Modal */}
      {showArticleTypeModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Article Type
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {articleTypes.map((type) =>
            <button
              key={type}
              onClick={() => handleChangeArticleType(type)}
              className={`w-full text-left px-4 py-2 rounded-md ${metadata.articleType === type ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100 text-gray-700'}`}>

                  {type}
                </button>
            )}
            </div>
            <div className="flex justify-end">
              <button
              onClick={() => setShowArticleTypeModal(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900">

                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      {/* Category Modal */}
      {showCategoryModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Primary Category
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {categories.map((category) =>
            <button
              key={category}
              onClick={() => handleChangeCategory(category)}
              className={`w-full text-left px-4 py-2 rounded-md ${metadata.primaryCategory === category ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100 text-gray-700'}`}>

                  {category}
                </button>
            )}
            </div>
            <div className="flex justify-end">
              <button
              onClick={() => setShowCategoryModal(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900">

                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      {/* Add Tag Modal */}
      {showTagModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Tag
            </h3>
            <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Enter tag name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus />

            <div className="flex justify-end space-x-2">
              <button
              onClick={() => setShowTagModal(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900">

                Cancel
              </button>
              <button
              onClick={handleAddTagSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!newTagInput}>

                Add Tag
              </button>
            </div>
          </div>
        </div>
      }

      {/* Edit Metadata Modal */}
      {showEditMetadataModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Article Metadata
            </h3>
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <p className="text-gray-600">
                  This comprehensive editor would allow you to edit all aspects
                  of your article's metadata, including:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Article type and categories</li>
                  <li>Tags and keywords</li>
                  <li>Geographic relevance</li>
                  <li>People and organizations</li>
                  <li>Content metrics and settings</li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                  <p className="text-yellow-800 text-sm">
                    For now, please use the individual "Change" buttons
                    throughout the interface to edit specific metadata fields.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
              onClick={() => setShowEditMetadataModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">

                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};
export default ArticleMetadataPage;