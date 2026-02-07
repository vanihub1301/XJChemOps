import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AppRoutes } from '../types/navigation';
import { AuthenticationNavigator } from './AuthNavigator';
import Operation from '../screens/operation/Operation';
import OrderConfirm from '../screens/home/OrderConfirm';
import Video from '../screens/video/Video';
import ScanQR from '../components/camera/ScanQR';
import FormStopOperation from '../screens/operation/FormStopOperation';
import FormChangeStartTime from '../screens/operation/FormChangeStartTime';
import MainHome from '../screens/home/MainHome';
import Setting from '../screens/setting/Setting';
import FinishConfirm from '../screens/home/FinishConfirm';
import VideoPlayback from '../screens/video/VideoPlayback';
import NearBill from '../screens/home/NearBill';
import BillDetail from '../screens/home/BillDetail';
import OperatorLogin from '../screens/auth/OperatorLogin';

const AppStack = createStackNavigator<AppRoutes>();

interface AppNavigatorProps {
    isSignedIn: boolean;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ isSignedIn }) => {
    return (
        <AppStack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={isSignedIn ? 'Home' : 'Authentication'}
            key={isSignedIn ? 'signedIn' : 'auth'}
        >
            {isSignedIn ? (
                <>
                    <AppStack.Screen name="Home" component={MainHome} />
                    <AppStack.Screen name="Setting" component={Setting} />
                    <AppStack.Screen name="OrderConfirm" component={OrderConfirm} />
                    <AppStack.Screen name="Operation" component={Operation} />
                    <AppStack.Screen name="NearBill" component={NearBill} />
                    <AppStack.Screen name="BillDetail" component={BillDetail} />
                    <AppStack.Screen name="FinishConfirm" component={FinishConfirm} />
                    <AppStack.Screen name="VideoPlayback" component={VideoPlayback} />
                    <AppStack.Screen name="FormStopOperation" component={FormStopOperation} />
                    <AppStack.Screen name="FormChangeStartTime" component={FormChangeStartTime} />
                    <AppStack.Screen
                        name="Video"
                        component={Video}
                        options={{
                            presentation: 'modal',
                            animationTypeForReplace: 'pop',
                            animation: 'slide_from_right',
                            gestureEnabled: true,
                        }}
                    />
                    <AppStack.Screen
                        name="ScanQR"
                        component={ScanQR}
                        options={{
                            presentation: 'modal',
                            animationTypeForReplace: 'pop',
                            animation: 'slide_from_right',
                            gestureEnabled: true,
                        }}
                    />
                    <AppStack.Screen
                        name="OperatorLogin"
                        component={OperatorLogin}
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_bottom',
                            gestureEnabled: true,
                        }}
                    />
                </>
            ) : (
                <AppStack.Screen name="Authentication" component={AuthenticationNavigator} />
            )}
        </AppStack.Navigator>
    );
};
