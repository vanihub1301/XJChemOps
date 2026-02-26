import { useState, useCallback, useEffect, useRef } from 'react';
import { useVideoStore } from '../../../store/videoStore';
import { useAPI } from '../../../service/api';
import { useAuthStore } from '../../../store/authStore';
import { useOperationStore } from '../../../store/operationStore';
import { showToast } from '../../../service/toast';
import { uploadFile } from '../../../service/axios';

export const useVideoUpload = () => {
    const [videoUploading, setVideoUploading] = useState(false);
    const { videoStatus, videoPath, markIdle } = useVideoStore();
    const { getData, putData } = useAPI();
    const { fullName } = useAuthStore();
    const { currentChemicals } = useOperationStore();

    const currentChemicalsRef = useRef(currentChemicals);
    useEffect(() => { currentChemicalsRef.current = currentChemicals; }, [currentChemicals]);

    const handleUploadVideo = useCallback(async (videoPath: string) => {
        try {
            setVideoUploading(true);
            console.log('LOG : Operation : currentChemicals:', currentChemicalsRef.current)
            const fentryid = currentChemicalsRef.current.map(i => i.id);

            const presignedUrl = await getData('portal/inject/video-url');
            if (!presignedUrl) {
                showToast('Không lấy được link upload');
                return;
            }

            const uploadRes = await uploadFile(videoPath, presignedUrl);

            if (uploadRes?.status !== 200) {
                showToast('Video đã được ghi thất bại');
                return;
            }

            showToast('Video đã được ghi thành công');

            const videoPathOnServer = presignedUrl.split('/videos/')[1].split('?')[0];

            const updateRes = await putData('portal/inject/updateBatch', {
                employee: fullName || 'NGUYỄN THỊ THOẢNG',
                videoFk: videoPathOnServer,
                fentryid: fentryid,
            });

            if (updateRes?.code === 0) {
                showToast('Cập nhật video thành công');
            } else {
                showToast('Cập nhật video thất bại ' + updateRes?.msg);
            }
        } catch (err) {
            showToast('Cập nhật video thất bại');
        } finally {
            markIdle();
            setVideoUploading(false);
        }
    }, []);

    useEffect(() => {
        const handler = async () => {
            if (videoStatus === 'saved' && videoPath) {
                await handleUploadVideo(videoPath);
            }
        };
        handler();
    }, [videoStatus, videoPath]);

    return { videoUploading };
};
