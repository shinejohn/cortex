import React, { useEffect, useState } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, Clock } from 'lucide-react';
export const TrendingNowLive = ({ topics, timePeriod }) => {
  const [animatedTopics, setAnimatedTopics] = useState(topics);
  // Simulate real-time updates to the trending topics
  useEffect(() => {
    if (timePeriod === 'now') {
      const interval = setInterval(() => {
        setAnimatedTopics((prevTopics) => {
          return prevTopics.map((topic) => {
            // Randomly adjust the count slightly
            const adjustment = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const newCount = Math.max(topic.count + adjustment, 0);
            // Randomly adjust the velocity
            const velocityChange =
            Math.random() < 0.3 ? Math.floor(Math.random() * 3) - 1 : 0;
            const newVelocity = Math.max(topic.velocity + velocityChange, 1);
            // Potentially change direction
            const newDirection =
            adjustment > 0 ? 'up' : adjustment < 0 ? 'down' : topic.direction;
            return {
              ...topic,
              count: newCount,
              velocity: newVelocity,
              direction: newDirection
            };
          });
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [timePeriod]);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
          Trending Now - Live
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1.5" />
          <span>Real-time updates</span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {animatedTopics.slice(0, 6).map((topic) =>
          <TrendingTopicCard
            key={topic.id}
            topic={topic}
            timePeriod={timePeriod} />

          )}
        </div>
      </div>
    </div>);

};
const TrendingTopicCard = ({ topic, timePeriod }) => {
  // Generate points for the spark line
  const generateSparkLinePoints = (momentum, direction) => {
    const points = [];
    const height = 20;
    const width = 60;
    const numPoints = 10;
    let prevY = height / 2;
    for (let i = 0; i < numPoints; i++) {
      const x = i / (numPoints - 1) * width;
      // Calculate y based on momentum and direction
      let variation = Math.random() * 4 - 2; // Random variation between -2 and 2
      // Direction influences the trend
      const directionFactor = direction === 'up' ? 1 : -1;
      // Momentum influences the magnitude
      const momentumFactor = momentum * 5;
      // Calculate the new y value
      let y = prevY + (variation + directionFactor * momentumFactor);
      // Keep within bounds
      y = Math.max(0, Math.min(height, y));
      points.push(`${x},${y}`);
      prevY = y;
    }
    return points.join(' ');
  };
  // Generate spark line points
  const sparkLinePoints = generateSparkLinePoints(
    topic.momentum,
    topic.direction
  );
  return (
    <div className="bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">{topic.name}</h4>
          <div className="flex items-center text-sm">
            <span className="text-gray-600 mr-2">
              {topic.count} {getActivityLabel(timePeriod)}
            </span>
            <div
              className={`flex items-center ${topic.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>

              {topic.direction === 'up' ?
              <ArrowUp className="h-3 w-3 mr-1" /> :

              <ArrowDown className="h-3 w-3 mr-1" />
              }
              <span>{topic.velocity}/hr</span>
            </div>
          </div>
        </div>
        {/* Spark line visualization */}
        <div className="relative h-5 w-16">
          <svg className="w-full h-full" viewBox="0 0 60 20">
            <polyline
              points={sparkLinePoints}
              fill="none"
              stroke={topic.direction === 'up' ? '#10b981' : '#ef4444'}
              strokeWidth="1.5" />

          </svg>
          {/* Animated pulse for real-time indicator */}
          {timePeriod === 'now' &&
          <div className="absolute top-0 right-0 h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </div>
          }
        </div>
      </div>
    </div>);

};
// Helper function to get the appropriate activity label based on time period
const getActivityLabel = (timePeriod) => {
  switch (timePeriod) {
    case 'now':
      return 'mentions';
    case 'today':
      return 'today';
    case 'week':
      return 'this week';
    case 'month':
      return 'this month';
    default:
      return 'mentions';
  }
};