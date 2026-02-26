import { useState, useCallback } from 'react';
import { Camera } from 'react-native-vision-camera';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import { useVideoStore } from '../../../store/videoStore';
import { MIN_FREE_SPACE } from '../../../constants/ui';
import { showToast } from '../../../service/toast';

export const useVideoRecording = (
    camera: React.RefObject<Camera>,
    navigation: any,
) => {
    const [isRecording, setIsRecording] = useState(false);
    const { markSaved, markIdle } = useVideoStore();

    const cancelRecord = useCallback(async () => {
        try {
            if (camera.current) {
                await camera.current.cancelRecording();
                setIsRecording(false);
            }
        } catch (error: any) {
            showToast(error.message);
        } finally {
            markIdle();
        }
    }, []);

    const handleDownloadAndCallback = useCallback(async (videoPath: string) => {
        try {
            const asset = await CameraRoll.save(`file://${videoPath}`, {
                type: 'video',
            });
            await RNFS.unlink(videoPath);

            markSaved(asset);
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
                },
            });
            setIsRecording(true);
        } catch (error: any) {
            showToast(error.message);
        }
    }, [handleDownloadAndCallback]);

    const stopRecord = useCallback(async (recordingTime: number, inspectionTime: string | number) => {
        try {
            if (recordingTime < Number(inspectionTime)) {
                showToast('Video tối thiểu ' + inspectionTime + ' giây');
                return;
            }
            await camera.current?.stopRecording();
            setIsRecording(false);
        } catch (error) {
            showToast('Lỗi khi dừng quay video');
        }
    }, []);

    const forceStopRecord = useCallback(async () => {
        try {
            await camera.current?.stopRecording();
            setIsRecording(false);
        } catch (error: any) {
            console.log('LOG : Video : error:', error);
            showToast(error.message);
        }
    }, []);

    return {
        isRecording,
        setIsRecording,
        startRecord,
        stopRecord,
        forceStopRecord,
        cancelRecord,
    };
};
