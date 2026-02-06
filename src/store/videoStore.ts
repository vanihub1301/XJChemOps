import { create } from 'zustand';

interface VideoState {
    videoPath: string;
    videoStatus: 'idle' | 'saved';
    markSaved: (path: string) => void;
    markIdle: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
    videoPath: '',
    videoStatus: 'idle',
    markSaved: (path: string) => set({ videoStatus: 'saved', videoPath: path }),
    markIdle: () => set({ videoStatus: 'idle', videoPath: '' }),
}));
