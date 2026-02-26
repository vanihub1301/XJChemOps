import { useEffect, useRef } from 'react';
import Sound from 'react-native-sound';
import { showToast } from '../service/toast';
import { setVolumeToMax } from '../utils/volume';

export const useAlarmSound = (enableSound?: boolean, url?: string) => {
    const soundRef = useRef<Sound | null>(null);

    useEffect(() => {
        let soundUrl = url;
        let basePath = '';

        if (!soundUrl) {
            soundUrl = 'alert2.mp3';
            basePath = Sound.MAIN_BUNDLE;
        }

        soundRef.current = new Sound(soundUrl, basePath, (e) => {
            if (e) {
                showToast(e.message || 'Lỗi tải âm thanh báo động');
            }
            if (soundRef.current) {
                soundRef.current.setVolume(1);
            }
        });

        return () => {
            if (soundRef.current) {
                soundRef.current.release();
                soundRef.current = null;
            }
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
