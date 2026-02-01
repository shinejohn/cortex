import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorHeader } from '../../components/editor/EditorHeader';
import { EditorToolbar } from '../../components/editor/EditorToolbar';
import { WritingArea } from '../../components/editor/WritingArea';
import { SidePanel } from '../../components/editor/SidePanel';
import { StatusBar } from '../../components/editor/StatusBar';
import { Save, AlertTriangle } from 'lucide-react';
// Mock article data - in a real app, this would come from an API
const mockArticleData = {
  id: '123',
  title: 'Clearwater Community Center Reopens After Renovation',
  content: `<h2>Grand Reopening Celebration</h2>
<p>The newly renovated Clearwater Community Center has officially reopened its doors, and residents are already calling it a major success for the city.</p>
<p>The $3.2 million renovation project, which began last year, has transformed the aging facility into a modern, accessible space that better serves the community's needs.</p>
<h2>Mayor's Comments</h2>
<p>"We're absolutely thrilled with the results," said Mayor Jane Johnson during the ribbon-cutting ceremony on Saturday. "This center has always been the heart of our community, and now it has the facilities to match."</p>
<p>The renovations include an expanded library section, a state-of-the-art computer lab, multiple meeting rooms, and a large multipurpose space for events. Additionally, the building now features improved accessibility, energy-efficient systems, and updated safety measures.</p>
<h2>Community Response</h2>
<p>Community members who attended the opening celebration expressed their approval of the changes. "I've been coming to this center for over 20 years, and I've never seen it look this good," said longtime resident Robert Chen, 67. "The new computer lab is going to be especially helpful for seniors like me who want to stay connected."</p>
<p>The project was completed on time and under budget, according to city officials, who credit careful planning and community input for the successful outcome.</p>`,
  lastSaved: new Date(),
  wordCount: 182,
  characterCount: 1024,
  readingTime: 2
};
const EditorPage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [stats, setStats] = useState({
    wordCount: 0,
    characterCount: 0,
    readingTime: 0
  });
  const autoSaveTimerRef = useRef(null);
  const contentRef = useRef(null);
  // Load article data
  useEffect(() => {
    // Simulate API call to load article
    setIsLoading(true);
    setTimeout(() => {
      setArticle(mockArticleData);
      setLastSaved(mockArticleData.lastSaved);
      setStats({
        wordCount: mockArticleData.wordCount,
        characterCount: mockArticleData.characterCount,
        readingTime: mockArticleData.readingTime
      });
      setIsLoading(false);
    }, 800);
    // Set up beforeunload event to warn about unsaved changes
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
        'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [articleId, isDirty]);
  // Set up auto-save
  useEffect(() => {
    if (!isLoading && article) {
      autoSaveTimerRef.current = setInterval(() => {
        if (isDirty) {
          handleSave(false);
        }
      }, 30000); // Auto-save every 30 seconds
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [isLoading, article, isDirty]);
  const handleContentChange = (newContent) => {
    if (!article) return;
    setArticle({
      ...article,
      content: newContent
    });
    setIsDirty(true);
    // Update stats
    const text = newContent.replace(/<[^>]*>/g, ' ');
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const characterCount = text.replace(/\s+/g, '').length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    setStats({
      wordCount,
      characterCount,
      readingTime
    });
  };
  const handleTitleChange = (newTitle) => {
    if (!article) return;
    setArticle({
      ...article,
      title: newTitle
    });
    setIsDirty(true);
  };
  const handleSave = (navigateAway = false) => {
    // Simulate API call to save article
    console.log('Saving article:', article);
    setLastSaved(new Date());
    setIsDirty(false);
    if (navigateAway) {
      // Navigate back to article creation workflow
      navigate('/create-article/review');
    }
  };
  const handleBackClick = () => {
    if (isDirty) {
      if (
      window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      ))
      {
        navigate('/create-article');
      }
    } else {
      navigate('/create-article');
    }
  };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };
  const handleFormatClick = (format) => {
    if (!contentRef.current) return;
    // Execute the command based on format type
    switch (format) {
      case 'bold':
        document.execCommand('bold', false, null);
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        break;
      case 'underline':
        document.execCommand('underline', false, null);
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough', false, null);
        break;
      case 'h1':
        document.execCommand('formatBlock', false, '<h1>');
        break;
      case 'h2':
        document.execCommand('formatBlock', false, '<h2>');
        break;
      case 'h3':
        document.execCommand('formatBlock', false, '<h3>');
        break;
      case 'h4':
        document.execCommand('formatBlock', false, '<h4>');
        break;
      case 'bulletList':
        document.execCommand('insertUnorderedList', false, null);
        break;
      case 'numberedList':
        document.execCommand('insertOrderedList', false, null);
        break;
      case 'quote':
        document.execCommand('formatBlock', false, '<blockquote>');
        break;
      case 'alignLeft':
        document.execCommand('justifyLeft', false, null);
        break;
      case 'alignCenter':
        document.execCommand('justifyCenter', false, null);
        break;
      case 'alignRight':
        document.execCommand('justifyRight', false, null);
        break;
      case 'alignJustify':
        document.execCommand('justifyFull', false, null);
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) document.execCommand('createLink', false, url);
        break;
      case 'image':
        const imgUrl = prompt('Enter image URL:');
        if (imgUrl) document.execCommand('insertImage', false, imgUrl);
        break;
      case 'divider':
        document.execCommand('insertHorizontalRule', false, null);
        break;
      default:
        console.log(`Format ${format} not implemented yet`);
    }
    // Update content after formatting
    if (contentRef.current) {
      handleContentChange(contentRef.current.innerHTML);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>);

  }
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <EditorHeader
        title={article?.title || 'Untitled Article'}
        onTitleChange={handleTitleChange}
        onBackClick={handleBackClick}
        onSave={() => handleSave(true)}
        onPreviewToggle={togglePreview}
        isPreview={showPreview}
        isDirty={isDirty} />

      <EditorToolbar
        onFormatClick={handleFormatClick}
        isPreview={showPreview} />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <WritingArea
              ref={contentRef}
              content={article?.content || ''}
              onChange={handleContentChange}
              isPreview={showPreview} />

          </div>
        </div>
        {sidebarOpen && <SidePanel onClose={toggleSidebar} article={article} />}
      </div>
      <StatusBar
        wordCount={stats.wordCount}
        characterCount={stats.characterCount}
        readingTime={stats.readingTime}
        lastSaved={lastSaved}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen} />

      {/* Unsaved changes indicator */}
      {isDirty &&
      <div className="fixed bottom-16 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md shadow-md flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="text-sm">Unsaved changes</span>
          <button
          onClick={() => handleSave(false)}
          className="ml-3 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs flex items-center">

            <Save className="h-3 w-3 mr-1" />
            Save now
          </button>
        </div>
      }
    </div>);

};
export default EditorPage;