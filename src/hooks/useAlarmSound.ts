import { useEffect, useRef } from 'react';
import Sound from 'react-native-sound';
import { showToast } from '../service/toast';
import { setVolumeToMax } from '../utils/volume';

export const useAlarmSound = (enableSound?: boolean, url?: string) => {
    const soundRef = useRef<Sound | null>(null);

    useEffect(() => {
        if (!url) return;

        soundRef.current = new Sound(url, '', (e) => {
            if (e) {
                showToast(e.message || 'Lỗi tải âm thanh báo động');
            }
        });

        return () => {
            soundRef.current?.release();
            soundRef.current = null;
        };
    }, [url]);

    const play = async () => {
        if (enableSound) {
            await setVolumeToMax();
            soundRef.current?.stop(() => {
                soundRef.current?.play();
            });
        }
    };

    const stop = () => {
        soundRef.current?.stop();
    };

    return { play, stop };
};
