import { create } from 'zustand';
import { HUDStore } from '../types/hud';

export const useHUDStore = create<HUDStore>((set) => ({
    huds: [],

    showHUD: (config) => {
        const id = Date.now();
        set((state) => ({
            huds: state.huds.concat({ ...config, id }),
        }));
    },

    hideHUD: (id) => {
        set((state) => ({
            huds: state.huds.filter((hud) => hud.id !== id),
        }));
    },

    clearAllHUDs: () => {
        set({ huds: [] });
    },
}));
