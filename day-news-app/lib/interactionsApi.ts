import api from './api';

// Like/react to article
export const likeArticle = async (articleId: string): Promise<void> => {
    await api.post(`/posts/${articleId}/like`);
};

// Unlike article
export const unlikeArticle = async (articleId: string): Promise<void> => {
    await api.delete(`/posts/${articleId}/like`);
};

// Save article
export const saveArticle = async (articleId: string): Promise<void> => {
    await api.post(`/posts/${articleId}/save`);
};

// Unsave article
export const unsaveArticle = async (articleId: string): Promise<void> => {
    await api.delete(`/posts/${articleId}/save`);
};

// Share article (track share)
export const shareArticle = async (articleId: string): Promise<void> => {
    await api.post(`/posts/${articleId}/share`);
};

// React with emoji
export const reactToArticle = async (
    articleId: string,
    reaction: 'like' | 'love' | 'wow'
): Promise<void> => {
    await api.post(`/posts/${articleId}/react`, { reaction });
};
