import React from 'react';
import { FileText, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const ArticlePreview = ({ article }) => {
  const { headline, author, content } = article;
  const navigate = useNavigate();
  const handleEditManually = () => {
    // In a real app, you would save the current draft first
    // and then navigate to the editor with the article ID
    navigate('/editor/123');
  };
  return (
    <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-news-primary mr-2" />
          <h2 className="font-semibold text-gray-800">Article Preview</h2>
        </div>
        <button
          onClick={handleEditManually}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          title="Open in full-screen editor">

          <Edit className="w-4 h-4 mr-1.5" />
          Edit Manually
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {!headline && !content ?
        <div className="h-full flex items-center justify-center text-center">
            <p className="text-gray-500 italic max-w-md">
              Your article will appear here as you work with the AI assistant...
            </p>
          </div> :

        <div className="prose max-w-none">
            {headline &&
          <h1 className="font-display text-3xl font-bold mb-2 text-gray-900">
                {headline}
              </h1>
          }
            {author &&
          <p className="text-gray-600 text-sm mb-6">
                By {author} |{' '}
                {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
              </p>
          }
            {content &&
          <div className="leading-relaxed">
                {content.split('\n\n').map((paragraph, idx) =>
            <p key={idx} className="mb-4">
                    {paragraph}
                  </p>
            )}
              </div>
          }
          </div>
        }
      </div>
    </div>);

};