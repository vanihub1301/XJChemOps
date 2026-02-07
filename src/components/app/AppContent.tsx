import React, { useEffect } from 'react';
import { AppNavigator } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import FirstRunningScreen from '../../screens/auth/FirstRunningScreen';
import { SplashScreen } from './SplashScreen';
import { useSettingStore } from '../../store/settingStore';

export const AppContent: React.FC = () => {
    const { isLoading, firstRunning, isSignedIn, initialize } = useAuthStore();
    const { initializeSetting } = useSettingStore();
    const { requestCameraPermission } = usePermissions();

    useEffect(() => {
        initialize();
        initializeSetting();
        requestCameraPermission();
    }, [initialize, requestCameraPermission, initializeSetting]);

    if (isLoading) {
        return <SplashScreen />;
    }

    if (firstRunning) {
        return (
            <>
                <FirstRunningScreen />
            </>
        );
    }

    return (
        <>
            <AppNavigator isSignedIn={isSignedIn} />
        </>
    );
};
