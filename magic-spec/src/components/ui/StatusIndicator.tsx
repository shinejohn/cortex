import React from 'react';
type StatusType =
'active' |
'inactive' |
'pending' |
'busy' |
'moderate' |
'quiet';
interface StatusIndicatorProps {
  status: StatusType;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export const StatusIndicator = ({
  status,
  showText = true,
  size = 'md',
  className = ''
}: StatusIndicatorProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'quiet':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'pending':
        return 'Pending';
      case 'busy':
        return 'Busy';
      case 'moderate':
        return 'Moderate';
      case 'quiet':
        return 'Quiet';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5 w-1.5';
      case 'md':
        return 'h-2 w-2';
      case 'lg':
        return 'h-3 w-3';
      default:
        return 'h-2 w-2';
    }
  };
  const getTextColor = () => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'busy':
        return 'text-red-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'quiet':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`${getSizeClass()} rounded-full ${getStatusColor()} mr-1.5`}>
      </div>
      {showText &&
      <span className={`text-sm font-medium ${getTextColor()}`}>
          {getStatusText()}
        </span>
      }
    </div>);

};