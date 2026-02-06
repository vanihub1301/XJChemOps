export interface SettingState {
    host: string;
    port: string;
    checkInterval: string;
    keepAwake: boolean;
    soundEnabled: boolean;
    language: string;
    initializeSetting: () => Promise<void>;
    setData: (key: string, value: any) => Promise<void>;
    setMany: (data: any) => Promise<void>;
}
