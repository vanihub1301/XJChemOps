import { useState, useRef, useEffect } from 'react';

export const useVideoTimer = (
    isRecording: boolean,
    stopRecord: () => void,
    maxDurationConfig?: number,
    paramVideoDurationSeconds?: number
) => {
    const [recordingTime, setRecordingTime] = useState(0);
    const startTimeRef = useRef<number>(Date.now());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isRecording) { return; }
        console.log('LOG : useVideoTimer : paramVideoDurationSeconds:', paramVideoDurationSeconds)

        let durationMs = (maxDurationConfig ?? 300) * 1000;

        if (paramVideoDurationSeconds !== undefined) {
            durationMs = Math.min(
                durationMs,
                paramVideoDurationSeconds * 1000
            );
        }

        const timer = setTimeout(() => {
            stopRecord();
        }, durationMs);

        return () => clearTimeout(timer);
    }, [isRecording, stopRecord, paramVideoDurationSeconds]);

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
