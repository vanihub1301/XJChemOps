import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Animated, {
    useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation,
} from 'react-native-reanimated';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePermissions } from '../../hooks/usePermissions';
import { useFocusEffect } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import { AppNavigationProps } from '../../types/navigation';

const { width } = Dimensions.get('window');
const BOX_SIZE = width * 0.7;
const LINE_HEIGHT = 2;

const ScanQR = ({ navigation, route }: AppNavigationProps<'ScanQR'>) => {
    const nextScreen = route?.params?.nextScreen || '';
    const reset = route?.params?.reset || false;

    const [scanned, setScanned] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(true);

    const inset = useSafeAreaInsets();
    const { requestCameraPermission, goToSettings } = usePermissions();
    const device = useCameraDevice('front');
    const scanLinePosition = useSharedValue(0);
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: codes => {
            if (codes && codes.length > 0) {
                setScanned(true);
                cancelAnimation(scanLinePosition);

                setTimeout(() => {
                    if (nextScreen) {
                        if (reset) {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: nextScreen as any, params: { code: codes[0].value } }],
                            });
                        } else {
                            navigation.replace(nextScreen as any, {
                                code: codes[0].value,
                            });
                        }
                    } else {
                        navigation.goBack();
                    }

                }, 300);
            }
        },
    });

    useEffect(() => {
        scanLinePosition.value = withRepeat(
            withTiming(BOX_SIZE - LINE_HEIGHT, {
                duration: 2000,
                easing: Easing.linear,
            }),
            -1,
            true,
        );

        return () => {
            cancelAnimation(scanLinePosition);
        };
    }, [scanLinePosition]);

    useEffect(() => {
        (async () => {
            const requested = await requestCameraPermission();
            if (!requested) {
                goToSettings(navigation, 'camera');
            }
        })();
    }, []);

    useFocusEffect(
        useCallback(() => {
            setScanned(false);
            setIsCameraActive(true);

            KeepAwake.activate();
            return () => {
                KeepAwake.deactivate();
                setIsCameraActive(false);
            };
        }, [])
    );
    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLinePosition.value }],
    }));

    if (!device) {
        return <Text style={styles.text}>Đang tải camera...</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={{
                top: inset.top + 20,
                left: inset.left + 10,
            }} className={'absolute z-10'}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className={'bg-black/50 p-3 rounded-[25px]'}
                >
                    <ChevronLeftIcon size={20} color={'white'} />
                </TouchableOpacity>
            </View>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isCameraActive && !scanned}
                codeScanner={codeScanner}
            />

            <View style={styles.boxWrapper}>
                <View style={styles.scanBox}>
                    <View style={styles.cornerTopLeft} />
                    <View style={styles.cornerTopRight} />
                    <View style={styles.cornerBottomLeft} />
                    <View style={styles.cornerBottomRight} />

                    {!scanned && (
                        <Animated.View style={[styles.scanLine, scanLineStyle]} />
                    )}
                </View>
                <Text style={styles.text}>Đưa mã QR vào khung để quét</Text>
            </View>

            {scanned && (
                <View style={styles.resultOverlay}>
                    <Text style={styles.resultText}>Quét mã thành công!</Text>
                </View>
            )}
        </View>
    );
};

export default ScanQR;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    boxWrapper: {
        position: 'absolute',
        top: '30%',
        width: '100%',
        alignItems: 'center',
    },
    scanBox: {
        width: BOX_SIZE,
        height: BOX_SIZE,
        position: 'relative',
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: LINE_HEIGHT,
        backgroundColor: 'rgba(128, 224, 77, 0.9)',
    },
    text: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
    },
    resultOverlay: {
        position: 'absolute',
        bottom: '30%',
        width: '100%',
        alignItems: 'center',
    },
    resultText: {
        fontSize: 20,
        color: '#fff',
        backgroundColor: '#222',
        padding: 12,
        borderRadius: 10,
    },

    cornerStyle: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#80E04D',
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        ...StyleSheet.flatten({
            position: 'absolute',
            width: 30,
            height: 30,
            borderColor: '#80E04D',
        }),
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        ...StyleSheet.flatten({
            position: 'absolute',
            width: 30,
            height: 30,
            borderColor: '#80E04D',
        }),
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        ...StyleSheet.flatten({
            position: 'absolute',
            width: 30,
            height: 30,
            borderColor: '#80E04D',
        }),
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        ...StyleSheet.flatten({
            position: 'absolute',
            width: 30,
            height: 30,
            borderColor: '#80E04D',
        }),
    },
});
