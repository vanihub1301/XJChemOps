import { create } from 'zustand';
import { Chemical } from '../types/drum';

interface OperationState {
    orderStore: any;
    batchsStore: Chemical[];
    groupedChemicals: { time: string; chemicals: Chemical[] }[];
    currentChemicals: Chemical[];
    currentTime: string;
    isPause: boolean;
    isProcessComplete: boolean;
    setOrderStore: (order: any) => void;
    setBatchsStore: (
        batchs: Chemical[] | ((prev: Chemical[]) => Chemical[])
    ) => void;
    setGroupedChemicals: (groups: { time: string; chemicals: Chemical[] }[]) => void;
    setCurrentChemicals: (chemicals: Chemical[]) => void;
    setCurrentTime: (currentTime: string) => void;
    setIsPause: (isPause: boolean) => void;
    setIsProcessComplete: (v: boolean) => void;
    reset: () => void;
}

export const useOperationStore = create<OperationState>((set) => ({
    orderStore: null,
    batchsStore: [],
    groupedChemicals: [],
    currentChemicals: [],
    currentTime: '',
    isPause: false,
    isProcessComplete: false,
    setOrderStore: (order: any) => set({ orderStore: order }),
    setBatchsStore: (updater) =>
        set((state) => ({
            batchsStore:
                typeof updater === 'function'
                    ? updater(state.batchsStore)
                    : updater,
        })),
    setGroupedChemicals: (groups) => set({ groupedChemicals: groups }),
    setCurrentChemicals: (chemicals) => set({ currentChemicals: chemicals }),
    setIsPause: (isPause: boolean) => set({ isPause }),
    setCurrentTime: (currentTime: string) => set({ currentTime }),
    setIsProcessComplete: (v: boolean) => set({ isProcessComplete: v }),
    reset: () => set({
        orderStore: null,
        batchsStore: [],
        groupedChemicals: [],
        currentChemicals: [],
        isPause: false,
        isProcessComplete: false,
    }),
}));

