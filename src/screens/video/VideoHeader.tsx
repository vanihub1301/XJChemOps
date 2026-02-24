import React, { useEffect, useRef } from 'react';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { formatTime } from '../../utils/dateTime';

const VideoHeader = () => {
    const [recordingTime, setRecordingTime] = React.useState(0);
    const startTimeRef = useRef<number>(Date.now());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    return (
        <ViewBox className="absolute top-12 left-7">
            <ViewBox gap={'xs'} background="blurBlack" padding="sm" radius="full" className="flex-row items-center px-4">
                <ViewBox className="w-2 h-2 bg-red-800" radius="full" />
                <Text variant={'labelSmall'} color={'white'}>
                    REC  {formatTime(recordingTime)}
                </Text>
            </ViewBox>
        </ViewBox>
    );
};

export default React.memo(VideoHeader);
