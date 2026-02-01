import React, { useState } from 'react';
import { MessageSquare, ChevronDown, Flag, ThumbsUp, Send } from 'lucide-react';
export const ArticleComments = ({ commentCount }) => {
  const [sortBy, setSortBy] = useState('best');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
  {
    id: 1,
    author: 'Local Resident',
    verified: true,
    content:
    "I'm glad they're maintaining the millage rate, but with property values increasing so much, we're still effectively paying more in taxes. I'd like to see more transparency about how these infrastructure funds are being allocated.",
    time: '5 hours ago',
    likes: 45,
    replies: [
    {
      id: 2,
      author: 'David Chen',
      badge: 'Business Owner',
      content:
      'The infrastructure improvements are much needed though. Have you seen the condition of some of our roads? The stormwater system also needs a major upgrade before the next hurricane season.',
      time: '3 hours ago',
      likes: 12
    }]

  },
  {
    id: 3,
    author: 'Michael Johnson',
    content:
    "I'm happy to see the increased funding for public safety. The fire department has been understaffed for years, and our police officers need better equipment. This is a step in the right direction.",
    time: '7 hours ago',
    likes: 28
  }]
  );
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    // Create new comment
    const newComment = {
      id: comments.length + 10,
      author: 'You',
      verified: false,
      content: commentText,
      time: 'Just now',
      likes: 0,
      replies: []
    };
    // Add to comments
    setComments([newComment, ...comments]);
    // Clear the input
    setCommentText('');
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-news-primary text-white px-6 py-4 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        <h2 className="font-display text-xl font-bold">
          Join the Conversation
        </h2>
      </div>
      {/* Comment form */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex">
          <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden mr-3 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80"
              alt="User Avatar"
              className="h-full w-full object-cover" />

          </div>
          <div className="flex-1">
            <form onSubmit={handleCommentSubmit}>
              <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-news-primary focus-within:border-news-primary">
                <textarea
                  className="w-full p-3 text-sm focus:outline-none"
                  rows="3"
                  placeholder="What's your take?"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}>
                </textarea>
                <div className="bg-gray-50 px-3 py-2 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Be respectful and thoughtful in your comments.
                  </div>
                  <button
                    type="submit"
                    className="bg-news-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-news-primary-dark flex items-center"
                    disabled={!commentText.trim()}>

                    <Send className="h-4 w-4 mr-1.5" />
                    Post Comment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Comment sorting */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
        <div className="text-sm font-medium mr-3">Sort by:</div>
        <div className="relative">
          <button className="flex items-center text-sm font-medium text-news-primary">
            {sortBy === 'best' && 'Best'}
            {sortBy === 'newest' && 'Newest'}
            {sortBy === 'oldest' && 'Oldest'}
            <ChevronDown className="h-4 w-4 ml-1" />
          </button>
          {/* Dropdown would go here */}
        </div>
        <div className="ml-auto text-sm text-gray-500">
          {comments.length} comments
        </div>
      </div>
      {/* Pinned comment */}
      <div className="p-6 bg-yellow-50 border-b border-gray-200">
        <div className="flex items-center mb-2">
          <div className="bg-news-primary text-white text-xs px-2 py-0.5 rounded">
            PINNED BY DAY.NEWS
          </div>
        </div>
        <div className="flex">
          <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full overflow-hidden mr-3 flex-shrink-0 flex items-center justify-center font-bold">
            M
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <div className="font-medium text-gray-900 mr-2">Moderator</div>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Staff
              </div>
            </div>
            <div className="text-sm text-gray-800 mb-3">
              Welcome to the discussion! Remember to keep comments civil and on
              topic. Personal attacks and off-topic comments may be removed. See
              our Community Guidelines for more information.
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span>2 days ago</span>
            </div>
          </div>
        </div>
      </div>
      {/* Regular comments */}
      <div className="divide-y divide-gray-200">
        {/* Map through comments */}
        {comments.map((comment) =>
        <div className="p-6" key={comment.id}>
            <div className="flex">
              <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <img
                src={
                comment.author === 'You' ?
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80' :
                comment.author === 'Michael Johnson' ?
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80' :
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80'
                }
                alt="User Avatar"
                className="h-full w-full object-cover" />

              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <div className="font-medium text-gray-900 mr-2">
                    {comment.author}
                  </div>
                  {comment.verified &&
                <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Verified
                    </div>
                }
                  {comment.author === 'You' &&
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      You
                    </div>
                }
                </div>
                <div className="text-sm text-gray-800 mb-3">
                  {comment.content}
                </div>
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <span>{comment.time}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <Flag className="h-4 w-4 mr-1" />
                    <span>Report</span>
                  </button>
                </div>
                {/* Nested replies */}
                {comment.replies &&
              comment.replies.length > 0 &&
              comment.replies.map((reply) =>
              <div
                className="mt-4 ml-6 pt-4 border-t border-gray-100"
                key={reply.id}>

                      <div className="flex">
                        <div className="h-8 w-8 bg-gray-200 rounded-full overflow-hidden mr-3 flex-shrink-0">
                          <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80"
                      alt="User Avatar"
                      className="h-full w-full object-cover" />

                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <div className="font-medium text-gray-900 mr-2">
                              {reply.author}
                            </div>
                            {reply.badge &&
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                {reply.badge}
                              </div>
                      }
                          </div>
                          <div className="text-sm text-gray-800 mb-3">
                            {reply.content}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <span>{reply.time}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span>{reply.likes}</span>
                            </button>
                            <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>Reply</span>
                            </button>
                            <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                              <Flag className="h-4 w-4 mr-1" />
                              <span>Report</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Load more comments */}
      <div className="p-6 text-center">
        <button className="text-news-primary font-medium hover:underline">
          Load More Comments
        </button>
      </div>
    </div>);

};