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

interface AppNavigatorProps {
    isSignedIn: boolean;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ isSignedIn }) => {
    const { orderStore, batchsStore, groupedChemicals, setMany: setManyOperation, reset, setCurrentTime, setIsProcessComplete, setBatchsStore, setOrderStore, setGroupedChemicals, setCurrentChemicals, setIsPause } = useOperationStore();
    const { rotatingTank, isLoading, setLoading } = useAuthStore();
    const { setMany: setManySetting, getMany, inspectionTime } = useSettingStore();
    const { getData } = useAPI();

    const currentIntervalTimeRef = useRef<number>(30000);
    const hasLoadedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!batchsStore || batchsStore.length === 0 || !orderStore?.currentTime) {
            return;
        }

        const groupedByTime: { [key: string]: Chemical[] } = {};
        batchsStore.forEach((chemical: Chemical) => {
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

        const currentTime = parseDateTime(orderStore.currentTime);

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

        // unstable_batchedUpdates(() => {
        //     setGroupedChemicals(grouped);
        //     setCurrentChemicals(currentGroup?.chemicals || []);
        // });
        setManyOperation({
            groupedChemicals: grouped,
            currentChemicals: currentGroup?.chemicals || [],
        })

    }, [batchsStore, setGroupedChemicals, setCurrentChemicals]);

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
            if (!isActive) return;
            let config: Config | undefined;
            try {
                const settings = await getMany(['serverIp', 'port', 'inspectionTime']);
                const res = await getData('portal/inject/getRunning', { drumNo: orderStore?.process?.drumNo || rotatingTank.name }, true, settings.serverIp + ':' + settings.port);
                console.log('LOG : fetchRunningData : res:', res);
                config = { ...res.data?.config, currentTime: res.data?.curentTime }

                if (res.code === 0 && res.data?.process?.dtl) {
                    const { dtl, ...processWithoutDtl } = res.data.process;
                    const appInjectPause = res.data?.appInjectPause;
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
                    })
                    // unstable_batchedUpdates(() => {
                    //     setOrderStore({
                    //         process: processWithoutDtl,
                    //         currentTime: res.data?.curentTime,
                    //         config: config,
                    //         appInjectPause: appInjectPause,
                    //     });
                    //     setBatchsStore(dtl);
                    //     setIsPause(appInjectPause?.pauseTime && !appInjectPause?.continueTime)
                    // });
                }
                if (res.code === 0 && !res.data?.process?.dtl && (groupedChemicals.length > 0)) {
                    const currentTime = parseDateTime(res.data?.curentTime);
                    const currentGroupIndex = groupedChemicals.findIndex((group, index) => {
                        const startTime = parseDateTime(group.time);
                        const endTime = groupedChemicals[index + 1]
                            ? parseDateTime(groupedChemicals[index + 1].time)
                            : Infinity;

                        return currentTime >= startTime && currentTime < endTime;
                    });
                    console.log('LOG : fetchRunningData : currentGroupIndex:', currentGroupIndex)
                    if (currentGroupIndex !== groupedChemicals.length - 1) {
                        reset();
                    } else {
                        const lastGroup = groupedChemicals[currentGroupIndex];
                        const finishMs = parseDateTime(lastGroup.time) + lastGroup.chemicals[0].operateTime * 60_000;
                        console.log('LOG : fetchRunningData : finishMs:', finishMs);
                        if (finishMs <= currentTime) {
                            setIsProcessComplete(true);
                        }
                    }
                }
            } catch (error: any) {
                showToast(error.message);
            } finally {
                console.log('LOG : fetchRunningData : config:', config);
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
                    })
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
    }, [rotatingTank.name, getData, setBatchsStore, setOrderStore, reset, setManySetting, setManyOperation, getMany, setIsPause, inspectionTime]);

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
