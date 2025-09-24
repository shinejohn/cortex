import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import axios from "axios";
import {
    BriefcaseIcon,
    CalendarIcon,
    CameraIcon,
    EditIcon,
    GlobeIcon,
    HeartIcon,
    LinkIcon,
    MapPinIcon,
    MessageCircleIcon,
    MoreHorizontalIcon,
    ShareIcon,
    ThumbsUpIcon,
    UserMinusIcon,
    UserPlusIcon,
    UsersIcon
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: string;
    name: string;
    username?: string;
    email: string;
    avatar: string;
    social_profile?: {
        bio?: string;
        location?: string;
        website?: string;
        work?: string;
        education?: string;
        relationship_status?: string;
        birthday?: string;
        profile_visibility: string;
        interests?: string[];
    };
    is_friend_with_user?: boolean;
    has_pending_friend_request?: boolean;
}

interface Post {
    id: string;
    content: string;
    media?: string[];
    created_at: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    is_liked_by_user: boolean;
}

interface Props {
    profile_user: User;
    posts: Post[];
    current_user: User;
}

export default function Profile({ profile_user, posts, current_user }: Props) {
    const [activeTab, setActiveTab] = useState('posts');
    const isOwnProfile = profile_user.id === current_user.id;

    const handleSendFriendRequest = () => {
        axios.post(`/social/users/${profile_user.id}/friend-request`);
    };

    const handleRemoveFriend = () => {
        axios.delete(`/social/friendships/${profile_user.id}`);
    };

    const handleLikePost = (postId: string) => {
        axios.post(`/social/posts/${postId}/like`);
    };

    const handleUnlikePost = (postId: string) => {
        axios.delete(`/social/posts/${postId}/like`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <AppLayout>
            <Head title={`${profile_user.name} - Profile`} />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    {/* Cover photo */}
                    <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-lg overflow-hidden">
                        {isOwnProfile && (
                            <button className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm font-medium">
                                <CameraIcon className="h-4 w-4 mr-2 inline" />
                                Edit Cover Photo
                            </button>
                        )}
                    </div>

                    {/* Profile header */}
                    <div className="relative bg-white shadow rounded-b-lg -mt-16 pt-16 pb-6 px-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                            {/* Profile photo */}
                            <div className="relative -mt-20">
                                <img
                                    src={profile_user.avatar}
                                    alt={profile_user.name}
                                    className="w-32 h-32 rounded-full ring-4 ring-white bg-white object-cover"
                                />
                                {isOwnProfile && (
                                    <button className="absolute bottom-2 right-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full p-2">
                                        <CameraIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Profile info */}
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-gray-900">{profile_user.name}</h1>
                                {profile_user.username && (
                                    <p className="text-gray-600">@{profile_user.username}</p>
                                )}
                                {profile_user.social_profile?.bio && (
                                    <p className="text-gray-700 mt-2">{profile_user.social_profile.bio}</p>
                                )}

                                {/* Profile details */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-600">
                                    {profile_user.social_profile?.location && (
                                        <div className="flex items-center">
                                            <MapPinIcon className="h-4 w-4 mr-1" />
                                            {profile_user.social_profile.location}
                                        </div>
                                    )}
                                    {profile_user.social_profile?.work && (
                                        <div className="flex items-center">
                                            <BriefcaseIcon className="h-4 w-4 mr-1" />
                                            {profile_user.social_profile.work}
                                        </div>
                                    )}
                                    {profile_user.social_profile?.website && (
                                        <div className="flex items-center">
                                            <LinkIcon className="h-4 w-4 mr-1" />
                                            <a
                                                href={profile_user.social_profile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:text-primary/80"
                                            >
                                                Website
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        Joined January 2024
                                    </div>
                                </div>

                                {/* Interests */}
                                {profile_user.social_profile?.interests && profile_user.social_profile.interests.length > 0 && (
                                    <div className="mt-3">
                                        <div className="flex flex-wrap gap-2">
                                            {profile_user.social_profile.interests.map((interest, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex space-x-2">
                                {isOwnProfile ? (
                                    <Link href="/settings/profile">
                                        <Button variant="outline">
                                            <EditIcon className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        {profile_user.is_friend_with_user ? (
                                            <Button variant="outline" onClick={handleRemoveFriend}>
                                                <UsersIcon className="h-4 w-4 mr-2" />
                                                Friends
                                            </Button>
                                        ) : profile_user.has_pending_friend_request ? (
                                            <Button variant="outline" disabled>
                                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                                Request Sent
                                            </Button>
                                        ) : (
                                            <Button onClick={handleSendFriendRequest}>
                                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                                Add Friend
                                            </Button>
                                        )}
                                        <Link href={`/social/messages/${profile_user.id}`}>
                                            <Button variant="outline">
                                                <MessageCircleIcon className="h-4 w-4 mr-2" />
                                                Message
                                            </Button>
                                        </Link>
                                        <Button variant="outline" size="sm">
                                            <MoreHorizontalIcon className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 px-6">
                        {/* Left sidebar - About */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>

                                <div className="space-y-4">
                                    {profile_user.social_profile?.work && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Work</h4>
                                            <p className="text-sm text-gray-600">{profile_user.social_profile.work}</p>
                                        </div>
                                    )}

                                    {profile_user.social_profile?.education && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Education</h4>
                                            <p className="text-sm text-gray-600">{profile_user.social_profile.education}</p>
                                        </div>
                                    )}

                                    {profile_user.social_profile?.relationship_status && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Relationship Status</h4>
                                            <p className="text-sm text-gray-600">{profile_user.social_profile.relationship_status}</p>
                                        </div>
                                    )}

                                    {profile_user.social_profile?.birthday && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Birthday</h4>
                                            <p className="text-sm text-gray-600">{profile_user.social_profile.birthday}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Friends preview */}
                            <div className="bg-white rounded-lg shadow p-6 mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Friends</h3>
                                    <Link
                                        href={`/social/profile/${profile_user.id}/friends`}
                                        className="text-sm text-primary hover:text-primary/80"
                                    >
                                        See all
                                    </Link>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">347 friends</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {/* Mock friend avatars */}
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                                            <img
                                                src={`https://images.unsplash.com/photo-${1500000000000 + i}000-000000000000?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                                                alt="Friend"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main content - Posts */}
                        <div className="lg:col-span-2">
                            {/* Tabs */}
                            <div className="bg-white rounded-lg shadow mb-6">
                                <div className="border-b border-gray-200">
                                    <nav className="flex">
                                        <button
                                            onClick={() => setActiveTab('posts')}
                                            className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                                activeTab === 'posts'
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            Posts
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('photos')}
                                            className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                                activeTab === 'photos'
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            Photos
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('videos')}
                                            className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                                activeTab === 'videos'
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            Videos
                                        </button>
                                    </nav>
                                </div>
                            </div>

                            {/* Posts content */}
                            {activeTab === 'posts' && (
                                <div className="space-y-6">
                                    {posts.length > 0 ? (
                                        posts.map(post => (
                                            <div key={post.id} className="bg-white rounded-lg shadow p-6">
                                                {/* Post header */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={profile_user.avatar}
                                                            alt={profile_user.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">{profile_user.name}</h3>
                                                            <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreHorizontalIcon className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                {/* Post content */}
                                                <div className="mb-4">
                                                    <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
                                                    {post.media && post.media.length > 0 && (
                                                        <div className="mt-3 grid grid-cols-1 gap-2">
                                                            {post.media.map((media, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={media}
                                                                    alt="Post media"
                                                                    className="rounded-lg w-full h-64 object-cover"
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Post actions */}
                                                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                                    <button
                                                        onClick={() =>
                                                            post.is_liked_by_user
                                                                ? handleUnlikePost(post.id)
                                                                : handleLikePost(post.id)
                                                        }
                                                        className={`flex items-center space-x-2 ${
                                                            post.is_liked_by_user
                                                                ? 'text-primary'
                                                                : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                    >
                                                        <ThumbsUpIcon className="h-5 w-5" />
                                                        <span>{post.likes_count}</span>
                                                    </button>
                                                    <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                                                        <MessageCircleIcon className="h-5 w-5" />
                                                        <span>{post.comments_count}</span>
                                                    </button>
                                                    <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                                                        <ShareIcon className="h-5 w-5" />
                                                        <span>{post.shares_count}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-white rounded-lg shadow p-8 text-center">
                                            <p className="text-gray-500">No posts yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'photos' && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <p className="text-gray-500 text-center">No photos to show.</p>
                                </div>
                            )}

                            {activeTab === 'videos' && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <p className="text-gray-500 text-center">No videos to show.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
