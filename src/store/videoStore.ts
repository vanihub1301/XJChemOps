import { create } from 'zustand';

interface VideoState {
    videoPath: string;
    videoStatus: 'idle' | 'saved';
    fentryids: string[];
    markSaved: (path: string) => void;
    setVideoUploadPayload: (fentryids: string[]) => void;
    markIdle: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
    videoPath: '',
    videoStatus: 'idle',
    fentryids: [],
    markSaved: (path: string) => set({ videoStatus: 'saved', videoPath: path }),
    setVideoUploadPayload: (fentryids: string[]) => set({ fentryids }),
    markIdle: () => set({ videoStatus: 'idle', videoPath: '', fentryids: [] }),
}));
