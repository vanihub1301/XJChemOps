import { useEffect, useRef, useCallback } from 'react';
import Sound from 'react-native-sound';
import { showToast } from '../service/toast';
import { setVolumeToMax } from '../utils/volume';

export const useAlarmSound = (
    enableSound?: boolean,
    url?: string,
    volume?: string,
    repeatCount?: string
) => {
    const soundRef = useRef<Sound | null>(null);
    const playPending = useRef(false);

    const playInternal = useCallback(async () => {
        if (!enableSound || !soundRef.current) { return; }

        await setVolumeToMax((Number(volume) / 100) || 1);

        const parsed = parseInt(repeatCount ?? '', 10);
        const loopCount = isNaN(parsed) ? 0 : Math.max(0, parsed - 1);
        soundRef.current.setNumberOfLoops(loopCount);
        soundRef.current.stop(() => {
            soundRef.current?.play((success) => {
                if (!success) {
                    showToast('Lỗi phát âm thanh');
                }
            });
        });
    }, [enableSound, repeatCount, volume]);

    useEffect(() => {
        let soundUrl = url;
        let basePath = '';

        if (!soundUrl) {
            soundUrl = 'sound.mp3';
            basePath = Sound.MAIN_BUNDLE;
        }

        playPending.current = false;

        soundRef.current = new Sound(soundUrl, basePath, (e) => {
            if (e) {
                // showToast(e.message || 'Lỗi tải âm thanh báo động');
                return;
            }
            if (soundRef.current) {
                soundRef.current.setVolume((Number(volume) / 100) || 1);

                if (playPending.current) {
                    playPending.current = false;
                    playInternal();
                }
            }
        });

        return () => {
            playPending.current = false;
            soundRef.current?.stop();
            soundRef.current?.release();
            soundRef.current = null;
        };
    }, [url, volume, playInternal]);

    const play = useCallback(async () => {
        if (!enableSound) { return; }

        if (soundRef.current && soundRef.current.isLoaded()) {
            await playInternal();
        } else if (soundRef.current) {
            playPending.current = true;
        }
    }, [enableSound, playInternal]);

    const stop = useCallback(() => {
        playPending.current = false;
        soundRef.current?.stop();
    }, []);

    return { play, stop };
};
