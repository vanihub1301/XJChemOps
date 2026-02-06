import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState } from '../types/auth';

export const useAuthStore = create<AuthState>((set) => ({
    fullName: null,
    isLoading: true,
    firstRunning: false,
    rotatingTank: {},
    isSignedIn: false,

    initialize: async () => {
        set({ isLoading: true });
        try {
            const [firstRunning, rotatingTank] = await AsyncStorage.multiGet([
                'first_running',
                'rotating_tank',
            ]);

            if (!firstRunning[1]) {
                set({ firstRunning: true });
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            set({ isLoading: false, rotatingTank: { name: rotatingTank[1] } });
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            set({ isLoading: false });
        }
    },

    setAuth: async ({ isSignedIn }) => {
        set({
            isSignedIn: isSignedIn,
            isLoading: false,
        });
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
        set({
            isSignedIn: false,
            isLoading: false,
        });
    },
}));
