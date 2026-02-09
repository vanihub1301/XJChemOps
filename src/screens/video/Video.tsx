import React, { useCallback, useEffect, useRef, useState } from 'react';
import ViewContainer from '../../components/common/ViewContainer';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import ViewHeader from '../../components/common/ViewHeader';
import { Text } from '../../components/common/Text';
import { ActivityIndicator, AppState, StyleSheet, Pressable, ScrollView } from 'react-native';
import { ViewBox } from '../../components/common/ViewBox';
import { Button } from '../../components/common/Button';
import VideoHeader from './VideoHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { usePermissions } from '../../hooks/usePermissions';
import KeepAwake from 'react-native-keep-awake';
import RNFS from 'react-native-fs';
import { useVideoStore } from '../../store/videoStore';
import { useOperationStore } from '../../store/operationStore';
import { MIN_FREE_SPACE, MIN_FREE_SPACE_STOP } from '../../constants/ui';
import { showToast } from '../../service/toast';
import { useAPI } from '../../service/api';

interface VideoProps {
    navigation: any;
    route?: {
        params?: {
            onVideoRecorded?: (videoPath: string) => void;
            autoRecord?: boolean;
        };
    };
}

const Video = ({ navigation, route }: VideoProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [cameraKey, setCameraKey] = useState(0);
    const [zoom, setZoom] = useState(1);

    const { currentChemicals, batchsStore, setBatchsStore, orderStore, setOrderStore } = useOperationStore();
    const { getData } = useAPI();


    const mapIcon = {
        flask: <MaterialCommunityIcons name="flask" size={28} color="#26F073" />,
        water: <MaterialIcons name="water-drop" size={28} color="#26F073" />,
        alert: <MaterialCommunityIcons name="alert" size={28} color="red" />,
        bag: <MaterialCommunityIcons name="iv-bag" size={28} color="#26F073" />,
    };

    const device = useCameraDevice('front');
    const format = useCameraFormat(device, [
        { videoStabilizationMode: 'cinematic-extended' },
    ]);

    const camera = useRef<Camera>(null);

    const supportsVideoStabilization = format?.videoStabilizationModes.includes('cinematic-extended');
    const stabilizationMode = supportsVideoStabilization ? 'cinematic-extended' : undefined;

    const { checkCameraPermission, goToSettings } = usePermissions();

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.5, device?.maxZoom ?? 5));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.5, device?.minZoom ?? 1));
    };

    const cancelRecord = useCallback(async () => {
        try {
            if (camera.current) {
                await camera.current.cancelRecording();
                setIsRecording(false);
                setIsPaused(false);
            }
        } catch (error) {
            console.log(error);
        }
    }, []);

    const handleDownloadAndCallback = useCallback(async (videoPath: string) => {
        try {
            const asset = await CameraRoll.save(`file://${videoPath}`, {
                type: 'video',
            });
            await RNFS.unlink(videoPath);
            useVideoStore.getState().markSaved(asset);
            navigation.goBack();
        } catch (error) {
            showToast('Lỗi khi lưu video');
        }
    }, [navigation]);

    const startRecord = useCallback(async () => {
        try {
            const fsInfo = await RNFS.getFSInfo();
            if (fsInfo.freeSpace < MIN_FREE_SPACE) {
                showToast('Không đủ dung lượng bộ nhớ');
                return;
            }
            await camera.current?.startRecording({
                onRecordingFinished: async (video) => {
                    const path = video.path;

                    if (path) {
                        await handleDownloadAndCallback(path);
                    }
                },
                onRecordingError: (_error) => {
                    setIsRecording(false);
                    setIsPaused(false);
                },
            });
            setIsRecording(true);
        } catch (error: any) {
            showToast(error);
        }
    }, [handleDownloadAndCallback]);

    const stopRecord = useCallback(async () => {
        try {
            await camera.current?.stopRecording();
            setIsRecording(false);
            setIsPaused(false);
        } catch (error) {
            showToast('Lỗi khi dừng quay video');
        }
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                setIsCameraActive(true);
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                stopRecord();
                setIsCameraActive(false);
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        const id = setInterval(async () => {
            const fs = await RNFS.getFSInfo();
            if (fs.freeSpace < MIN_FREE_SPACE_STOP) {
                stopRecord();
                showToast('Không đủ dung lượng bộ nhớ');
            }
        }, 30_000);

        return () => clearInterval(id);
    }, []);

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

    useFocusEffect(
        useCallback(() => {
            KeepAwake.activate();
            setIsCameraActive(true);

            const autoRecord = route?.params?.autoRecord;
            if (autoRecord && !isRecording && device) {
                setTimeout(() => {
                    startRecord();
                }, 500);
            }

            return () => {
                KeepAwake.deactivate();
                setIsCameraActive(false);
                if (isRecording) {
                    cancelRecord();
                }
            };
        }, [route?.params?.autoRecord])
    );

    useEffect(() => {
        if (!orderStore?.drumNo) {
            return;
        }

        const fetchRunningData = async () => {
            try {
                const res = await getData('portal/inject/getRunning', { drumNo: orderStore.drumNo }, true, orderStore?.config?.serverIp + ':' + orderStore?.config?.port);
                if (res.code === 0 && res.data?.process?.dtl) {
                    const { dtl, ...processWithoutDtl } = res.data.process;

                    await Promise.all([
                        setOrderStore({
                            process: processWithoutDtl,
                            currentTime: res.data?.curentTime,
                            config: res.data?.config,
                            appInjectPause: res.data?.appInjectPause,
                        }),
                        setBatchsStore(dtl),
                    ]);
                }
            } catch (error) {
                console.log('Error fetching running data:', error);
            }
        };

        fetchRunningData();

        const intervalMs = 10 * 1000;
        const interval = setInterval(fetchRunningData, intervalMs);

        return () => clearInterval(interval);
    }, [getData, setBatchsStore, setOrderStore]);

    if (device == null) {
        return (
            <ViewContainer>
                <ViewHeader />
                <ViewBox className="flex-1 items-center justify-center" gap="md">
                    <ActivityIndicator size="large" color="#3D8417" />
                    <Text >
                        Đang tải camera...
                    </Text>
                </ViewBox>
            </ViewContainer>
        );
    }

    return (
        <ViewContainer>
            <Camera
                key={cameraKey}
                ref={camera}
                style={StyleSheet.absoluteFill}
                isActive={isCameraActive}
                device={device}
                format={format}
                videoStabilizationMode={stabilizationMode}
                video={true}
                audio={false}
                zoom={zoom}
            />
            <ViewBox background={'transparent'} className="flex-1">
                <ViewBox className="flex-1">
                    <ViewBox className="flex-1 relative">
                        {isRecording && (
                            <VideoHeader
                                status={
                                    (isPaused && isRecording) ? 'paused' : (!isPaused && !isRecording) ? 'stopped' : 'recording'
                                } />
                        )}

                        <ViewBox className="absolute top-12 right-7 flex-row" gap="sm">
                            <ViewBox background="blurBlack" padding="sm" radius="full" className="w-12 h-12 items-center justify-center">
                                <MaterialCommunityIcons name="cog-outline" size={24} color="white" />
                            </ViewBox>
                            <ViewBox background="blurBlack" padding="sm" radius="full" className="w-12 h-12 items-center justify-center">
                                <MaterialCommunityIcons name="layers-outline" size={24} color="white" />
                            </ViewBox>
                        </ViewBox>

                        <ViewBox radius={'xxxl'} background={'blurBlack'} className="absolute right-4 top-1/3 -translate-y-1/2 items-center" gap="md">
                            <Pressable onPress={handleZoomIn}>
                                <ViewBox padding="sm" className="w-14 h-14 items-center justify-center">
                                    <MaterialCommunityIcons name="plus" size={24} color="white" />
                                </ViewBox>
                            </Pressable>
                            <ViewBox className="bg-[#4e4e4e] h-px w-[80%]" />
                            <Pressable onPress={handleZoomOut}>
                                <ViewBox padding="sm" className="w-14 h-14 items-center justify-center">
                                    <MaterialCommunityIcons name="minus" size={24} color="white" />
                                </ViewBox>
                            </Pressable>
                        </ViewBox>

                        <ViewBox className="absolute bottom-4 left-4 right-4">
                            <ViewBox radius="xxxl" background={'blurBlack'}>
                                <ViewBox padding="md">
                                    <Text variant="sectionTitleSemibold" color="brightGreen">
                                        CHEMICAL MONITORING
                                    </Text>
                                    <Text variant="labelSmall" className="text-[#858585]">
                                        Active scan: {batchsStore.filter((batch: any) => batch.isAppend).length} compounds detected
                                    </Text>
                                </ViewBox>

                                <ViewBox className="h-px bg-[#4e4e4e]" />

                                <ScrollView
                                    style={styles.scrollContainer}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.scrollContent}
                                >
                                    {currentChemicals?.map((chemical: any, index: number) => (
                                        <ViewBox key={index} className="flex-row items-center justify-between py-2">
                                            <ViewBox className="flex-row items-center flex-1" gap="sm">
                                                <ViewBox
                                                    padding="xs"
                                                    radius="xxxl"
                                                    className={`w-14 h-14 items-center justify-center ${chemical.isAppend ? 'bg-[#225E42]' : 'bg-[#bf342a8f]'
                                                        }`}
                                                >
                                                    {mapIcon[(chemical.autoFeed === true && chemical.isAppend === true) ? 'bag' : chemical.isAppend === true ? 'flask' : 'alert']}
                                                </ViewBox>
                                                <ViewBox className="flex-1">
                                                    <ViewBox className="flex-row items-center gap-2">
                                                        <Text color="white" variant="sectionTitleMedium">
                                                            {chemical.processCode} | {chemical.materialName}
                                                        </Text>
                                                    </ViewBox>
                                                    <ViewBox className="flex-row items-center gap-2">
                                                        <Text className="text-[#858585]" variant="label">
                                                            {chemical.actualWeight}kg | {chemical.percent}%
                                                        </Text>
                                                    </ViewBox>
                                                </ViewBox>
                                            </ViewBox>
                                            <ViewBox className={`w-2 h-2 rounded-full ${chemical.isAppend ? 'bg-[#12F28A]' : 'bg-[#FF5152]'
                                                }`} />
                                        </ViewBox>
                                    )) || (
                                            <Text variant="caption">
                                                No chemicals data available
                                            </Text>
                                        )}
                                </ScrollView>
                            </ViewBox>
                        </ViewBox>

                        {/* <ViewBox className="absolute right-4 bottom-1/3">
                            <ViewBox background="black" padding="sm" radius="full" className="opacity-80 w-10 h-10 items-center justify-center">
                                <MaterialCommunityIcons name="target" size={20} color="white" />
                            </ViewBox>
                        </ViewBox> */}
                    </ViewBox>

                    <ViewBox padding="lg" gap="md">
                        {/* {!isRecording ? (
                            <ViewBox gap="md">
                                <Button
                                    radius="xl"
                                    onPress={startRecord}
                                    className="border-red-500 border w-full bg-[#bf342a8f] flex-row items-center justify-center"
                                    size="lg"
                                    iconPosition="left"
                                >
                                    <MaterialCommunityIcons name="play-circle-outline" size={24} color="red" />
                                    <Text variant="labelStrong" className="text-[#E85656]">
                                        Bắt đầu ghi
                                    </Text>
                                </Button>
                            </ViewBox>
                        ) : ( */}
                        <ViewBox gap="md">
                            <Button
                                radius="xl"
                                onPress={stopRecord}
                                className="border-red-500 border w-full bg-[#bf342a8f] flex-row items-center justify-center"
                                size="lg"
                                iconPosition="left"
                                disabled={!isRecording}
                            >
                                <MaterialCommunityIcons name="stop-circle-outline" size={24} color="red" />
                                <Text variant="labelStrong" className="text-[#E85656]">
                                    Dừng ghi
                                </Text>
                            </Button>
                        </ViewBox>
                        {/* )} */}
                    </ViewBox>
                </ViewBox>
            </ViewBox >
        </ViewContainer >
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        maxHeight: 550,
    },
    scrollContent: {
        padding: 16,
        gap: 8,
    },
});

export default Video;
