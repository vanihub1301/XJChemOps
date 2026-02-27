import { VolumeManager } from 'react-native-volume-manager';
import { showToast } from '../service/toast';

export const setVolumeToMax = async (volume: number): Promise<void> => {
    try {
        await VolumeManager.setVolume(volume, { type: 'music' });
    } catch (error: any) {
        showToast(error.message);
    }
};

export const getCurrentVolume = async (): Promise<number> => {
    try {
        const { volume } = await VolumeManager.getVolume();
        return volume;
    } catch (error) {
        return 0.5;
    }
};
