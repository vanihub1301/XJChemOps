import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuthNavigationProps } from '../../types/navigation';
import ViewContainer from '../../components/common/ViewContainer';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, useFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera';
import { usePermissions } from '../../hooks/usePermissions';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../store/authStore';
import { validateFaceQuality, type DetectedFace } from '../../modules/faceDetector';
import ImageEditor from '@react-native-community/image-editor';
import RNFS from 'react-native-fs';
import { showToast } from '../../service/toast';
import { useFocusEffect } from '@react-navigation/native';
import { Worklets } from 'react-native-worklets-core';
import { useSettingStore } from '../../store/settingStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoginProps extends AuthNavigationProps<'Login'> {
    isReAuthentication?: boolean;
}

const Login = ({ navigation, isReAuthentication = false }: LoginProps) => {
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [scanBoxHeight, setScanBoxHeight] = useState(0);
    const [isDetecting, setIsDetecting] = useState(false);
    const [loading, setLoading] = useState(false);
    const { fullName, setName } = useAuthStore();

    const { checkCameraPermission } = usePermissions();
    const { setMany } = useSettingStore();
    const scanLinePosition = useSharedValue(0);
    const lastFrameProcessTime = useSharedValue(0);
    const device = useCameraDevice('front');
    const format = useCameraFormat(device, [
        { videoStabilizationMode: 'cinematic-extended' },
    ]);

    const lastDetectionTime = useRef(0);
    const camera = useRef<Camera>(null);
    const plugin = VisionCameraProxy.initFrameProcessorPlugin('detectFaces', {});

    const cropFaceImage = useCallback(async (photoPath: string, face: DetectedFace): Promise<string | null> => {
        try {
            const { bounds } = face;
            const croppedImageUri = await ImageEditor.cropImage(photoPath, {
                offset: { x: bounds.x, y: bounds.y },
                size: { width: bounds.width, height: bounds.height },
                displaySize: { width: 112, height: 112 },
                quality: 1.0,
            });
            await RNFS.unlink(photoPath.replace('file://', ''));
            return croppedImageUri.uri;
        } catch (error: any) {
            showToast(error.message);
            return null;
        }
    }, []);

    const handleCapture = useCallback(async (face: DetectedFace) => {
        if (!camera.current || isDetecting) {
            return;
        }

        try {
            setIsDetecting(true);
            const photo = await camera.current.takePhoto({ flash: 'off' });
            const photoUri = `file://${photo.path}`;
            const croppedUri = await cropFaceImage(photoUri, face);

            if (croppedUri) {
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    const loginTime = await getTime();

                    useAuthStore.getState().setAuth({
                        isSignedIn: true,
                    });
                    useAuthStore.getState().setTimeLogin({
                        timeLogin: loginTime,
                    });
                }
            }
        } catch (error) {
            showToast('Lỗi khi chụp ảnh!');
        } finally {
            setTimeout(() => setIsDetecting(false), 2000);
        }
    }, [isDetecting, cropFaceImage, navigation]);

    const handleDetectedFaces = Worklets.createRunOnJS((faces: DetectedFace[]) => {
        if (faces.length === 0) {
            return;
        }

        const currentTime = Date.now();
        if (currentTime - lastDetectionTime.current < 3000) {
            return;
        }

        const face = faces[0];
        const qualityResult = validateFaceQuality([face], {
            screenWidth: SCREEN_WIDTH,
            minFaceSizeRatio: 0.25,
            maxYawAngle: 15,
            maxPitchAngle: 15,
            allowMultipleFaces: false,
        });

        if (qualityResult.isGood) {
            lastDetectionTime.current = currentTime;
            handleCapture(face);
        } else {
            // showToast(qualityResult.message);
        }
    });

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        const now = Date.now();
        if (now - lastFrameProcessTime.value < 2000) {
            return;
        }
        lastFrameProcessTime.value = now;
        try {
            if (!plugin) {
                return;
            }

            const faces = plugin.call(frame, {
                performanceMode: 'fast',
                trackingEnabled: false,
            }) as any;

            if (faces && faces.length > 0) {
                handleDetectedFaces(faces);
            }
        } catch (e: any) {
        }
    }, [handleDetectedFaces]);

    const onScanBoxLayout = useCallback((event: any) => {
        const { height } = event.nativeEvent.layout;
        setScanBoxHeight(height);
    }, []);

    const handleFaceRegister = useCallback(() => {
        navigation.navigate('FaceRegister');
    }, [navigation]);

    const getTime = async () => {
        const response = await fetch('https://timeapi.io/api/v1/timezone/zone?timeZone=Asia%2FHo_Chi_Minh');
        const data = await response.json();

        const timeMatch = data.local_time.match(/T(\d{2}):(\d{2})/);
        return timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : '';
    };

    const handlePasswordLogin = useCallback(async () => {
        try {
            setLoading(true);
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                const loginTime = await getTime();

                useAuthStore.getState().setAuth({
                    isSignedIn: true,
                });
                useAuthStore.getState().setTimeLogin({
                    timeLogin: loginTime,
                });
                if (!fullName) {
                    setName({ fullName: 'ADMIN' });
                }
                setMany({
                    serverIp: '192.168.10.8',
                    port: '8072',
                    inspectionTime: 10,
                    lockScreen: true,
                    enableSound: true,
                    language: 'vi',
                });
                navigation.replace('Main');
            }
        } catch (error: any) {
            showToast(error.message);
        } finally {
            setLoading(false);
        }


    }, [navigation]);

    useEffect(() => {
        const checkPermission = async () => {
            const hasPermission = await checkCameraPermission();
            if (!hasPermission) {
                setIsCameraActive(false);
                showToast('Cần cấp quyền camera để đăng nhập!');
            }
        };
        checkPermission();
    }, [checkCameraPermission]);

    useEffect(() => {
        if (scanBoxHeight > 0) {
            scanLinePosition.value = withRepeat(
                withTiming(scanBoxHeight - 2, {
                    duration: 2000,
                    easing: Easing.linear,
                }),
                -1,
                true,
            );
        }

        return () => {
            cancelAnimation(scanLinePosition);
        };
    }, [scanLinePosition, scanBoxHeight]);

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLinePosition.value }],
    }));

    useFocusEffect(
        useCallback(() => {
            setIsCameraActive(true);
            return () => {
                setIsCameraActive(false);
            };
        }, [])
    );

    return (
        <ViewContainer>
            <ViewBox padding={'md'} className="flex-1">
                <ViewBox gap={'xl'} className="flex-1 justify-center px-4">
                    <ViewBox className="items-center">
                        <Text variant={'largeTitle'} color={'black'}>
                            Chào mừng quay trở lại
                        </Text>
                        <Text variant={'sectionTitleMedium'} className="mt-2">
                            Xác thực để tiếp tục
                        </Text>
                    </ViewBox>
                    <ViewBox
                        padding={'md'}
                        className="justify-center items-center my-5"
                    >
                        <ViewBox
                            border={'blueSignal'}
                            radius={'full'}
                            className="border-4 aspect-square w-[80%] overflow-hidden"
                            style={styles.boxShadow}
                        >
                            {(device && isCameraActive) ? (
                                <ViewBox radius={'full'} className="flex-1 m-0 overflow-hidden">
                                    <Camera
                                        ref={camera}
                                        style={StyleSheet.absoluteFill}
                                        isActive={isCameraActive}
                                        device={device}
                                        format={format}
                                        photo={true}
                                        video={false}
                                        audio={false}
                                        resizeMode="cover"
                                        androidPreviewViewType="texture-view"
                                        frameProcessor={frameProcessor}
                                    />
                                </ViewBox>
                            ) : (
                                <ViewBox style={styles.boxWrapper}>
                                    <ViewBox style={styles.scanBox} onLayout={onScanBoxLayout}>
                                        <ViewBox style={styles.cornerTopLeft} />
                                        <ViewBox style={styles.cornerTopRight} />
                                        <ViewBox style={styles.cornerBottomLeft} />
                                        <ViewBox style={styles.cornerBottomRight} />
                                        <MaterialCommunityIcons name="face-man" size={150} color="#C9C0F7" />
                                        <Animated.View style={[styles.scanLine, scanLineStyle]} />
                                    </ViewBox>
                                </ViewBox>
                            )}
                        </ViewBox>

                    </ViewBox>
                    {!isReAuthentication && (
                        <ViewBox className="items-center mt-5">
                            <TouchableOpacity disabled={loading} onPress={handlePasswordLogin}>
                                {loading ? (
                                    <ActivityIndicator size={24} color="#5B25EA" />
                                ) : (
                                    <Text color={'blueViolet'} variant={'sectionTitleSemibold'} >
                                        Sử dụng mật khẩu
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ViewBox>
                    )}
                </ViewBox>

                {!isReAuthentication && (
                    <ViewBox gap={'xs'} className="pb-8 pt-4">
                        <TouchableOpacity disabled={loading} onPress={handleFaceRegister} activeOpacity={0.7}>
                            <Text variant={'sectionTitleRegular'} className="text-center">
                                Chưa có tài khoản? <Text color={'blueViolet'} variant={'sectionTitleSemibold'}>Đăng ký ngay</Text>
                            </Text>
                        </TouchableOpacity>
                    </ViewBox>
                )}
            </ViewBox>
        </ViewContainer>
    );
};

const styles = StyleSheet.create({
    cameraInset: {
        borderRadius: 9999,
    },
    boxShadow: {
        backgroundColor: 'white',
        shadowColor: '#5B25EA',
        elevation: 15,
    },
    boxWrapper: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanBox: {
        aspectRatio: 1,
        width: '60%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        width: '90%',
        height: 2,
        backgroundColor: '#4F26E0',
        alignSelf: 'center',
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
            borderColor: '#C9C0F7',
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
            borderColor: '#C9C0F7',
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
            borderColor: '#C9C0F7',
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
            borderColor: '#C9C0F7',
        }),
    },
});
export default Login;
