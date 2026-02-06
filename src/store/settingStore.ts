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
};

export const useSettingStore = create<SettingState>((set) => ({
    host: '',
    port: '',
    checkInterval: '',
    keepAwake: false,
    soundEnabled: false,
    language: '',

    initializeSetting: async () => {
        try {
            const [host, port, checkInterval, keepAwake, soundEnabled, language] = await AsyncStorage.multiGet([
                'host',
                'port',
                'check_interval',
                'keep_awake',
                'sound_enabled',
                'language',
            ]);

            const finalHost = host[1] || '192.168.10.8';
            const finalPort = port[1] || '8072';
            const finalCheckInterval = checkInterval[1] || '30';
            const finalKeepAwake = keepAwake[1] !== 'true';
            const finalSoundEnabled = soundEnabled[1] !== 'true';
            const finalLanguage = language[1] || 'vi';

            await Promise.all([
                host[1] === null && AsyncStorage.setItem('host', finalHost),
                port[1] === null && AsyncStorage.setItem('port', finalPort),
                checkInterval[1] === null && AsyncStorage.setItem('check_interval', finalCheckInterval),
                keepAwake[1] === null && AsyncStorage.setItem('keep_awake', String(finalKeepAwake)),
                soundEnabled[1] === null && AsyncStorage.setItem('sound_enabled', String(finalSoundEnabled)),
                language[1] === null && AsyncStorage.setItem('language', finalLanguage),
            ].filter(Boolean));

            set({
                host: finalHost,
                port: finalPort,
                checkInterval: finalCheckInterval,
                keepAwake: finalKeepAwake,
                soundEnabled: finalSoundEnabled,
                language: finalLanguage,
            });
        } catch (error) {
            console.log(error);
        }
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
