import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainRoutes } from '../types/navigation';
import MainHome from '../screens/home/MainHome';
import Setting from '../screens/setting/Setting';
import OrderConfirm from '../screens/home/OrderConfirm';
import Operation from '../screens/operation/Operation';
import NearBill from '../screens/home/NearBill';
import BillDetail from '../screens/home/BillDetail';
import FinishConfirm from '../screens/home/FinishConfirm';
import VideoPlayback from '../screens/video/VideoPlayback';
import FormStopOperation from '../screens/operation/FormStopOperation';
import FormChangeStartTime from '../screens/operation/FormChangeStartTime';
import Video from '../screens/video/Video';
import ScanQR from '../components/camera/ScanQR';
import OperatorLogin from '../screens/operation/OperatorLogin';
import { useAPI } from '../service/api';
import { useOperationStore } from '../store/operationStore';
import { parseDateTime } from '../utils/dateTime';
import { useAuthStore } from '../store/authStore';
import { useSettingStore } from '../store/settingStore';

const MainStack = createStackNavigator<MainRoutes>();
export const MainNavigator = () => {
    const { orderStore, batchsStore, reset, setBatchsStore, setOrderStore, setGroupedChemicals, setCurrentChemicals, setIsPause } = useOperationStore();
    const { rotatingTank } = useAuthStore();
    const { host, port, checkInterval, setMany, } = useSettingStore();
    const { getData } = useAPI();

    useEffect(() => {
        if (!batchsStore || batchsStore.length === 0 || !orderStore?.currentTime) {
            setGroupedChemicals([]);
            return;
        }

        const groupedByTime: { [key: string]: any[] } = {};
        batchsStore.forEach((chemical: any) => {
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
        const fetchRunningData = async () => {
            try {
                console.log('LOG : fetchRunningData : orderStore:', orderStore)

                const res = await getData('portal/inject/getRunning', { drumNo: orderStore?.process?.drumNo || rotatingTank.name }, true, host + ':' + port);
                if (res.code === 0 && res.data?.process?.dtl) {
                    const { dtl, ...processWithoutDtl } = res.data.process;
                    const config = res.data?.config;

                    await Promise.all([
                        setOrderStore({
                            process: processWithoutDtl,
                            currentTime: res.data?.curentTime,
                            config: config,
                            appInjectPause: res.data?.appInjectPause,
                        }),
                        setBatchsStore(dtl),
                        setMany({ host: config.serverIp, port: config.port, checkInterval: config.inspectionTime, idDrum: res.data?.process?.idDrum }),
                        setIsPause(res.data?.appInjectPause?.pauseTime && !res.data?.appInjectPause?.continueTime),
                    ]);
                } else if (batchsStore.length > 0) {
                    reset();
                }
            } catch (error) {
                console.log('LOG : fetchRunningData : error:', error);
            }
        };

        fetchRunningData();

        const intervalMs = (parseInt(checkInterval, 10) || 30) * 1000;
        const interval = setInterval(fetchRunningData, intervalMs);

        return () => clearInterval(interval);
    }, [host, port, checkInterval, rotatingTank.name, getData, setBatchsStore, setOrderStore, reset, setMany]);

    return (
        <MainStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'Home'}>
            <MainStack.Screen name="Home" component={MainHome} />
            <MainStack.Screen name="Setting" component={Setting} />
            <MainStack.Screen name="OrderConfirm" component={OrderConfirm} />
            <MainStack.Screen name="Operation" component={Operation} />
            <MainStack.Screen name="NearBill" component={NearBill} />
            <MainStack.Screen name="BillDetail" component={BillDetail} />
            <MainStack.Screen name="FinishConfirm" component={FinishConfirm} />
            <MainStack.Screen name="VideoPlayback" component={VideoPlayback} />
            <MainStack.Screen name="FormStopOperation" component={FormStopOperation} />
            <MainStack.Screen name="FormChangeStartTime" component={FormChangeStartTime} />
            <MainStack.Screen
                name="Video"
                component={Video}
                options={{
                    presentation: 'modal',
                    animationTypeForReplace: 'pop',
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}
            />
            <MainStack.Screen
                name="ScanQR"
                component={ScanQR}
                options={{
                    presentation: 'modal',
                    animationTypeForReplace: 'pop',
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                }}
            />
            <MainStack.Screen
                name="OperatorLogin"
                component={OperatorLogin}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    gestureEnabled: true,
                }}
            />
        </MainStack.Navigator>
    );
};
