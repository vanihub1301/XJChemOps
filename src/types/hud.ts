export type HUDType = 'success' | 'error' | 'warning' | 'info';

export interface HUDConfig {
    id: number;
    type: HUDType;
    message: string;
    duration?: number;
    showCloseButton?: boolean;
}

export interface HUDStore {
    huds: HUDConfig[];
    showHUD: (config: Omit<HUDConfig, 'id'>) => void;
    hideHUD: (id: number) => void;
    clearAllHUDs: () => void;
}
