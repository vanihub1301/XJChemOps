import { useState, useRef, useEffect } from 'react';
import RNFS from 'react-native-fs';
import { MIN_FREE_SPACE_STOP } from '../../../constants/ui';
import { showToast } from '../../../service/toast';

export const useVideoTimer = (
    isRecording: boolean,
    forceStopRecord: () => void,
    maxDurationConfig?: number,
    paramVideoDurationSeconds?: number
) => {
    const [recordingTime, setRecordingTime] = useState(0);
    const startTimeRef = useRef<number>(Date.now());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const id = setInterval(async () => {
            const fs = await RNFS.getFSInfo();
            if (fs.freeSpace < MIN_FREE_SPACE_STOP) {
                forceStopRecord();
                showToast('Không đủ dung lượng bộ nhớ');
            }
        }, 30_000);

        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (!isRecording) return;
        console.log('LOG : useVideoTimer : paramVideoDurationSeconds:', paramVideoDurationSeconds)

        let durationMs = (maxDurationConfig ?? 5) * 60 * 1000;
        if (paramVideoDurationSeconds !== undefined) {
            durationMs = Math.max(10, paramVideoDurationSeconds) * 1000;
        }

        const timer = setTimeout(() => {
            forceStopRecord();
        }, durationMs);

        return () => clearTimeout(timer);
    }, [isRecording]);

    useEffect(() => {
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setRecordingTime(elapsed);
        }, 500);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    return {
        recordingTime,
    };
};
