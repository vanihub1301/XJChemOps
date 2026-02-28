import { NativeModules } from 'react-native';

const { SystemSetting } = NativeModules;

export const systemSetting = {
    getScreenTimeout: (): Promise<number> =>
        SystemSetting.getScreenTimeout(),

    setScreenTimeout: (seconds: number | 'never'): Promise<boolean> =>
        SystemSetting.setScreenTimeout(seconds === 'never' ? -1 : seconds),

    getVolume: (stream: 'music' | 'ring' | 'alarm' | 'system' = 'music') =>
        SystemSetting.getVolume(stream) as Promise<{ current: number; max: number }>,

    setVolume: (stream: 'music' | 'ring' | 'alarm' | 'system', volume: number): Promise<boolean> =>
        SystemSetting.setVolume(stream, volume),

    setMute: (stream: 'music' | 'ring' | 'alarm' | 'system', mute: boolean): Promise<boolean> =>
        SystemSetting.setMute(stream, mute),

    canWrite: (): Promise<boolean> =>
        SystemSetting.canWrite(),

    requestWritePermission: (): Promise<void> =>
        SystemSetting.requestWritePermission(),

    startPolling: (serverIp: string, port: string, intervalSeconds: number, idDrum: string): Promise<boolean> =>
        SystemSetting.startPolling(serverIp, port, intervalSeconds, idDrum),

    stopPolling: (): Promise<boolean> =>
        SystemSetting.stopPolling(),
};
