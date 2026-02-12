import React from 'react';
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
import { useOperationStore } from '../store/operationStore';

const MainStack = createStackNavigator<MainRoutes>();
export const MainNavigator = () => {
    const { batchsStore } = useOperationStore();

    return (
        <MainStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={batchsStore.length > 0 ? 'Operation' : 'Home'}>
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
