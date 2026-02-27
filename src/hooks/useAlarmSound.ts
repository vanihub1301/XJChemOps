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

    const loopRemaining = useRef(0);

    const playInternal = useCallback(async () => {
        if (!enableSound || !soundRef.current) { return; }

        await setVolumeToMax((Number(volume) / 100) || 1);

        soundRef.current.setNumberOfLoops(0);
        soundRef.current.stop(() => {
            soundRef.current?.play((success) => {
                if (!success) {
                    showToast('Lỗi phát âm thanh');
                } else if (loopRemaining.current > 0) {
                    loopRemaining.current -= 1;
                    playInternal();
                }
            });
        });
    }, [enableSound, volume]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, playInternal]);

    useEffect(() => {
        const updateVolume = async () => {
            const volValue = (Number(volume) / 100) || 1;
            if (soundRef.current && soundRef.current.isLoaded()) {
                soundRef.current.setVolume(volValue);
            }
            if (soundRef.current?.isPlaying?.() || loopRemaining.current > 0) {
                await setVolumeToMax(volValue);
            }
        };
        updateVolume();
    }, [volume]);

    const play = useCallback(async () => {
        if (!enableSound) { return; }

        const parsed = parseInt(repeatCount ?? '', 10);
        loopRemaining.current = isNaN(parsed) ? 0 : Math.max(0, parsed - 1);

        if (soundRef.current && soundRef.current.isLoaded()) {
            await playInternal();
        } else if (soundRef.current) {
            playPending.current = true;
        }
    }, [enableSound, playInternal, repeatCount]);

    const stop = useCallback(() => {
        playPending.current = false;
        soundRef.current?.stop();
    }, []);

    return { play, stop };
};
