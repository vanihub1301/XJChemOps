import React, { useCallback, useRef } from 'react';
import ViewContainer from '../../components/common/ViewContainer';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import ViewHeader from '../../components/common/ViewHeader';
import { Text } from '../../components/common/Text';
import { ActivityIndicator, StyleSheet, Pressable, ScrollView } from 'react-native';
import { ViewBox } from '../../components/common/ViewBox';
import { Button } from '../../components/common/Button';
import VideoHeader from './VideoHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import { useOperationStore } from '../../store/operationStore';
import { Chemical } from '../../types/drum';
import { useSettingStore } from '../../store/settingStore';
import { useVideoRecording } from './hooks/useVideoRecording';
import { useCameraSetup } from './hooks/useCameraSetup';
import { useVideoTimer } from './hooks/useVideoTimer';

interface VideoProps {
    navigation: any;
    route?: {
        params?: {
            onVideoRecorded?: (videoPath: string) => void;
            autoRecord?: boolean;
            chemicals?: Chemical[];
            videoDurationSeconds?: number;
        };
    };
}

const Video = ({ navigation, route }: VideoProps) => {
    const { batchsStore, maxDuration } = useOperationStore();
    const { inspectionTime } = useSettingStore();
    const chemicals: Chemical[] = route?.params?.chemicals ?? [];

    const mapIcon = {
        flask: <MaterialCommunityIcons name="flask" size={28} color="#26F073" />,
        water: <MaterialIcons name="water-drop" size={28} color="#26F073" />,
        alert: <MaterialCommunityIcons name="alert" size={28} color="red" />,
        bag: <MaterialCommunityIcons name="iv-bag" size={28} color="#26F073" />,
    };

    const device = useCameraDevice('front');
    const format = useCameraFormat(device, [
        { videoResolution: { width: 1280, height: 720 } },
        { videoStabilizationMode: 'cinematic-extended' },
    ]);

    const camera = useRef<Camera>(null);

    const supportsVideoStabilization = format?.videoStabilizationModes.includes('cinematic-extended');
    const stabilizationMode = supportsVideoStabilization ? 'cinematic-extended' : undefined;

    const {
        isRecording,
        startRecord,
        stopRecord: stopRecordHook,
        forceStopRecord,
        cancelRecord,
    } = useVideoRecording(camera, navigation);

    const {
        isCameraActive,
        setIsCameraActive,
        cameraKey,
        zoom,
        handleZoomIn,
        handleZoomOut,
    } = useCameraSetup(navigation, device, forceStopRecord);

    const { recordingTime } = useVideoTimer(
        isRecording,
        forceStopRecord,
        maxDuration,
        route?.params?.videoDurationSeconds
    );

    const stopRecord = useCallback(() => {
        stopRecordHook(recordingTime, inspectionTime);
    }, [recordingTime, inspectionTime]);

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
                            <VideoHeader />
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
                                        Active scan: {batchsStore.filter((batch: Chemical) => batch.scanning).length} compounds detected
                                    </Text>
                                </ViewBox>
                                <ViewBox className="h-px bg-[#4e4e4e]" />
                                <ScrollView
                                    style={styles.scrollContainer}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.scrollContent}
                                >
                                    {chemicals?.map((chemical: Chemical, index: number) => (
                                        <ViewBox key={index} className="flex-row items-center justify-between py-2">
                                            <ViewBox className="flex-row items-center flex-1" gap="sm">
                                                <ViewBox
                                                    padding="xs"
                                                    radius="xxxl"
                                                    className={`w-14 h-14 items-center justify-center ${chemical.scanning ? 'bg-[#225E42]' : 'bg-[#bf342a8f]'
                                                        }`}
                                                >
                                                    {mapIcon[(chemical.autoFeed === true && chemical.scanning === true) ? 'bag' : chemical.scanning === true ? 'flask' : 'alert']}
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
                                            <ViewBox className={`w-2 h-2 rounded-full ${chemical.scanning ? 'bg-[#12F28A]' : 'bg-[#FF5152]'
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
                    </ViewBox>

                    <ViewBox padding="lg" gap="md">
                        <ViewBox gap="md">
                            <Button
                                radius="xl"
                                onPress={stopRecord}
                                className="w-full flex-row items-center justify-center"
                                size="lg"
                                iconPosition="left"
                                disabled={!isRecording}
                                variant="danger"
                            >
                                <MaterialCommunityIcons name="stop-circle-outline" size={24} color="red" />
                                <Text variant="labelStrong" className="text-[#E85656]">
                                    Dừng ghi
                                </Text>
                            </Button>
                        </ViewBox>
                    </ViewBox>
                </ViewBox>
            </ViewBox >
        </ViewContainer >
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        // maxHeight: 550,
        maxHeight: "50%",
    },
    scrollContent: {
        padding: 16,
        gap: 8,
    },
});

export default Video;
