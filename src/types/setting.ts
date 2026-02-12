export interface SettingState {
    serverIp: string;
    port: string;
    inspectionTime: string;
    lockScreen: boolean;
    enableSound: boolean;
    language: string;
    idDrum: string;
    drumno: string;
    initializeSetting: () => Promise<void>;
    setMany: (data: any) => Promise<void>;
    getMany: (keys: string[]) => Promise<any>;
}
