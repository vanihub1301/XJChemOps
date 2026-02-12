import React, { useEffect } from 'react';
import { AppNavigator } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import FirstRunningScreen from '../../screens/auth/FirstRunningScreen';
import { useSettingStore } from '../../store/settingStore';

export const AppContent: React.FC = () => {
    const { firstRunning, isSignedIn, initialize } = useAuthStore();
    const { initializeSetting } = useSettingStore();
    const { requestCameraPermission } = usePermissions();

    useEffect(() => {
        initialize();
        requestCameraPermission();
    }, [initialize, requestCameraPermission]);

    if (firstRunning) {
        initializeSetting();
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
