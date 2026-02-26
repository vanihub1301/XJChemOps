import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { usePermissions } from '../../../hooks/usePermissions';

export const useCameraSetup = (
    navigation: any,
    device: any,
    forceStopRecord: () => void,
) => {
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [cameraKey, setCameraKey] = useState(0);
    const [zoom, setZoom] = useState(1);

    const { checkCameraPermission, goToSettings } = usePermissions();

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.5, device?.maxZoom ?? 5));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.5, device?.minZoom ?? 1));
    };

    useEffect(() => {
        const checkPermission = async () => {
            const hasPermission = await checkCameraPermission();

            if (!hasPermission) {
                goToSettings(navigation, 'camera');
            }
        };

        checkPermission();
    }, [checkCameraPermission, goToSettings, navigation]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                setIsCameraActive(true);
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                forceStopRecord();
                setIsCameraActive(false);
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            if (nextAppState === 'active') {
                const hasPermission = await checkCameraPermission();

                if (!hasPermission) {
                    navigation.goBack();
                } else {
                    setIsCameraActive(false);
                    setTimeout(() => {
                        setIsCameraActive(true);
                        setCameraKey(prev => prev + 1);
                    }, 100);
                }
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                setIsCameraActive(false);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [checkCameraPermission, navigation]);

    return {
        isCameraActive,
        setIsCameraActive,
        cameraKey,
        zoom,
        handleZoomIn,
        handleZoomOut,
    };
};
