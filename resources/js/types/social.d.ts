import { User } from "./index";

export interface SocialPost {
    id: string;
    user_id: number;
    content: string;
    media?: string[];
    visibility: "public" | "friends" | "private";
    location?: {
        name: string;
        lat: number;
        lng: number;
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user: User;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    is_liked_by_user: boolean;
    recent_likes: SocialPostLike[];
    recent_comments: SocialPostComment[];
}

export interface SocialPostLike {
    id: number;
    post_id: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    user: User;
}

export interface SocialPostComment {
    id: string;
    post_id: string;
    user_id: number;
    parent_id?: string;
    content: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user: User;
    parent?: SocialPostComment;
    replies: SocialPostComment[];
    likes_count: number;
    is_liked_by_user: boolean;
    replies_count: number;
}

export interface SocialCommentLike {
    id: number;
    comment_id: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    user: User;
}

export interface SocialPostShare {
    id: number;
    post_id: string;
    user_id: number;
    message?: string;
    created_at: string;
    updated_at: string;
    user: User;
    post: SocialPost;
}

export interface SocialFriendship {
    id: number;
    user_id: number;
    friend_id: number;
    status: "pending" | "accepted" | "blocked";
    requested_at: string;
    responded_at?: string;
    created_at: string;
    updated_at: string;
    user: User;
    friend: User;
}

export interface SocialGroup {
    id: string;
    name: string;
    description?: string;
    cover_image?: string;
    creator_id: number;
    privacy: "public" | "private" | "secret";
    is_active: boolean;
    settings?: Record<string, any>;
    created_at: string;
    updated_at: string;
    creator: User;
    members_count: number;
    user_membership?: SocialGroupMember;
    recent_posts: SocialGroupPost[];
}

export interface SocialGroupMember {
    id: number;
    group_id: string;
    user_id: number;
    role: "admin" | "moderator" | "member";
    status: "pending" | "approved" | "banned";
    joined_at: string;
    created_at: string;
    updated_at: string;
    user: User;
    group: SocialGroup;
}

export interface SocialGroupPost {
    id: string;
    group_id: string;
    user_id: number;
    content: string;
    media?: string[];
    is_pinned: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user: User;
    group: SocialGroup;
}

export interface SocialUserProfile {
    id: number;
    user_id: number;
    bio?: string;
    website?: string;
    location?: string;
    birth_date?: string;
    profile_visibility: "public" | "friends" | "private";
    interests?: string[];
    cover_photo?: string;
    social_links?: Record<string, string>;
    show_email: boolean;
    show_location: boolean;
    created_at: string;
    updated_at: string;
    user: User;
}

export interface SocialUserFollow {
    id: number;
    follower_id: number;
    following_id: number;
    created_at: string;
    updated_at: string;
    follower: User;
    following: User;
}

export interface SocialActivity {
    id: string;
    user_id: number;
    actor_id: number;
    type:
        | "post_like"
        | "post_comment"
        | "post_share"
        | "friend_request"
        | "friend_accept"
        | "group_invite"
        | "group_join"
        | "group_post"
        | "profile_follow";
    subject_type: string;
    subject_id: string;
    data?: Record<string, any>;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    user: User;
    actor: User;
    subject: SocialPost | SocialPostComment | SocialGroup | SocialFriendship;
}

// Extended User type with social features
export interface UserWithSocial extends User {
    is_private_profile: boolean;
    allow_friend_requests: boolean;
    allow_group_invites: boolean;
    last_active_at?: string;
    social_profile?: SocialUserProfile;
    friends_count: number;
    followers_count: number;
    following_count: number;
    posts_count: number;
    unread_activities_count: number;
    is_friend_with_user: boolean;
    has_pending_friend_request: boolean;
    is_following_user: boolean;
    is_followed_by_user: boolean;
}

// API response types
export interface SocialFeedResponse {
    posts: SocialPost[];
    has_more: boolean;
    next_cursor?: string;
}

export interface SocialGroupsResponse {
    groups: SocialGroup[];
    has_more: boolean;
    next_cursor?: string;
}

export interface SocialFriendsResponse {
    friends: UserWithSocial[];
    pending_requests: SocialFriendship[];
    sent_requests: SocialFriendship[];
    has_more: boolean;
    next_cursor?: string;
}

export interface SocialActivitiesResponse {
    activities: SocialActivity[];
    unread_count: number;
    has_more: boolean;
    next_cursor?: string;
}

// Form types
export interface CreatePostForm {
    content: string;
    media?: string[];
    visibility: "public" | "friends" | "private";
    location?: {
        name: string;
        lat: number;
        lng: number;
    };
}

export interface CreateCommentForm {
    content: string;
    parent_id?: string;
}

export interface CreateGroupForm {
    name: string;
    description?: string;
    privacy: "public" | "private" | "secret";
    cover_image?: File;
}

export interface UpdateProfileForm {
    bio?: string;
    website?: string;
    location?: string;
    birth_date?: string;
    profile_visibility: "public" | "friends" | "private";
    interests?: string[];
    cover_photo?: File;
    social_links?: Record<string, string>;
    show_email: boolean;
    show_location: boolean;
}

// Page props types
export interface SocialFeedPageProps {
    posts: SocialPost[];
    user_profile: SocialUserProfile;
    suggested_friends: UserWithSocial[];
    trending_groups: SocialGroup[];
    has_more: boolean;
    next_cursor?: string;
}

export interface SocialProfilePageProps {
    profile_user: UserWithSocial;
    posts: SocialPost[];
    mutual_friends: UserWithSocial[];
    has_more: boolean;
    next_cursor?: string;
}

export interface SocialGroupPageProps {
    group: SocialGroup;
    posts: SocialGroupPost[];
    members: SocialGroupMember[];
    has_more: boolean;
    next_cursor?: string;
}

export interface SocialGroupsIndexPageProps {
    my_groups: SocialGroup[];
    suggested_groups: SocialGroup[];
    popular_groups: SocialGroup[];
}

export interface SocialFriendsPageProps {
    friends: UserWithSocial[];
    pending_requests: SocialFriendship[];
    sent_requests: SocialFriendship[];
    suggested_friends: UserWithSocial[];
}
