import api from './api';
import * as SecureStore from 'expo-secure-store';

interface LoginResponse {
    success: boolean;
    data: {
        user: User;
        access_token: string;
        expires_at: string;
    };
}

interface User {
    id: string;
    fullname: string;
    email: string;
    profile_picture?: string;
    favorite_city_id?: string;
    role: string;
}

// Login
export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password });

    if (response.data.success) {
        // Store token securely
        await SecureStore.setItemAsync('access_token', response.data.data.access_token);
    }

    return response.data;
};

// Register
export const register = async (data: {
    fullname: string;
    email: string;
    password: string;
    password_confirmation: string;
    favorite_city_id: string;
}): Promise<LoginResponse> => {
    const response = await api.post('/users', data);

    if (response.data.success && response.data.data.access_token) {
        await SecureStore.setItemAsync('access_token', response.data.data.access_token);
    }

    return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/logout');
    } finally {
        await SecureStore.deleteItemAsync('access_token');
    }
};

// Logout from all devices
export const logoutAll = async (): Promise<void> => {
    try {
        await api.post('/auth/logout-all');
    } finally {
        await SecureStore.deleteItemAsync('access_token');
    }
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data.data;
};

// Request password reset
export const forgotPassword = async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
};

// Reset password with token
export const resetPassword = async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<void> => {
    await api.post('/auth/reset-password', data);
};

// Social login (Google/Apple)
export const socialLogin = async (provider: 'google' | 'apple', token: string): Promise<LoginResponse> => {
    const response = await api.post(`/auth/social/${provider}`, { token });

    if (response.data.success) {
        await SecureStore.setItemAsync('access_token', response.data.data.access_token);
    }

    return response.data;
};

// Request magic link
export const requestMagicLink = async (email: string): Promise<void> => {
    await api.post('/auth/magic-link', { email });
};

// Get active sessions
export const getSessions = async () => {
    const response = await api.get('/auth/sessions');
    return response.data.data;
};

// Revoke specific session
export const revokeSession = async (sessionId: string): Promise<void> => {
    await api.delete(`/auth/sessions/${sessionId}`);
};
