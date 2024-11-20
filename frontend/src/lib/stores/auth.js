import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Initialize the store with data from localStorage if available
const storedUser = browser ? localStorage.getItem('user') : null;
export const user = writable(storedUser ? JSON.parse(storedUser) : null);

export const auth = {
    login: (userData) => {
        user.set(userData);
        if (browser) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    },

    logout: () => {
        user.set(null);
        if (browser) {
            localStorage.removeItem('user');
        }
        window.location.href = '/login';
    },

    init: () => {
        if (browser) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                user.set(JSON.parse(storedUser));
            }
        }
    }
};