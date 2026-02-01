import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Heart,
  ThumbsUp,
  Lightbulb,
  HelpCircle } from
'lucide-react';
export const CommunityPulse = ({ data, timePeriod }) => {
  const [comments, setComments] = useState(data.comments || []);
  // Simulate live comment updates for "now" time period
  useEffect(() => {
    if (timePeriod === 'now' && data.comments) {
      const interval = setInterval(() => {
        // Randomly update likes on comments
        setComments((prevComments) =>
        prevComments.map((comment) => {
          const shouldUpdate = Math.random() > 0.7;
          if (shouldUpdate) {
            return {
              ...comment,
              likes: comment.likes + 1,
              time: '1 minute ago'
            };
          }
          return comment;
        })
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [timePeriod, data.comments]);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-news-primary" />
          Community Pulse
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Word Cloud */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Discussion Topics
          </h4>
          <div className="h-48 relative">
            {data.wordCloud &&
            data.wordCloud.map((word, index) =>
            <div
              key={index}
              className="absolute text-gray-800"
              style={{
                fontSize: `${Math.max(0.7, word.value / 20)}rem`,
                fontWeight: word.value > 60 ? 'bold' : 'normal',
                left: `${Math.random() * 70 + 5}%`,
                top: `${Math.random() * 70 + 5}%`,
                transform: `rotate(${Math.random() * 30 - 15}deg)`,
                opacity: word.value / 100
              }}>

                  {word.text}
                </div>
            )}
          </div>
        </div>
        {/* Live Comment Stream */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Live Comments
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {comments &&
            comments.map((comment) =>
            <div key={comment.id} className="bg-gray-50 rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-900 text-sm">
                      {comment.user}
                    </div>
                    <div className="text-xs text-gray-500">{comment.time}</div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 mb-2">
                    {comment.text}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    <span>{comment.likes}</span>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
      {/* Reaction Summary */}
      <div className="p-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Reaction Summary
        </h4>
        <div className="flex flex-wrap gap-3">
          <ReactionBubble
            icon={<ThumbsUp className="h-4 w-4" />}
            label="Like"
            count={data.reactions ? data.reactions[0].count : 0}
            color="bg-blue-100 text-blue-600" />

          <ReactionBubble
            icon={<Heart className="h-4 w-4" />}
            label="Love"
            count={data.reactions ? data.reactions[1].count : 0}
            color="bg-red-100 text-red-600" />

          <ReactionBubble
            icon={<ThumbsUp className="h-4 w-4" />}
            label="Support"
            count={data.reactions ? data.reactions[2].count : 0}
            color="bg-green-100 text-green-600" />

          <ReactionBubble
            icon={<HelpCircle className="h-4 w-4" />}
            label="Curious"
            count={data.reactions ? data.reactions[3].count : 0}
            color="bg-purple-100 text-purple-600" />

          <ReactionBubble
            icon={<Lightbulb className="h-4 w-4" />}
            label="Insightful"
            count={data.reactions ? data.reactions[4].count : 0}
            color="bg-yellow-100 text-yellow-600" />

        </div>
      </div>
    </div>);

};
const ReactionBubble = ({ icon, label, count, color }) => {
  return (
    <div className={`flex items-center ${color} px-3 py-2 rounded-full`}>
      <div className="mr-2">{icon}</div>
      <div className="text-sm font-medium">{label}</div>
      <div className="ml-2 bg-white bg-opacity-50 px-2 py-0.5 rounded-full text-xs">
        {formatNumber(count)}
      </div>
    </div>);

};
// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num;
  }
};