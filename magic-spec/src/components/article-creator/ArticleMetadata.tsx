import React, { useState } from 'react';
import {
  Folder,
  Tag,
  MapPin,
  Calendar,
  Clock,
  Image,
  CheckCircle,
  AlertCircle,
  X,
  Info,
  ChevronDown,
  Plus } from
'lucide-react';
export const ArticleMetadata = ({
  category,
  setCategory,
  tags,
  handleAddTag,
  handleRemoveTag,
  location,
  setLocation,
  publishOption,
  setPublishOption,
  publishDate,
  setPublishDate,
  publishTime,
  setPublishTime,
  checklist,
  aiScore
}) => {
  const [newTag, setNewTag] = useState('');
  const handleTagSubmit = (e) => {
    e.preventDefault();
    if (newTag.trim()) {
      handleAddTag(newTag.trim());
      setNewTag('');
    }
  };
  const categories = [
  'News',
  'Business',
  'Politics',
  'Events',
  'Sports',
  'Education',
  'Opinion',
  'Community'];

  return (
    <div className="space-y-4">
      {/* Article Details */}
      <div className="bg-white rounded-lg border border-border-light shadow-sm">
        <div className="p-4 border-b border-border-light flex items-center">
          <Folder className="h-5 w-5 mr-2 text-news-primary" />
          <h2 className="font-display text-lg font-bold text-text-primary">
            Article Details
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Category */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border-medium rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-news-primary">

                {categories.map((cat) =>
                <option key={cat} value={cat}>
                    {cat}
                  </option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
            </div>
          </div>
          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">
              Tags
            </label>
            <form onSubmit={handleTagSubmit} className="flex mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tags..."
                className="flex-1 px-3 py-2 border border-border-medium rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-news-primary" />

              <button
                type="submit"
                className="px-3 py-2 bg-news-primary text-white rounded-r-md text-sm font-medium hover:bg-news-primary-dark">

                <Plus className="h-4 w-4" />
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) =>
              <div
                key={tag}
                className="flex items-center bg-bg-secondary rounded-full px-3 py-1">

                  <Tag className="h-3 w-3 mr-1.5 text-text-tertiary" />
                  <span className="text-xs text-text-secondary">{tag}</span>
                  <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 text-text-tertiary hover:text-text-secondary">

                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {tags.length === 0 &&
              <div className="text-xs text-text-tertiary py-1">
                  Add tags to help readers find your article
                </div>
              }
            </div>
          </div>
          {/* Location */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add specific location..."
                className="w-full px-3 py-2 pl-9 border border-border-medium rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-news-primary" />

              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            </div>
          </div>
          {/* Publication */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">
              Publication
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="publish-now"
                  name="publish-option"
                  value="now"
                  checked={publishOption === 'now'}
                  onChange={() => setPublishOption('now')}
                  className="h-4 w-4 text-news-primary focus:ring-news-primary" />

                <label
                  htmlFor="publish-now"
                  className="ml-2 text-sm text-text-secondary">

                  Publish Now
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="publish-schedule"
                  name="publish-option"
                  value="schedule"
                  checked={publishOption === 'schedule'}
                  onChange={() => setPublishOption('schedule')}
                  className="h-4 w-4 text-news-primary focus:ring-news-primary" />

                <label
                  htmlFor="publish-schedule"
                  className="ml-2 text-sm text-text-secondary">

                  Schedule
                </label>
              </div>
              {publishOption === 'schedule' &&
              <div className="pl-6 flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-3 py-2 pl-9 border border-border-medium rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-news-primary" />

                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  </div>
                  <div className="flex-1 relative">
                    <input
                    type="time"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    className="w-full px-3 py-2 pl-9 border border-border-medium rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-news-primary" />

                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  </div>
                </div>
              }
              <div className="flex items-center">
                <input
                  type="radio"
                  id="publish-draft"
                  name="publish-option"
                  value="draft"
                  checked={publishOption === 'draft'}
                  onChange={() => setPublishOption('draft')}
                  className="h-4 w-4 text-news-primary focus:ring-news-primary" />

                <label
                  htmlFor="publish-draft"
                  className="ml-2 text-sm text-text-secondary">

                  Save as Draft
                </label>
              </div>
            </div>
          </div>
          {/* Featured Image */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1 block">
              Featured Image
            </label>
            <div className="border-2 border-dashed border-border-medium rounded-lg p-4 text-center">
              <Image className="h-6 w-6 text-text-tertiary mx-auto mb-2" />
              <p className="text-xs text-text-tertiary">
                Drag and drop a featured image or click to browse
              </p>
              <button className="mt-2 px-3 py-1.5 bg-bg-secondary text-text-secondary hover:bg-bg-tertiary rounded-md text-xs font-medium">
                Upload Image
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Pre-Publication Checklist */}
      <div className="bg-white rounded-lg border border-border-light shadow-sm">
        <div className="p-4 border-b border-border-light flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-community-green" />
          <h2 className="font-display text-lg font-bold text-text-primary">
            Pre-Publication Checklist
          </h2>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            <li className="flex items-start">
              {checklist.headline ?
              <CheckCircle className="h-5 w-5 text-community-green mr-2 flex-shrink-0" /> :

              <AlertCircle className="h-5 w-5 text-breaking-red mr-2 flex-shrink-0" />
              }
              <span className="text-sm text-text-secondary">
                Compelling headline
              </span>
            </li>
            <li className="flex items-start">
              {checklist.sources ?
              <CheckCircle className="h-5 w-5 text-community-green mr-2 flex-shrink-0" /> :

              <AlertCircle className="h-5 w-5 text-breaking-red mr-2 flex-shrink-0" />
              }
              <span className="text-sm text-text-secondary">
                Local sources quoted
              </span>
            </li>
            <li className="flex items-start">
              {checklist.facts ?
              <CheckCircle className="h-5 w-5 text-community-green mr-2 flex-shrink-0" /> :

              <AlertCircle className="h-5 w-5 text-breaking-red mr-2 flex-shrink-0" />
              }
              <span className="text-sm text-text-secondary">
                Facts verified
              </span>
            </li>
            <li className="flex items-start">
              {checklist.photos ?
              <CheckCircle className="h-5 w-5 text-community-green mr-2 flex-shrink-0" /> :

              <AlertCircle className="h-5 w-5 text-breaking-red mr-2 flex-shrink-0" />
              }
              <span className="text-sm text-text-secondary">
                Photos have captions
              </span>
            </li>
            <li className="flex items-start">
              {checklist.contact ?
              <CheckCircle className="h-5 w-5 text-community-green mr-2 flex-shrink-0" /> :

              <AlertCircle className="h-5 w-5 text-breaking-red mr-2 flex-shrink-0" />
              }
              <span className="text-sm text-text-secondary">
                Contact info included
              </span>
            </li>
            <li className="flex items-start">
              {checklist.spellcheck ?
              <CheckCircle className="h-5 w-5 text-community-green mr-2 flex-shrink-0" /> :

              <AlertCircle className="h-5 w-5 text-breaking-red mr-2 flex-shrink-0" />
              }
              <span className="text-sm text-text-secondary">
                Spell check complete
              </span>
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-border-light">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium text-text-primary">
                  AI Quality Score:
                </span>
                <span className="ml-2 text-lg font-bold text-civic-purple">
                  {aiScore}/100
                </span>
              </div>
              <button className="text-sm text-civic-purple font-medium hover:underline flex items-center">
                <Info className="h-4 w-4 mr-1" />
                View Report
              </button>
            </div>
            <div className="mt-2 h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full ${aiScore >= 80 ? 'bg-community-green' : aiScore >= 60 ? 'bg-yellow-500' : 'bg-breaking-red'}`}
                style={{
                  width: `${aiScore}%`
                }}>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};