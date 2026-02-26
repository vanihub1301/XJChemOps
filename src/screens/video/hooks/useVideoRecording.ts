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
    fentryids?: string[],
) => {
    const [isRecording, setIsRecording] = useState(false);
    const { markSaved, markIdle, setVideoUploadPayload } = useVideoStore();

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
            await CameraRoll.save(`file://${videoPath}`, {
                type: 'video',
            });

            if (fentryids) { setVideoUploadPayload(fentryids); }
            markSaved(`file://${videoPath}`);
            navigation.goBack();
        } catch (error) {
            showToast('Lỗi khi lưu video');
        }
    }, [navigation, fentryids, setVideoUploadPayload, markSaved]);

    const startRecord = useCallback(async () => {
        try {
            const fsInfo = await RNFS.getFSInfo();
            if (fsInfo.freeSpace < MIN_FREE_SPACE) {
                showToast('Không đủ dung lượng bộ nhớ');
                return;
            }
            await camera.current?.startRecording({
                fileType: 'mp4',
                onRecordingFinished: async (video) => {
                    const path = video.path;

                    if (path) {
                        await handleDownloadAndCallback(path);
                    }
                },
                onRecordingError: (error) => {
                    console.log('LOG : Video : onRecordingError:', error);
                    setIsRecording(false);
                    showToast('Video đã dừng do gián đoạn hệ thống');
                    navigation.goBack();
                },
            });
            setIsRecording(true);
        } catch (error: any) {
            showToast(error.message);
        }
    }, [handleDownloadAndCallback]);

    const stopRecord = useCallback(async () => {
        try {
            await camera.current?.stopRecording();
            setIsRecording(false);
        } catch (error) {
            showToast('Lỗi khi dừng quay video');
        }
    }, [camera]);

    const forceStopRecord = useCallback(async () => {
        try {
            await camera.current?.stopRecording();
            setIsRecording(false);
        } catch (error: any) {
            console.log('LOG : Video : error:', error);
            showToast('Lỗi dừng video, hoặc đã dừng từ trước');
            setIsRecording(false);
            navigation.goBack();
        }
    }, [navigation]);

    return {
        isRecording,
        setIsRecording,
        startRecord,
        stopRecord,
        forceStopRecord,
        cancelRecord,
    };
};
