import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingState } from '../types/setting';

const mapKey = {
    host: 'host',
    port: 'port',
    checkInterval: 'check_interval',
    keepAwake: 'keep_awake',
    soundEnabled: 'sound_enabled',
    language: 'language',
    idDrum: 'id_drum',
};

export const useSettingStore = create<SettingState>((set) => ({
    host: '',
    port: '',
    checkInterval: '',
    keepAwake: false,
    soundEnabled: false,
    language: '',
    idDrum: '',

    initializeSetting: async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem('host', '192.168.10.8'),
                AsyncStorage.setItem('port', '8072'),
            ]);
        } catch (error) {
            console.log(error);
        }
    },

    getMany: async (keys: string[]) => {
        const values = await AsyncStorage.multiGet(keys.map((key) => mapKey[key]));
        const result = {};
        keys.forEach((key) => {
            result[key] = values.find((value) => value[0] === mapKey[key])?.[1];
        });
        return result;
    },

    setData: async (key, value) => {
        set({ [key]: value });
        await AsyncStorage.setItem(mapKey[key], value.toString());
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
