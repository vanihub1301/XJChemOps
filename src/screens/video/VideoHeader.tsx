import React, { useEffect, useRef } from 'react';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { formatTime } from '../../utils/dateTime';

interface VideoHeaderProps {
    status: string;
}
const VideoHeader = ({ status }: VideoHeaderProps) => {
    const [recordingTime, setRecordingTime] = React.useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'recording') {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <ViewBox className="absolute top-12 left-7">
            <ViewBox gap={'xs'} background="blurBlack" padding="sm" radius="full" className="flex-row items-center px-4">
                <ViewBox
                    className={`w-2 h-2 ${status === 'paused' ? 'bg-yellow-500' : 'bg-red-800'}`}
                    radius="full"
                />
                <Text variant={'labelSmall'} color={'white'}>
                    REC  {formatTime(recordingTime)}
                </Text>
            </ViewBox>
        </ViewBox>
    );
};

export default React.memo(VideoHeader);
