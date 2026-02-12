import { useEffect, useRef } from 'react';
import Sound from 'react-native-sound';
import { showToast } from '../service/toast';
import { setVolumeToMax } from '../utils/volume';

export const useAlarmSound = (enableSound?: boolean) => {
    const soundRef = useRef<Sound | null>(null);

    useEffect(() => {
        soundRef.current = new Sound('alert.mp3', Sound.MAIN_BUNDLE, (e) => {
            if (e) { showToast(e); }
        });

        return () => {
            soundRef.current?.release();
            soundRef.current = null;
        };
    }, []);

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
