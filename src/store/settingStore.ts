import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SettingState {
    serverIp: string;
    port: string;
    inspectionTime: string;
    lockScreen: boolean;
    enableSound: boolean;
    language: string;
    idDrum: string;
    drumno: string;
    sound: string;
    volume: string;
    maxTimeRecord: string;
    repeatCount: string;
    initializeSetting: () => Promise<void>;
    setMany: (data: any) => Promise<void>;
    getMany: (keys: string[]) => Promise<any>;
}

const mapKey: { [key: string]: string } = {
    serverIp: 'server_ip',
    port: 'port',
    inspectionTime: 'inspection_time',
    lockScreen: 'lock_screen',
    enableSound: 'enable_sound',
    language: 'language',
    idDrum: 'id_drum',
    drumno: 'drumno',
    sound: 'sound',
    volume: 'volume',
    maxTimeRecord: 'max_time_record',
    repeatCount: 'repeat_count',
};

export const useSettingStore = create<SettingState>((set) => ({
    serverIp: '',
    port: '',
    inspectionTime: '',
    lockScreen: false,
    enableSound: false,
    language: '',
    idDrum: '',
    drumno: '',
    sound: '',
    volume: '',
    maxTimeRecord: '',
    repeatCount: '',

    initializeSetting: async () => {
        await Promise.all([
            AsyncStorage.setItem('server_ip', '192.168.10.8'),
            AsyncStorage.setItem('port', '8072'),
            AsyncStorage.setItem('inspection_time', '30'),
            AsyncStorage.setItem('lock_screen', 'true'),
            AsyncStorage.setItem('enable_sound', 'true'),
            AsyncStorage.setItem('language', 'vi'),
            AsyncStorage.setItem('id_drum', ''),
            AsyncStorage.setItem('drumno', ''),
            AsyncStorage.setItem('sound', ''),
            AsyncStorage.setItem('volume', ''),
            AsyncStorage.setItem('max_time_record', ''),
            AsyncStorage.setItem('repeat_count', ''),
        ]);
    },

    getMany: async (keys: string[]) => {
        const values = await AsyncStorage.multiGet(keys.map((key) => mapKey[key]));
        const result: any = {};
        keys.forEach((key) => {
            result[key] = values.find((value) => value[0] === mapKey[key])?.[1];
        });
        return result;
    },

    setMany: async (data) => {
        set(data);
        await Promise.all(
            Object.entries(data)
                .filter(([key]) => mapKey[key])
                .map(([key, value]: [string, any]) =>
                    AsyncStorage.setItem(mapKey[key], value != null ? String(value) : '')
                )
        );
    },
}));
