import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingState } from '../types/setting';

const mapKey: { [key: string]: string } = {
    serverIp: 'server_ip',
    port: 'port',
    inspectionTime: 'inspection_time',
    lockScreen: 'lock_screen',
    enableSound: 'enable_sound',
    language: 'language',
    idDrum: 'id_drum',
};

export const useSettingStore = create<SettingState>((set) => ({
    serverIp: '',
    port: '',
    inspectionTime: '',
    lockScreen: false,
    enableSound: false,
    language: '',
    idDrum: '',

    initializeSetting: async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem('server_ip', '192.168.10.8'),
                AsyncStorage.setItem('port', '8072'),
                AsyncStorage.setItem('inspection_time', '30'),
                AsyncStorage.setItem('lock_screen', 'true'),
                AsyncStorage.setItem('enable_sound', 'true'),
                AsyncStorage.setItem('language', 'vi'),
                AsyncStorage.setItem('id_drum', ''),
            ]);
        } catch (error) {
            console.log(error);
        }
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
            Object.entries(data).map(([key, value]) =>
                AsyncStorage.setItem(mapKey[key], value.toString())
            )
        );
    },

}));
