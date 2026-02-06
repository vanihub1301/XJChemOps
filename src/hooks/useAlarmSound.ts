import { useEffect, useRef } from 'react';
import Sound from 'react-native-sound';
import { showToast } from '../service/toast';

export const useAlarmSound = () => {
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

    const play = () => {
        soundRef.current?.stop(() => {
            soundRef.current?.play();
        });
    };

    return { play };
};
