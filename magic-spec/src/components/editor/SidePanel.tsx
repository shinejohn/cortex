import React, { useEffect, useState, createElement } from 'react';
import {
  X,
  List,
  Image,
  FileText,
  Search,
  Plus,
  Upload,
  Edit,
  Trash2,
  ExternalLink } from
'lucide-react';
export const SidePanel = ({ onClose, article }) => {
  const [activeTab, setActiveTab] = useState('outline');
  const [searchQuery, setSearchQuery] = useState('');
  const renderTabContent = () => {
    switch (activeTab) {
      case 'outline':
        return <OutlineTab content={article?.content} />;
      case 'media':
        return (
          <MediaLibraryTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery} />);


      case 'research':
        return <ResearchTab />;
      case 'seo':
        return <SeoTab article={article} />;
      default:
        return null;
    }
  };
  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('outline')}
            className={`px-2 py-1 text-xs rounded ${activeTab === 'outline' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>

            Outline
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-2 py-1 text-xs rounded ${activeTab === 'media' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>

            Media
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`px-2 py-1 text-xs rounded ${activeTab === 'research' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>

            Research
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-2 py-1 text-xs rounded ${activeTab === 'seo' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>

            SEO
          </button>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{renderTabContent()}</div>
    </div>);

};
const OutlineTab = ({ content }) => {
  // Extract headings from content
  const extractHeadings = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent || '', 'text/html');
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return headings.map((heading, index) => ({
      id: index,
      level: parseInt(heading.tagName.substring(1)),
      text: heading.textContent
    }));
  };
  const headings = extractHeadings(content);
  const handleHeadingClick = (heading) => {
    // In a real app, this would scroll to the heading
    alert(`Navigating to heading: ${heading.text}`);
  };
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Document Outline
      </h3>
      {headings.length === 0 ?
      <p className="text-sm text-gray-500 italic">
          No headings found. Add headings to create an outline.
        </p> :

      <ul className="space-y-1">
          {headings.map((heading) =>
        <li
          key={heading.id}
          className="flex items-center cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
          style={{
            paddingLeft: `${(heading.level - 1) * 12}px`
          }}
          onClick={() => handleHeadingClick(heading)}>

              <List className="h-3 w-3 text-gray-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">
                {heading.text}
              </span>
            </li>
        )}
        </ul>
      }
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Structure Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
            Use H2 for main sections
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
            Use H3 for subsections
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
            Keep heading hierarchy consistent
          </li>
        </ul>
      </div>
    </div>);

};
const MediaLibraryTab = ({ searchQuery, setSearchQuery }) => {
  // Mock media items
  const mediaItems = [
  {
    id: 1,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1584292650964-8b1f20e13603',
    name: 'community-center.jpg',
    date: '2 days ago'
  },
  {
    id: 2,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    name: 'meeting-room.jpg',
    date: '2 days ago'
  },
  {
    id: 3,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13',
    name: 'ribbon-cutting.jpg',
    date: '3 days ago'
  }];

  const handleImageClick = (image) => {
    // In a real app, this would insert the image into the editor
    alert(`Inserting image: ${image.name}`);
  };
  const handleImageEdit = (e, image) => {
    e.stopPropagation();
    alert(`Editing image: ${image.name}`);
  };
  const handleImageInsert = (e, image) => {
    e.stopPropagation();
    alert(`Inserting image: ${image.name}`);
  };
  const handleImageDelete = (e, image) => {
    e.stopPropagation();
    alert(`Deleting image: ${image.name}`);
  };
  const handleUploadClick = () => {
    alert('This would open the upload dialog in a real app');
  };
  const handleSearchMedia = (e) => {
    e.preventDefault();
    alert(`Searching for: ${searchQuery}`);
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Media Library</h3>
        <div className="flex space-x-1">
          <button
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            onClick={handleUploadClick}>

            <Upload className="h-4 w-4" />
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            onClick={handleSearchMedia}>

            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
      <form onSubmit={handleSearchMedia} className="relative mb-4">
        <input
          type="text"
          placeholder="Search media..."
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} />

      </form>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {mediaItems.map((item) =>
        <div
          key={item.id}
          className="relative group"
          onClick={() => handleImageClick(item)}>

            <img
            src={item.url}
            alt={item.name}
            className="w-full h-20 object-cover rounded border border-gray-200 cursor-pointer" />

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
              className="p-1 bg-white rounded-full text-gray-700 mx-0.5"
              onClick={(e) => handleImageEdit(e, item)}>

                <Edit className="h-3 w-3" />
              </button>
              <button
              className="p-1 bg-white rounded-full text-gray-700 mx-0.5"
              onClick={(e) => handleImageInsert(e, item)}>

                <Plus className="h-3 w-3" />
              </button>
              <button
              className="p-1 bg-white rounded-full text-gray-700 mx-0.5"
              onClick={(e) => handleImageDelete(e, item)}>

                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
      <button
        className="w-full py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 flex items-center justify-center"
        onClick={handleUploadClick}>

        <Plus className="h-4 w-4 mr-1" />
        Upload New Media
      </button>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Stock Photos</h3>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search stock photos..."
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
            onChange={(e) => console.log('Stock photo search:', e.target.value)} />

          <button
            className="absolute right-2 top-1.5 text-gray-500"
            onClick={() => alert('Searching stock photos')}>

            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>);

};
const ResearchTab = () => {
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState([
  {
    id: 1,
    title: 'Clearwater City Website',
    url: 'https://www.clearwatercity.gov/community-center'
  },
  {
    id: 2,
    title: 'Community Center Plans',
    url: 'https://www.clearwatercity.gov/plans/community-center-2023'
  }]
  );
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };
  const handleOpenLink = (link) => {
    alert(`Opening link in new tab: ${link.url}`);
  };
  const handleAddLink = () => {
    const title = prompt('Enter link title:');
    const url = prompt('Enter URL:');
    if (title && url) {
      setLinks([
      ...links,
      {
        id: Date.now(),
        title,
        url
      }]
      );
    }
  };
  const handleAskAI = () => {
    alert('AI Assistant would open here to help with research');
  };
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Research Notes</h3>
      <div className="mb-4">
        <textarea
          placeholder="Add your research notes here..."
          className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded-md resize-none"
          value={notes}
          onChange={handleNotesChange}>
        </textarea>
      </div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Links</h3>
      <div className="space-y-2 mb-4">
        {links.map((link) =>
        <div key={link.id} className="p-2 border border-gray-200 rounded-md">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-blue-600">
                {link.title}
              </span>
              <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => handleOpenLink(link)}>

                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-gray-600 truncate">{link.url}</p>
          </div>
        )}
      </div>
      <button
        className="w-full py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 flex items-center justify-center"
        onClick={handleAddLink}>

        <Plus className="h-4 w-4 mr-1" />
        Add New Link
      </button>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          AI Research Assistant
        </h3>
        <button
          className="w-full py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm hover:bg-blue-100 flex items-center justify-center"
          onClick={handleAskAI}>

          Ask AI Assistant
        </button>
        <p className="mt-2 text-xs text-gray-500">
          Use the AI assistant to find facts, verify information, or get writing
          suggestions.
        </p>
      </div>
    </div>);

};
const SeoTab = ({ article }) => {
  const title = article?.title || '';
  const content = article?.content || '';
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState(
    'community center renovation'
  );
  const [checklist, setChecklist] = useState({
    keyword: false,
    description: false,
    url: false,
    wordCount: false,
    images: false
  });
  // Simple function to extract plain text from HTML
  const getTextFromHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };
  const text = getTextFromHtml(content);
  // Update meta description if empty
  useEffect(() => {
    if (!metaDescription && text) {
      setMetaDescription(text.substring(0, 150) + '...');
    }
  }, [text, metaDescription]);
  // Simple readability score (very basic implementation)
  const calculateReadability = () => {
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const sentences = text.
    split(/[.!?]+/).
    filter((sentence) => sentence.length > 0);
    if (sentences.length === 0) return 0;
    const avgWordsPerSentence = words.length / sentences.length;
    // Simple scale: lower is easier to read
    if (avgWordsPerSentence < 10) return 90;
    if (avgWordsPerSentence < 15) return 80;
    if (avgWordsPerSentence < 20) return 70;
    if (avgWordsPerSentence < 25) return 60;
    return 50;
  };
  const readabilityScore = calculateReadability();
  // Extract keywords (very simple implementation)
  const extractKeywords = () => {
    const commonWords = [
    'the',
    'and',
    'a',
    'in',
    'to',
    'of',
    'for',
    'with',
    'on',
    'at',
    'by',
    'is',
    'was',
    'were'];

    const words = text.
    toLowerCase().
    split(/\W+/).
    filter((word) => word.length > 3 && !commonWords.includes(word));
    const wordCounts = {};
    words.forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    return Object.entries(wordCounts).
    sort((a, b) => b[1] - a[1]).
    slice(0, 5).
    map(([word, count]) => ({
      word,
      count
    }));
  };
  const keywords = extractKeywords();
  const handleChecklistChange = (item) => {
    setChecklist({
      ...checklist,
      [item]: !checklist[item]
    });
  };
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">SEO Analysis</h3>
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Meta Description
        </label>
        <textarea
          placeholder="Enter a compelling meta description..."
          className="w-full h-20 px-3 py-2 text-xs border border-gray-300 rounded-md resize-none"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}>
        </textarea>
        <p className="text-xs text-gray-500 mt-1">
          {metaDescription.length}/160 characters{' '}
          {metaDescription.length > 160 ? '(too long)' : ''}
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Focus Keyword
        </label>
        <input
          type="text"
          placeholder="e.g. community center renovation"
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
          value={focusKeyword}
          onChange={(e) => setFocusKeyword(e.target.value)} />

      </div>
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-600 mb-2">Readability</h4>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${readabilityScore >= 80 ? 'bg-green-500' : readabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{
              width: `${readabilityScore}%`
            }}>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {readabilityScore >= 80 ?
          'Easy to read' :
          readabilityScore >= 60 ?
          'Moderately readable' :
          'Difficult to read'}{' '}
          ({readabilityScore}/100)
        </p>
      </div>
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-600 mb-2">Top Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) =>
          <div
            key={index}
            className="text-xs px-2 py-1 bg-gray-100 rounded-full">

              {keyword.word} ({keyword.count})
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          SEO Checklist
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <input
              type="checkbox"
              className="mt-0.5 mr-2"
              checked={checklist.keyword}
              onChange={() => handleChecklistChange('keyword')} />

            <span className="text-xs text-gray-700">
              Title contains focus keyword
            </span>
          </li>
          <li className="flex items-start">
            <input
              type="checkbox"
              className="mt-0.5 mr-2"
              checked={checklist.description}
              onChange={() => handleChecklistChange('description')} />

            <span className="text-xs text-gray-700">
              Meta description is compelling
            </span>
          </li>
          <li className="flex items-start">
            <input
              type="checkbox"
              className="mt-0.5 mr-2"
              checked={checklist.url}
              onChange={() => handleChecklistChange('url')} />

            <span className="text-xs text-gray-700">URL is SEO-friendly</span>
          </li>
          <li className="flex items-start">
            <input
              type="checkbox"
              className="mt-0.5 mr-2"
              checked={checklist.wordCount}
              onChange={() => handleChecklistChange('wordCount')} />

            <span className="text-xs text-gray-700">
              Content is at least 300 words
            </span>
          </li>
          <li className="flex items-start">
            <input
              type="checkbox"
              className="mt-0.5 mr-2"
              checked={checklist.images}
              onChange={() => handleChecklistChange('images')} />

            <span className="text-xs text-gray-700">Images have alt text</span>
          </li>
        </ul>
      </div>
    </div>);

};