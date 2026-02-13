import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState } from '../types/auth';

export const useAuthStore = create<AuthState>((set) => ({
    fullName: '',
    isLoading: true,
    firstRunning: false,
    rotatingTank: {},
    isSignedIn: false,
    timeLogin: '',

    initialize: async () => {
        set({ isLoading: true });
        try {
            const [fullName, firstRunning, rotatingTank, isSignedIn] = await AsyncStorage.multiGet([
                'full_name',
                'first_running',
                'rotating_tank',
                'is_signed_in',
            ]);

            if (!firstRunning[1]) {
                set({ firstRunning: true });
            }

            set({
                fullName: fullName[1] || '',
                rotatingTank: { name: rotatingTank[1] },
                // isSignedIn: isSignedIn[1] === 'true'
            });
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            set({ isLoading: false });
        }
    },

    setLoading: async ({ isLoading }) => {
        set({ isLoading: isLoading });
    },

    setAuth: async ({ isSignedIn }) => {
        await AsyncStorage.setItem('is_signed_in', isSignedIn.toString());
        set({
            isSignedIn: isSignedIn,
            isLoading: false,
        });
    },

    setTimeLogin: async ({ timeLogin }) => {
        set({ timeLogin: timeLogin });
        await AsyncStorage.setItem('time_login', timeLogin);
    },

    setName: async ({ fullName }) => {
        set({ fullName: fullName });
        await AsyncStorage.setItem('full_name', fullName);
    },

    setRotatingTank: async ({ rotatingTank }) => {
        await Promise.all([
            AsyncStorage.setItem('rotating_tank', rotatingTank.name),
            AsyncStorage.setItem('first_running', 'false'),
        ]);

        set({
            rotatingTank: rotatingTank,
            firstRunning: false,
        });
    },

    logout: async () => {
        await AsyncStorage.setItem('is_signed_in', 'false');
        set({
            isSignedIn: false,
            isLoading: false,
        });
    },
}));
