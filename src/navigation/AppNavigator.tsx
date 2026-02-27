import React, { useEffect, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AppRoutes } from '../types/navigation';
import { AuthenticationNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuthStore } from '../store/authStore';
import { useSettingStore } from '../store/settingStore';
import { useAPI } from '../service/api';
import { Chemical, Config } from '../types/drum';
import { parseDateTime } from '../utils/dateTime';
import { showToast } from '../service/toast';
import { useOperationStore } from '../store/operationStore';
import { SplashScreen } from '../components/app/SplashScreen';
import { unstable_batchedUpdates } from 'react-native';

const AppStack = createStackNavigator<AppRoutes>();

export const AppNavigator: React.FC = () => {
    const { orderStore, groupedChemicals, setMany: setManyOperation, reset, setCurrentTime, setIsProcessComplete, setBatchsStore, setOrderStore } = useOperationStore();
    const { rotatingTank, isLoading, setLoading } = useAuthStore();
    const { setMany: setManySetting, getMany, inspectionTime } = useSettingStore();
    const { getData } = useAPI();

    const currentIntervalTimeRef = useRef<number>(30000);
    const hasLoadedRef = useRef<boolean>(false);
    const groupedChemicalsRef = useRef(groupedChemicals);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        let isActive = true;

        const finishInitialLoading = () => {
            if (!hasLoadedRef.current) {
                hasLoadedRef.current = true;
                setTimeout(() => {
                    setLoading({ isLoading: false });
                }, 2000);
            }
        };

        const fetchRunningData = async () => {
            if (!isActive) { return; }
            let config: Config | undefined;
            try {
                const settings = await getMany(['serverIp', 'port', 'inspectionTime']);
                const res = await getData('portal/inject/getRunning', { drumNo: orderStore?.process?.drumNo || rotatingTank.name }, true, settings.serverIp + ':' + settings.port);
                console.log('LOG : fetchRunningData : res:', res);
                config = { ...res.data?.config, currentTime: res.data?.curentTime };

                if (res.code === 0 && res.data?.process?.dtl) {
                    const { dtl, ...processWithoutDtl } = res.data.process;
                    const appInjectPause = res.data?.appInjectPause;

                    const groupedByTime: { [key: string]: Chemical[] } = {};
                    dtl.forEach((chemical: Chemical) => {
                        const confirmTime = chemical.confirmTime;
                        if (!groupedByTime[confirmTime]) {
                            groupedByTime[confirmTime] = [];
                        }
                        groupedByTime[confirmTime].push(chemical);
                    });

                    const grouped = Object.keys(groupedByTime)
                        .sort()
                        .map(time => ({
                            time,
                            chemicals: groupedByTime[time],
                        }));
                    groupedChemicalsRef.current = grouped;
                    const currentTime = parseDateTime(res.data?.curentTime);

                    const currentGroupIndex = grouped.findIndex((group, index) => {
                        const startTime = parseDateTime(group.time);
                        const endTime = grouped[index + 1]
                            ? parseDateTime(grouped[index + 1].time)
                            : Infinity;

                        return currentTime >= startTime && currentTime < endTime;
                    });

                    const currentGroup = currentGroupIndex !== -1 ? grouped[currentGroupIndex] : undefined;

                    console.log('LOG : Operation : currentGroup:', currentGroup);
                    console.log('LOG : Operation : grouped:', grouped);

                    setManyOperation({
                        isProcessComplete: false,
                        orderStore: {
                            process: processWithoutDtl,
                            currentTime: res.data?.curentTime,
                            config: config,
                            appInjectPause: appInjectPause,
                        },
                        batchsStore: dtl,
                        isPause: appInjectPause?.pauseTime && !appInjectPause?.continueTime,
                        groupedChemicals: grouped,
                        currentChemicals: currentGroup?.chemicals || [],
                    });
                }
                if (res.code === 0 && !res.data?.process?.dtl && (groupedChemicalsRef.current.length > 0)) {
                    const currentTime = parseDateTime(res.data?.curentTime);
                    console.log('LOG : fetchRunningData : currentTime:', currentTime)
                    const groups = groupedChemicalsRef.current;
                    const lastGroup = groups[groups.length - 1];
                    console.log('LOG : fetchRunningData : lastGroup:', lastGroup)
                    const lastGroupStartMs = parseDateTime(lastGroup.time);
                    const operateMin = lastGroup.chemicals.find((c: Chemical) => c.operateTime != null)?.operateTime ?? 1;
                    const finishMs = lastGroupStartMs + operateMin * 60_000;
                    console.log('LOG : fetchRunningData : lastGroupStartMs:', lastGroupStartMs, 'finishMs:', finishMs, 'currentTime:', currentTime);
                    if ((finishMs > currentTime) && (currentTime >= lastGroupStartMs)) {
                        setManyOperation({
                            currentChemicals: lastGroup?.chemicals || [],
                            isLastGroupUploaded: true,
                        });
                    }
                    if (finishMs <= currentTime) {
                        setIsProcessComplete(true);
                        groupedChemicalsRef.current = [];
                    } else if (currentTime < lastGroupStartMs) {
                        console.log('LOG : fetchRunningData : reset');
                        reset();
                        groupedChemicalsRef.current = [];
                    }
                }
                if (res.code === -1) {
                    showToast(res.msg);
                }
            } catch (error: any) {
                showToast(error.message);
            } finally {
                console.log('LOG : fetchRunningData : config:', config);
                let finalSound = config?.sound;
                if (finalSound && finalSound.startsWith('/')) {
                    const baseIp = (config?.serverIp || '').includes('http') ? config?.serverIp : `http://${config?.serverIp}`;
                    finalSound = `${baseIp}:${config?.port}${finalSound}`;
                }

                unstable_batchedUpdates(() => {
                    setCurrentTime(config?.currentTime || '');
                    setManySetting({
                        serverIp: config?.serverIp,
                        port: config?.port,
                        inspectionTime: config?.inspectionTime,
                        idDrum: config?.id,
                        lockScreen: config?.lockScreen,
                        enableSound: config?.enableSound,
                        drumno: config?.drumno,
                        language: config?.language,
                        sound: finalSound,
                        volume: config?.volume,
                        maxTimeRecord: config?.maxTimeRecord,
                        repeatCount: config?.repeatCount,
                    });
                });

                const newIntervalMs = (config?.inspectionTime || 30) * 1000;
                if (newIntervalMs !== currentIntervalTimeRef.current) {
                    currentIntervalTimeRef.current = newIntervalMs;
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    }
                }
                finishInitialLoading();
            }

            if (isActive) {
                timeoutId = setTimeout(fetchRunningData, currentIntervalTimeRef.current);
            }
        };

        const init = async () => {
            try {
                const settings = await getMany(['inspectionTime']);
                const intervalMs = (parseInt(settings?.inspectionTime, 10) || 30) * 1000;
                currentIntervalTimeRef.current = intervalMs;

                await fetchRunningData();
            } catch (error: any) {
                showToast(error.message);
                finishInitialLoading();
            }
        };

        init();

        return () => {
            isActive = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [rotatingTank.name, getData, setBatchsStore, setOrderStore, reset, setManySetting, setManyOperation, getMany, inspectionTime]);

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <AppStack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={(groupedChemicals.length > 0) ? 'Main' : 'Authentication'}
        >
            <AppStack.Screen name="Main" component={MainNavigator} />
            <AppStack.Screen name="Authentication" component={AuthenticationNavigator} />
        </AppStack.Navigator>
    );
};
