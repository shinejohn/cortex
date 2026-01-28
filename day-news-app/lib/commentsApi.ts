import api from './api';

interface Comment {
    id: string;
    content: string;
    parent_id: string;
    parent_type: 'news' | 'announcement' | 'listing';
    created_by: string;
    user?: {
        id: string;
        fullname: string;
        profile_picture?: string;
    };
    likes: number;
    replies?: Comment[];
    created_at: string;
    updated_at: string;
}

// Get comments for an article
export const getComments = async (
    articleId: string,
    page = 1,
    perPage = 20
): Promise<{ data: Comment[]; meta: any }> => {
    const response = await api.get(`/posts/${articleId}/comments`, {
        params: { page, per_page: perPage },
    });
    return response.data;
};

// Add comment
export const addComment = async (
    articleId: string,
    content: string,
    parentCommentId?: string
): Promise<Comment> => {
    const response = await api.post(`/posts/${articleId}/comments`, {
        content,
        parent_comment_id: parentCommentId,
    });
    return response.data.data;
};

// Delete comment
export const deleteComment = async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
};

// Like comment
export const likeComment = async (commentId: string): Promise<void> => {
    await api.post(`/comments/${commentId}/like`);
};

// Report comment
export const reportComment = async (
    commentId: string,
    reason: string
): Promise<void> => {
    await api.post(`/comments/${commentId}/report`, { reason });
};
