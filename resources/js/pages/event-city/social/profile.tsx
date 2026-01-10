import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
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
    UsersIcon,
} from "lucide-react";
import { useState } from "react";

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
        birth_date?: string;
        profile_visibility: string;
        interests?: string[];
        social_links?: string[];
        show_email?: boolean;
        show_location?: boolean;
        cover_photo?: string;
    };
    is_friend_with_user?: boolean;
    has_pending_friend_request?: boolean;
    created_at?: string;
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

interface Friend {
    id: string;
    name: string;
    avatar: string;
}

interface Props {
    profile_user: User;
    posts: Post[];
    current_user: User;
    friends: Friend[];
    friends_count: number;
}

export default function Profile({ profile_user, posts, current_user, friends, friends_count }: Props) {
    const [friendshipStatus, setFriendshipStatus] = useState({
        is_friend: profile_user.is_friend_with_user || false,
        has_pending_request: profile_user.has_pending_friend_request || false,
    });
    const [loading, setLoading] = useState(false);
    const isOwnProfile = profile_user.id === current_user.id;

    const handleSendFriendRequest = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await axios.post(`/social/users/${profile_user.id}/friend-request`);
            setFriendshipStatus({
                is_friend: false,
                has_pending_request: true,
            });
            toast.success("Friend request sent successfully");
        } catch (error: any) {
            console.error("Error sending friend request:", error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to send friend request. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFriend = async () => {
        if (loading || !confirm("Are you sure you want to remove this friend?")) return;
        setLoading(true);

        try {
            await axios.delete(`/social/friends/${profile_user.id}/remove`);
            setFriendshipStatus({
                is_friend: false,
                has_pending_request: false,
            });
            toast.success("Friend removed successfully");
        } catch (error: any) {
            console.error("Error removing friend:", error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to remove friend. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleLikePost = async (postId: string) => {
        try {
            await axios.post(`/social/posts/${postId}/like`);
        } catch (error: any) {
            console.error("Error liking post:", error);
            const errorMessage = error.response?.data?.message || "Failed to like post. Please try again.";
            toast.error(errorMessage);
        }
    };

    const handleUnlikePost = async (postId: string) => {
        try {
            await axios.delete(`/social/posts/${postId}/like`);
        } catch (error: any) {
            console.error("Error unliking post:", error);
            const errorMessage = error.response?.data?.message || "Failed to unlike post. Please try again.";
            toast.error(errorMessage);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <AppLayout>
            <Head title={`${profile_user.name} - Profile`} />
            <div className="min-h-screen bg-muted/50">
                <div className="max-w-4xl mx-auto">
                    {/* Cover photo */}
                    <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-lg overflow-hidden">
                        {isOwnProfile && (
                            <button className="absolute top-4 right-4 bg-card bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm font-medium">
                                <CameraIcon className="h-4 w-4 mr-2 inline" />
                                Edit Cover Photo
                            </button>
                        )}
                    </div>

                    {/* Profile header */}
                    <div className="relative bg-card shadow rounded-b-lg -mt-16 pt-16 pb-6 px-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                            {/* Profile photo */}
                            <div className="relative -mt-20">
                                <img
                                    src={profile_user.avatar}
                                    alt={profile_user.name}
                                    className="w-32 h-32 rounded-full ring-4 ring-white bg-card object-cover"
                                />
                                {isOwnProfile && (
                                    <button className="absolute bottom-2 right-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full p-2">
                                        <CameraIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Profile info */}
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-foreground">{profile_user.name}</h1>
                                {profile_user.username && <p className="text-muted-foreground">@{profile_user.username}</p>}
                                {profile_user.social_profile?.bio && <p className="text-foreground mt-2">{profile_user.social_profile.bio}</p>}

                                {/* Profile details */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                                    {profile_user.social_profile?.location && (
                                        <div className="flex items-center">
                                            <MapPinIcon className="h-4 w-4 mr-1" />
                                            {profile_user.social_profile.location}
                                        </div>
                                    )}
                                    {profile_user.social_profile?.location && profile_user.social_profile.show_location && (
                                        <div className="flex items-center">
                                            <BriefcaseIcon className="h-4 w-4 mr-1" />
                                            {profile_user.social_profile.location}
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
                                    {profile_user.created_at && (
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-1" />
                                            Joined {new Date(profile_user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                        </div>
                                    )}
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
                                        {friendshipStatus.is_friend ? (
                                            <Button variant="outline" onClick={handleRemoveFriend} disabled={loading}>
                                                <UsersIcon className="h-4 w-4 mr-2" />
                                                {loading ? "Removing..." : "Friends"}
                                            </Button>
                                        ) : friendshipStatus.has_pending_request ? (
                                            <Button variant="outline" disabled>
                                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                                Request Sent
                                            </Button>
                                        ) : (
                                            <Button onClick={handleSendFriendRequest} disabled={loading}>
                                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                                {loading ? "Sending..." : "Add Friend"}
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
                            <div className="bg-card rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">About</h3>

                                <div className="space-y-4">
                                    {profile_user.social_profile?.bio && (
                                        <div>
                                            <h4 className="text-sm font-medium text-foreground mb-1">Bio</h4>
                                            <p className="text-sm text-muted-foreground">{profile_user.social_profile.bio}</p>
                                        </div>
                                    )}

                                    {profile_user.social_profile?.location && profile_user.social_profile.show_location && (
                                        <div>
                                            <h4 className="text-sm font-medium text-foreground mb-1">Location</h4>
                                            <p className="text-sm text-muted-foreground">{profile_user.social_profile.location}</p>
                                        </div>
                                    )}

                                    {profile_user.social_profile?.website && (
                                        <div>
                                            <h4 className="text-sm font-medium text-foreground mb-1">Website</h4>
                                            <a
                                                href={profile_user.social_profile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:text-primary/80"
                                            >
                                                {profile_user.social_profile.website}
                                            </a>
                                        </div>
                                    )}

                                    {profile_user.social_profile?.birth_date && (
                                        <div>
                                            <h4 className="text-sm font-medium text-foreground mb-1">Birthday</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(profile_user.social_profile.birth_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Friends preview */}
                            <div className="bg-card rounded-lg shadow p-6 mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-foreground">Friends</h3>
                                    <Link href={`/social/profile/${profile_user.id}/friends`} className="text-sm text-primary hover:text-primary/80">
                                        See all
                                    </Link>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {friends_count} {friends_count === 1 ? "friend" : "friends"}
                                </p>
                                {friends.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {friends.slice(0, 6).map((friend) => (
                                            <Link key={friend.id} href={`/social/profile/${friend.id}`}>
                                                <div className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity">
                                                    <img
                                                        src={friend.avatar}
                                                        alt={friend.name}
                                                        className="w-full h-full object-cover"
                                                        title={friend.name}
                                                    />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No friends yet</p>
                                )}
                            </div>
                        </div>

                        {/* Main content - Posts */}
                        <div className="lg:col-span-2">
                            <div className="space-y-6">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <div key={post.id} className="bg-card rounded-lg shadow p-6">
                                            {/* Post header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <img src={profile_user.avatar} alt={profile_user.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <h3 className="font-medium text-foreground">{profile_user.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
                                                    </div>
                                                </div>
                                                <button className="text-muted-foreground hover:text-muted-foreground">
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
                                                    onClick={() => (post.is_liked_by_user ? handleUnlikePost(post.id) : handleLikePost(post.id))}
                                                    className={`flex items-center space-x-2 ${
                                                        post.is_liked_by_user ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                                >
                                                    <ThumbsUpIcon className="h-5 w-5" />
                                                    <span>{post.likes_count}</span>
                                                </button>
                                                <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                                                    <MessageCircleIcon className="h-5 w-5" />
                                                    <span>{post.comments_count}</span>
                                                </button>
                                                <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                                                    <ShareIcon className="h-5 w-5" />
                                                    <span>{post.shares_count}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-card rounded-lg shadow p-8 text-center">
                                        <p className="text-muted-foreground">No posts yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
