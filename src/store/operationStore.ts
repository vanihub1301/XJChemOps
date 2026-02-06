import { create } from 'zustand';

interface OperationState {
    remainingMinutes: number;
    isAlert: boolean;
    orderStore: any;
    batchsStore: any[];
    groupedChemicals: { time: string; chemicals: any[] }[];
    currentChemicals: any[];
    isPause: boolean;
    setOrderStore: (order: any) => void;
    setBatchsStore: (
        batchs: any[] | ((prev: any[]) => any[])
    ) => void;
    setGroupedChemicals: (groups: { time: string; chemicals: any[] }[]) => void;
    setCurrentChemicals: (chemicals: any[]) => void;
    setIsAlert: (isAlert: boolean) => void;
    setIsPause: (isPause: boolean) => void;
    setRemainingMinutes: (remainingMinutes: number) => void;
}

export const useOperationStore = create<OperationState>((set) => ({
    remainingMinutes: 0,
    isAlert: false,
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
    setIsAlert: (isAlert: boolean) => set({ isAlert }),
    setRemainingMinutes: (remainingMinutes: number) => set({ remainingMinutes }),
}));

