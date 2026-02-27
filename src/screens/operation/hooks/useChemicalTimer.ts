import { useState, useRef, useEffect } from 'react';
import { parseDateTime } from '../../../utils/dateTime';
import { Chemical } from '../../../types/drum';
import { useOperationStore } from '../../../store/operationStore';
import { useSettingStore } from '../../../store/settingStore';
import { useAlarmSound } from '../../../hooks/useAlarmSound';
import { MainNavigationProps } from '../../../types/navigation';

export const useChemicalTimer = (navigation: MainNavigationProps<'Operation'>['navigation'], isFocus: boolean) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [alertedTimes, setAlertedTimes] = useState<Set<string>>(new Set());
    const [upcomingChemicals, setUpcomingChemicals] = useState<Chemical[]>([]);

    const { enableSound, sound, volume, repeatCount } = useSettingStore();
    const { play, stop } = useAlarmSound(enableSound, sound, volume, repeatCount);
    const { currentTime, groupedChemicals, currentChemicals, isPause } = useOperationStore();

    const lastServerTimeRef = useRef<{ serverMs: number; localTick: number } | null>(null);
    const upcomingVideoStopMsRef = useRef<number>(0);
    const alertedTimesRef = useRef(alertedTimes);
    const isPauseRef = useRef(isPause);
    const groupedChemicalsRef = useRef(groupedChemicals);
    const initRef = useRef(true);
    const isFocusRef = useRef(isFocus);

    useEffect(() => { alertedTimesRef.current = alertedTimes; }, [alertedTimes]);
    useEffect(() => {
        isPauseRef.current = isPause;
        if (isPause) {
            setAlertedTimes(new Set());
        }
    }, [isPause]);
    useEffect(() => { groupedChemicalsRef.current = groupedChemicals; }, [groupedChemicals]);
    useEffect(() => { isFocusRef.current = isFocus; }, [isFocus]);

    useEffect(() => {
        if (currentTime) {
            lastServerTimeRef.current = {
                serverMs: parseDateTime(currentTime),
                localTick: Date.now(),
            };
        }
    }, [currentTime]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!lastServerTimeRef.current || groupedChemicalsRef.current.length === 0 || isPauseRef.current || !isFocusRef.current) {
                return;
            }

            const elapsedMs = Date.now() - lastServerTimeRef.current.localTick;
            const estimatedServerNowMs = lastServerTimeRef.current.serverMs + elapsedMs;

            for (const group of groupedChemicalsRef.current) {
                if (alertedTimesRef.current.has(group.time)) {
                    continue;
                }

                const isRecorded = group?.chemicals?.some(c => c.videoFk);
                if (isRecorded) {
                    continue;
                }

                console.log('LOG : useChemicalTimer : currentTime:', currentTime)
                const confirmTimeMs = parseDateTime(group.time);
                console.log('LOG : useChemicalTimer : confirmTimeMs:', group.time)
                const secondsUntilConfirm = Math.floor((confirmTimeMs - estimatedServerNowMs) / 1000);
                console.log('LOG : useChemicalTimer : secondsUntilConfirm:', secondsUntilConfirm)

                const allGroups = groupedChemicalsRef.current;
                const idx = allGroups.findIndex((g: any) => g.time === group.time);
                const nextGrp = allGroups[idx + 1];
                let stopMs = 0;

                if (nextGrp) {
                    const limitMs = parseDateTime(nextGrp.time) - 30 * 1000;
                    stopMs = Math.max(confirmTimeMs + 30 * 1000, limitMs);
                } else {
                    const operateMin = Math.max(1, group.chemicals[0]?.operateTime ?? 1);
                    stopMs = confirmTimeMs + operateMin * 60 * 1000 - 30 * 1000;
                }

                const finalStopMs = stopMs;
                console.log('LOG : useChemicalTimer : finalStopMs:', new Date(finalStopMs))
                const isWithinOperationWindow = estimatedServerNowMs < finalStopMs;
                console.log('LOG : useChemicalTimer : isWithinOperationWindow:', isWithinOperationWindow)

                if (secondsUntilConfirm <= 10 && isWithinOperationWindow) {
                    setUpcomingChemicals(group.chemicals);
                    upcomingVideoStopMsRef.current = finalStopMs;

                    setModalVisible(true);
                    play();
                    setAlertedTimes(prev => new Set(prev).add(group.time));
                    initRef.current = false;
                }

                if (isWithinOperationWindow) {
                    break;
                }
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const isRecorded = currentChemicals?.some(c => c.videoFk);

        if (initRef.current && groupedChemicals && groupedChemicals.length > 0 && currentChemicals.length > 0 && !isRecorded && !isPauseRef.current) {
            setUpcomingChemicals(currentChemicals);

            const firstTime = currentChemicals[0].confirmTime;
            const idx = groupedChemicals.findIndex((g: any) => g.time === firstTime);
            const nextGrp = groupedChemicals[idx + 1];
            const confirmMs = parseDateTime(firstTime);
            let stopMs = 0;
            if (nextGrp) {
                const limitMs = parseDateTime(nextGrp.time) - 30 * 1000;
                stopMs = Math.max(confirmMs + 30 * 1000, limitMs);
            } else {
                const operateMin = Math.max(1, currentChemicals[0]?.operateTime ?? 1);
                stopMs = confirmMs + operateMin * 60 * 1000 - 30 * 1000;
            }
            upcomingVideoStopMsRef.current = stopMs;

            setModalVisible(true);
            play();
            setAlertedTimes(prev => new Set(prev).add(currentChemicals[0].confirmTime));
            initRef.current = false;
        }
    }, [groupedChemicals, currentChemicals]);

    const handleModalRecord = () => {
        setModalVisible(false);
        stop();

        const estimatedServerNowMs = lastServerTimeRef.current
            ? lastServerTimeRef.current.serverMs + (Date.now() - lastServerTimeRef.current.localTick)
            : Date.now();

        const remainingSecs = Math.max(0, Math.floor((upcomingVideoStopMsRef.current - estimatedServerNowMs) / 1000));
        console.log('LOG : handleModalRecord : stopMs:', upcomingVideoStopMsRef.current, 'estimatedNow:', estimatedServerNowMs, 'remaining:', remainingSecs);
        navigation.navigate('Video', {
            autoRecord: true,
            chemicals: upcomingChemicals,
            videoDurationSeconds: remainingSecs,
        });
    };

    const handleModalDismiss = () => {
        setModalVisible(false);
        stop();
    };

    return {
        modalVisible,
        upcomingChemicals,
        handleModalRecord,
        handleModalDismiss,
    };
};
