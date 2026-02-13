import React, { useEffect, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AppRoutes } from '../types/navigation';
import { AuthenticationNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuthStore } from '../store/authStore';
import { useSettingStore } from '../store/settingStore';
import { useAPI } from '../service/api';
import { Chemical } from '../types/drum';
import { parseDateTime } from '../utils/dateTime';
import { showToast } from '../service/toast';
import { useOperationStore } from '../store/operationStore';
import { SplashScreen } from '../components/app/SplashScreen';

const AppStack = createStackNavigator<AppRoutes>();

interface AppNavigatorProps {
    isSignedIn: boolean;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ isSignedIn }) => {
    const { orderStore, batchsStore, groupedChemicals, reset, setBatchsStore, setOrderStore, setGroupedChemicals, setCurrentChemicals, setIsPause } = useOperationStore();
    const { rotatingTank, isLoading, setLoading } = useAuthStore();
    const { setMany, getMany } = useSettingStore();
    const { getData } = useAPI();
    const currentIntervalTimeRef = useRef<number>(30000);
    const hasLoadedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!batchsStore || batchsStore.length === 0 || !orderStore?.currentTime) {
            setGroupedChemicals([]);
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

        const currentGroup = grouped.find((group, index) => {
            const startTime = parseDateTime(group.time);
            const endTime = grouped[index + 1]
                ? parseDateTime(grouped[index + 1].time)
                : Infinity;

            return currentTime >= startTime && currentTime < endTime;
        });

        console.log('LOG : Operation : currentGroup:', currentGroup);
        console.log('LOG : Operation : grouped:', grouped);
        console.log('LOG : Operation : config:', orderStore.config);
        console.log('LOG : Operation : currentTime:', orderStore.currentTime);

        setGroupedChemicals(grouped);
        setCurrentChemicals(currentGroup?.chemicals || []);

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
            let config;
            try {
                const settings = await getMany(['serverIp', 'port', 'inspectionTime']);

                const res = await getData('portal/inject/getRunning', { drumNo: orderStore?.process?.drumNo || rotatingTank.name }, true, settings.serverIp + ':' + settings.port);
                config = res.data?.config;
                if (res.code === 0 && res.data?.process?.dtl) {
                    const { dtl, ...processWithoutDtl } = res.data.process;
                    const appInjectPause = res.data?.appInjectPause;

                    await Promise.all([
                        setOrderStore({
                            process: processWithoutDtl,
                            currentTime: res.data?.curentTime,
                            config: config,
                            appInjectPause: appInjectPause,
                        }),
                        setBatchsStore(dtl),

                        setIsPause(appInjectPause?.pauseTime && !appInjectPause?.continueTime),
                    ]);


                    const newIntervalMs = (parseInt(config.inspectionTime, 10) || 30) * 1000;
                    if (newIntervalMs !== currentIntervalTimeRef.current) {
                        currentIntervalTimeRef.current = newIntervalMs;
                    }
                } else if (res.code === 0 && !res.data?.process?.dtl && batchsStore.length > 0) {
                    reset();
                }
            } catch (error: any) {
                showToast(error.message);
            } finally {
                console.log('LOG : fetchRunningData : config:', config);
                setMany({
                    serverIp: config?.serverIp,
                    port: config?.port,
                    inspectionTime: config?.inspectionTime,
                    idDrum: config?.id,
                    lockScreen: config?.lockScreen,
                    enableSound: config?.enableSound,
                    drumno: config?.drumno,
                    language: config?.language,
                })
                finishInitialLoading();
            }

            if (isActive) {
                timeoutId = setTimeout(fetchRunningData, currentIntervalTimeRef.current);
            }
        };

        const init = async () => {
            try {
                const settings = await getMany(['inspectionTime']);
                const intervalMs = (parseInt(settings.inspectionTime, 10) || 30) * 1000;
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
    }, [rotatingTank.name, getData, setBatchsStore, setOrderStore, reset, setMany, getMany, setIsPause]);

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <AppStack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={(groupedChemicals.length > 0) ? 'Main' : 'Authentication'}
            key={(groupedChemicals.length > 0) ? 'main' : 'auth'}
        >
            <AppStack.Screen name="Main" component={MainNavigator} />
            <AppStack.Screen name="Authentication" component={AuthenticationNavigator} />
        </AppStack.Navigator>
    );
};
