import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    rememberMe: boolean;
    setAuth: (user: User, accessToken: string, rememberMe: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            rememberMe: false,
            setAuth: (user, accessToken, rememberMe) => {
                localStorage.setItem('accessToken', accessToken);
                set({ user, accessToken, rememberMe });
            },
            logout: () => {
                localStorage.removeItem('accessToken');
                set({ user: null, accessToken: null, rememberMe: false });
                window.location.href = '/';
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => {
                // This is a bit tricky as createJSONStorage is called once.
                // We'll use a wrapper that chooses the storage dynamically.
                return {
                    getItem: (name) => {
                        const item = localStorage.getItem(name) || sessionStorage.getItem(name);
                        return item;
                    },
                    setItem: (name, value) => {
                        // We need to know the state of rememberMe here.
                        // But since this is a callback, we can't easily access the store state directly without 'get'
                        // However, we can just check what's in the value (JSON string)
                        try {
                            const state = JSON.parse(value).state;
                            if (state.rememberMe) {
                                localStorage.setItem(name, value);
                                sessionStorage.removeItem(name);
                            } else {
                                sessionStorage.setItem(name, value);
                                localStorage.removeItem(name);
                            }
                        } catch (e) {
                            localStorage.setItem(name, value);
                        }
                    },
                    removeItem: (name) => {
                        localStorage.removeItem(name);
                        sessionStorage.removeItem(name);
                    },
                };
            }),
        },
    ),
);
