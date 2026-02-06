import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, AppState } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, useCodeScanner } from 'react-native-vision-camera';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { usePermissions } from '../../hooks/usePermissions';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const LINE_HEIGHT = 2;

interface CameraScanSectionProps {
    onCodeScanned?: (code: string) => void;
    boxSize?: number;
    borderRadius?: number;
    children?: React.ReactNode;
}

const CameraScanSection: React.FC<CameraScanSectionProps> = ({
    onCodeScanned,
    boxSize = width * 0.85,
    borderRadius = 20,
    children,
}) => {
    const [scanned, setScanned] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraKey, setCameraKey] = useState(0);
    const [layoutHeight, setLayoutHeight] = useState(boxSize);

    const { requestCameraPermission } = usePermissions();
    const device = useCameraDevice('front');
    const format = useCameraFormat(device, [
        { videoResolution: 'max' },
    ]);
    const scanLinePosition = useSharedValue(0);

    const onLayout = useCallback((event: any) => {
        const { height } = event.nativeEvent.layout;
        setLayoutHeight(height);
    }, []);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: codes => {
            if (codes && codes.length > 0 && !scanned) {
                setScanned(true);
                cancelAnimation(scanLinePosition);

                if (onCodeScanned) {
                    onCodeScanned(codes[0].value || '');
                }

                setTimeout(() => {
                    setScanned(false);
                    scanLinePosition.value = 0;
                    scanLinePosition.value = withRepeat(
                        withTiming(layoutHeight - LINE_HEIGHT, {
                            duration: 2000,
                            easing: Easing.linear,
                        }),
                        -1,
                        true,
                    );
                }, 1000);
            }
        },
    });

    useEffect(() => {
        scanLinePosition.value = 0;
        scanLinePosition.value = withRepeat(
            withTiming(layoutHeight - LINE_HEIGHT, {
                duration: 2000,
                easing: Easing.linear,
            }),
            -1,
            true,
        );

        return () => {
            cancelAnimation(scanLinePosition);
        };
    }, [layoutHeight, scanLinePosition]);

    useEffect(() => {
        (async () => {
            const requested = await requestCameraPermission();
            setHasPermission(requested);
            if (requested) {
                setIsCameraActive(true);
            }
        })();
    }, [requestCameraPermission]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                setIsCameraActive(false);
                setTimeout(() => {
                    setIsCameraActive(true);
                    setCameraKey(prev => prev + 1);
                }, 100);
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                setIsCameraActive(false);
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            setScanned(false);
            setIsCameraActive(true);

            return () => {
                setIsCameraActive(false);
            };
        }, [])
    );

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLinePosition.value }],
    }));

    return (
        <View style={[styles.container, { borderRadius }]} onLayout={onLayout}>
            {hasPermission && device && (
                <>
                    <Camera
                        key={cameraKey}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        format={format}
                        isActive={isCameraActive && !scanned}
                        codeScanner={codeScanner}
                    />

                    <View style={styles.childrenContainer}>
                        {children}
                    </View>
                </>
            )}

            {children}

            {scanned && (
                <View style={styles.resultOverlay}>
                    <View style={styles.resultBadge}>
                        <View style={styles.successCircle} />
                    </View>
                </View>
            )}
        </View>
    );
};

export default CameraScanSection;

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    scanBox: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: LINE_HEIGHT,
        backgroundColor: '#6165EE',
    },
    childrenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'box-none',
    },
    resultOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    resultBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(29, 195, 118, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#fff',
    },
});
