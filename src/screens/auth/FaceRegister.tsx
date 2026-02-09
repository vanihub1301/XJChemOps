import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuthNavigationProps } from '../../types/navigation';
import ViewContainer from '../../components/common/ViewContainer';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, useFrameProcessor } from 'react-native-vision-camera';
import { usePermissions } from '../../hooks/usePermissions';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ViewHeader from '../../components/common/ViewHeader';
import PillBadge from '../../components/common/PillBadge';
import { Button } from '../../components/common/Button';
import { useFocusEffect } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import Card from '../../components/common/Card';
import EmployeeSelectModal from './EmployeeSelectModal';
import ImageViewing from 'react-native-image-viewing';
import type { DetectedFace, FaceDetectorOptions } from '../../modules/faceDetector';
import { validateFaceQuality, detectFacesInImage } from '../../modules/faceDetector';
import RNFS from 'react-native-fs';
import { showToast } from '../../service/toast';
import ImageEditor from '@react-native-community/image-editor';
import { useAuthStore } from '../../store/authStore';
import { useAPI } from '../../service/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FaceRegister = ({ navigation }: AuthNavigationProps<'FaceRegister'>) => {
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [scanBoxHeight, setScanBoxHeight] = useState(0);
    const [images, setImages] = useState<string[]>(['', '', '', '', '']);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isImageViewingVisible, setIsImageViewingVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [user, setUser] = useState({ name: '', code: '' });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [listEmployee, setListEmployee] = useState<any[]>([]);

    const { checkCameraPermission } = usePermissions();
    const { setName } = useAuthStore();
    const scanLinePosition = useSharedValue(0);
    const device = useCameraDevice('front');
    const format = useCameraFormat(device, [{ videoStabilizationMode: 'cinematic-extended' }]);
    const frameProcessor = useFrameProcessor((frame) => { 'worklet'; }, []);
    const { getData } = useAPI();

    const camera = useRef<Camera>(null);

    const capturedCount = images.filter(img => img !== '').length;
    const isComplete = capturedCount === 5;

    const onScanBoxLayout = useCallback((event: any) => {
        const { height } = event.nativeEvent.layout;
        setScanBoxHeight(height);
    }, []);

    const handleImagePress = (index: number) => {
        setCurrentImageIndex(index);
        setIsImageViewingVisible(true);
    };

    const cropFaceImage = async (photoPath: string, face: DetectedFace): Promise<string> => {
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
        } catch (error) {
            showToast('Không thể cắt ảnh khuôn mặt');
            return photoPath;
        }
    };

    const handleTakePhoto = useCallback(async () => {
        if (!camera.current || isCapturing) {
            return;
        }
        const emptyIndex = images.findIndex(img => img === '');
        try {
            setIsCapturing(true);

            const photo = await camera.current.takePhoto({
                flash: 'off',
            });

            const photoUri = `file://${photo.path}`;

            const detectorOptions: FaceDetectorOptions = {
                performanceMode: 'fast',
                landmarkMode: 'all',
                classificationMode: 'all',
                contourMode: 'none',
                minFaceSize: 0.2,
                trackingEnabled: false,
            };

            const faces = await detectFacesInImage(photoUri, detectorOptions);

            const qualityResult = validateFaceQuality(faces, {
                screenWidth: SCREEN_WIDTH,
                minFaceSizeRatio: 0.3,
                maxYawAngle: 20,
                maxPitchAngle: 20,
                allowMultipleFaces: false,
            });

            if (!qualityResult.isGood) {
                showToast(qualityResult.message);
                await RNFS.unlink(photo.path);
                return;
            }

            const largestFace = faces[0];
            const croppedPhotoUri = await cropFaceImage(photoUri, largestFace);

            const newImages = [...images];
            newImages[emptyIndex] = croppedPhotoUri;
            setImages(newImages);
        } catch (error) {
            showToast('Không thể chụp ảnh. Vui lòng thử lại');
        } finally {
            setIsCapturing(false);
        }
    }, [images, isCapturing]);

    const handleRemovePhoto = useCallback((index: number) => {
        const newImages = [...images];
        newImages[index] = '';
        setImages(newImages);
    }, [images]);

    const handleComplete = useCallback(async () => {
        try {
            setName({ fullName: user.name });
            showToast('Đăng ký thành công!');
            navigation.navigate('Login');
        } catch (error) {
            showToast('Đăng ký thất bại. Vui lòng thử lại');
        }
    }, [navigation]);

    const handlePressItem = useCallback((item: any) => {
        setUser(item);
        setIsModalVisible(false);
    }, []);

    const fetchData = async () => {
        try {
            const res = await getData('portal/inject/employee');
            if (res?.code === 0) {
                setListEmployee(res?.data);
            } else {
                showToast(res?.msg);
            }
        } catch (error: any) {
            showToast(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const checkPermission = async () => {
            const hasPermission = await checkCameraPermission();
            if (!hasPermission) {
                setIsCameraActive(false);
                showToast('Cần cấp quyền camera để đăng ký');
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
            KeepAwake.activate();
            return () => {
                KeepAwake.deactivate();
            };
        }, [])
    );

    return (
        <ViewContainer background="none" hasScrollableContent={true}>
            <ScrollView className="mb-5">
                <ViewHeader>
                    <ViewBox gap={'sm'} className="flex-1 items-center justify-center my-4">
                        <Text className="tracking-widest" variant={'labelLargeSemibold'} color={'crayola'}>
                            ĐĂNG KÝ
                        </Text>
                        <PillBadge
                            label={`Bước ${1}/${2}`}
                            background="lavender"
                            textColor="crayola"
                        />
                    </ViewBox>
                </ViewHeader>
                <ViewBox padding={'md'} gap={'xl'} className="flex-1 justify-center px-4">
                    <ViewBox className="items-center">
                        <Text className="tracking-widest" variant={'largeTitleSemibold'} color={'blueViolet'}>
                            Quét gương mặt
                        </Text>
                        <Text color={'darkGray'} variant={'sectionTitleRegular'} className="mt-2">
                            Chụp 5 góc độ khác nhau để hoàn tất đăng ký.
                        </Text>
                    </ViewBox>
                    <ViewBox
                        padding={'md'}
                        className="justify-center items-center my-2"
                    >
                        <ViewBox
                            border={'blueSignal'}
                            radius={'full'}
                            padding={'sm'}
                            className="border-4 aspect-square w-[60%] overflow-hidden"
                        >
                            {(device && isCameraActive) ? (
                                <ViewBox radius={'full'} className="flex-1 overflow-hidden">
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
                                <ViewBox className="w-full h-full items-center justify-center">
                                    <ViewBox className="aspect-square w-[60%] items-center justify-center" onLayout={onScanBoxLayout}>
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
                    <ViewBox gap={'lg'}>
                        <ViewBox className="flex-row justify-between">
                            <Text variant={'captionSemibold'} color={'blueViolet'}>TIẾN TRÌNH: {capturedCount}/5 ẢNH</Text>
                            <Text color={'lightGray'} variant={'captionMedium'}>Nhấn X để chụp lại</Text>
                        </ViewBox>
                        <ViewBox gap={'xl'} className="flex-row justify-center items-center">
                            {images.map((uri: string, index: number) => {
                                const isAddSlot = (images[index - 1] !== '' && images[index] === '');
                                return (
                                    <ViewBox key={index} className="items-center justify-center">
                                        {uri ? (
                                            <ViewBox className="relative">
                                                <TouchableOpacity onPress={() => handleImagePress(index)}>
                                                    <ViewBox
                                                        radius="full"
                                                        className="w-24 h-24 overflow-hidden border-2 border-white"
                                                    >
                                                        <Image
                                                            source={{ uri }}
                                                            className="w-full h-full"
                                                            resizeMode="cover"
                                                        />
                                                    </ViewBox>
                                                </TouchableOpacity>


                                                <TouchableOpacity
                                                    style={styles.removeBtn}
                                                    onPress={() => handleRemovePhoto(index)}
                                                >
                                                    <MaterialCommunityIcons name="close" size={14} color="#fff" />
                                                </TouchableOpacity>
                                            </ViewBox>
                                        ) : isAddSlot ? (
                                            <ViewBox
                                                radius="full"
                                                className="bg-[#EEF2FF] w-24 h-24 items-center justify-center border-dashed border-2 border-[#4F46E5]"
                                            >
                                                <MaterialCommunityIcons name="camera-plus" size={50} color="#9B95EF" />
                                            </ViewBox>
                                        ) : (
                                            <ViewBox
                                                radius="full"
                                                className="bg-[#F9FAFB] w-24 h-24 items-center justify-center border-dashed border-2 border-[#D1D5DB]"
                                            >
                                                <Text color={'blurGray'} variant="largeTitle">
                                                    {index + 1}
                                                </Text>
                                            </ViewBox>
                                        )}
                                    </ViewBox>
                                );
                            })}
                        </ViewBox>

                    </ViewBox>
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <Card padding={'lg'} border="none" className="flex-row items-center justify-between" >
                            <ViewBox gap={'lg'} className="flex-row items-center">
                                <FontAwesome5 name="user-cog" size={30} color="#5B25EA" />
                                <ViewBox gap={'xs'}>
                                    <Text color={'black'} variant="sectionTitleSemibold">{user.name || 'Chưa chọn nhân viên'}</Text>
                                    <Text color={'blueViolet'} variant="labelSemibold">ID: {user.code}</Text>
                                </ViewBox>
                            </ViewBox>
                            {user.name ? (
                                <MaterialCommunityIcons name="check-decagram" size={20} color="green" />
                            ) : (
                                <MaterialCommunityIcons name="cancel" size={20} color="red" />
                            )}
                        </Card>

                    </TouchableOpacity>
                    <ViewBox gap={'md'}>
                        <Button
                            label="Chụp hình"
                            onPress={handleTakePhoto}
                            disabled={isCapturing || isComplete}
                            size={'lg'}
                            gap={'lg'}
                            variant={'secondary'}
                            radius={'full'}
                            className="flex-row items-center"
                            iconPosition="left"
                            textClassName="text-xl font-semibold"
                        >
                            <MaterialCommunityIcons name="camera" size={20} color="#1212E4" />
                        </Button>
                        <Button
                            label="Hoàn tất"
                            onPress={handleComplete}
                            disabled={!isComplete}
                            size={'lg'}
                            gap={'lg'}
                            variant={'primary'}
                            radius={'full'}
                            className="flex-row items-center"
                            textClassName="text-xl font-semibold"
                            iconPosition="left"
                        >
                            <MaterialCommunityIcons name="check-circle" size={20} color="white" />
                        </Button>
                    </ViewBox>
                    <ViewBox className="items-center flex-1">
                        <Text color={'lightGray'} variant={'caption'}>
                            Dữ liêu của bạn được bảo mật theo tiêu chuẩn SaaS Inject
                        </Text>
                    </ViewBox>
                </ViewBox>
            </ScrollView>
            <EmployeeSelectModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSelect={handlePressItem}
                data={listEmployee}
                selectedCode={user.code}
                title="Chọn nhân viên"
                placeholder="Nhập mã nhân viên..."
            />
            <ImageViewing
                images={images
                    .filter(img => img !== '')
                    .map(uri => ({ uri }))
                }
                imageIndex={currentImageIndex}
                visible={isImageViewingVisible}
                onRequestClose={() => setIsImageViewingVisible(false)}
            />
        </ViewContainer>
    );
};

const styles = StyleSheet.create({
    removeBtn: {
        position: 'absolute',
        top: 0,
        right: 3,
        width: 25,
        height: 25,
        borderRadius: 20,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
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
export default FaceRegister;
