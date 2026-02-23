import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, AppState, AppStateStatus } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useSharedValue, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { usePermissions } from '../../hooks/usePermissions';
import { useIsFocused } from '@react-navigation/native';

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
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const [layoutHeight, setLayoutHeight] = useState(boxSize);

    const { requestCameraPermission } = usePermissions();
    const device = useCameraDevice('front');
    const isFocused = useIsFocused();
    const scanLinePosition = useSharedValue(0);

    const isCameraActive = isFocused && appState === 'active' && hasPermission === true && !scanned;

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
        })();
    }, [requestCameraPermission]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            setAppState(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (isFocused) {
            setScanned(false);
        }
    }, [isFocused]);

    return (
        <View style={[styles.container, { borderRadius }]} onLayout={onLayout}>
            {hasPermission && device && (
                <>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={isCameraActive}
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
