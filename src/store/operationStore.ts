import { create } from 'zustand';
import { Chemical } from '../types/drum';

interface OperationState {
    remainingMinutes: number;
    orderStore: any;
    batchsStore: Chemical[];
    groupedChemicals: { time: string; chemicals: Chemical[] }[];
    currentChemicals: Chemical[];
    isPause: boolean;
    setOrderStore: (order: any) => void;
    setBatchsStore: (
        batchs: Chemical[] | ((prev: Chemical[]) => Chemical[])
    ) => void;
    setGroupedChemicals: (groups: { time: string; chemicals: Chemical[] }[]) => void;
    setCurrentChemicals: (chemicals: Chemical[]) => void;
    setIsPause: (isPause: boolean) => void;
    setRemainingMinutes: (remainingMinutes: number) => void;
    reset: () => void;
}

export const useOperationStore = create<OperationState>((set) => ({
    remainingMinutes: 0,
    orderStore: null,
    batchsStore: [],
    groupedChemicals: [],
    currentChemicals: [],
    isPause: false,
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
    setRemainingMinutes: (remainingMinutes: number) => set({ remainingMinutes }),
    reset: () => set({
        remainingMinutes: 0,
        orderStore: null,
        batchsStore: [],
        groupedChemicals: [],
        currentChemicals: [],
        isPause: false,
    }),
}));

