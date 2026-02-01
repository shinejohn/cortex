import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../PageHeader';
import { TagHeader } from './TagHeader';
import { ContentStream } from './ContentStream';
import { RelatedTags } from './RelatedTags';
import { TopContributors } from './TopContributors';
import { TagAnalytics } from './TagAnalytics';
import {
  fetchTag,
  fetchTagContent,
  toggleTagFollow } from
'../../services/tagService';
export const TagPage = ({ tagName = 'farmers-market' }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const queryClient = useQueryClient();
  // Fetch tag data
  const {
    data: tag,
    isLoading: isTagLoading,
    error: tagError
  } = useQuery(['tag', tagName], () => fetchTag(tagName), {
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
  // Fetch tag content
  const {
    data: content,
    isLoading: isContentLoading,
    error: contentError
  } = useQuery(['tagContent', tagName], () => fetchTagContent(tagName), {
    staleTime: 2 * 60 * 1000,
    retry: 2
  });
  // Follow/unfollow mutation
  const followMutation = useMutation(
    (currentFollowState: boolean) =>
    toggleTagFollow(tagName, currentFollowState),
    {
      onSuccess: (newFollowState) => {
        setIsFollowing(newFollowState);
        // Optimistically update the tag data in the cache
        queryClient.setQueryData(['tag', tagName], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            followers: newFollowState ?
            oldData.followers + 1 :
            Math.max(0, oldData.followers - 1)
          };
        });
      }
    }
  );
  const handleFollowToggle = () => {
    followMutation.mutate(isFollowing);
  };
  // Handle loading state
  const isLoading = isTagLoading || isContentLoading;
  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <PageHeader />
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 w-1/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
          </div>
        </div>
      </div>);

  }
  // Handle error state
  if (tagError || contentError) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <PageHeader />
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <h2 className="text-lg font-semibold mb-2">Error Loading Tag</h2>
            <p>
              {tagError ?
              `Failed to load tag information: ${tagError instanceof Error ? tagError.message : 'Unknown error'}` :
              `Failed to load tag content: ${contentError instanceof Error ? contentError.message : 'Unknown error'}`}
            </p>
            <button
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
              onClick={() => queryClient.invalidateQueries(['tag', tagName])}>

              Try Again
            </button>
          </div>
        </div>
      </div>);

  }
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <PageHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Tag Header */}
        <TagHeader
          tag={tag}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          isFollowLoading={followMutation.isLoading} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Stream - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <ContentStream content={content || []} />
          </div>
          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            <RelatedTags tags={tag?.relatedTags || []} />
            <TopContributors contributors={tag?.topContributors || []} />
            <TagAnalytics analytics={tag?.analytics || {}} />
          </div>
        </div>
      </div>
    </div>);

};