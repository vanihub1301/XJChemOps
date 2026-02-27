import { useState, useCallback, useEffect, useRef } from 'react';
import { useVideoStore } from '../../../store/videoStore';
import { useAPI } from '../../../service/api';
import { useAuthStore } from '../../../store/authStore';
import { useOperationStore } from '../../../store/operationStore';
import { showToast } from '../../../service/toast';
import { uploadFile } from '../../../service/axios';
import RNFS from 'react-native-fs';

export const useVideoUpload = () => {
    const [videoUploading, setVideoUploading] = useState(false);
    const { videoStatus, videoPath, fentryids, markIdle } = useVideoStore();
    const { getData, putData } = useAPI();
    const { fullName } = useAuthStore();
    const { currentChemicals, setMany: setManyOperation } = useOperationStore();

    const currentChemicalsRef = useRef(currentChemicals);
    useEffect(() => { currentChemicalsRef.current = currentChemicals; }, [currentChemicals]);

    const handleUploadVideo = useCallback(async (path: string) => {
        try {
            setVideoUploading(true);
            const payloadFentryids = fentryids?.length > 0
                ? fentryids
                : currentChemicalsRef.current.map(i => i.id);

            const presignedUrl = await getData('portal/inject/video-url');
            if (!presignedUrl) {
                showToast('Không lấy được link upload');
                return;
            }

            const uploadRes = await uploadFile(path, presignedUrl);

            if (uploadRes?.status !== 200) {
                showToast('Video đã được ghi thất bại');
                return;
            }

            showToast('Video đã được ghi thành công');

            const videoPathOnServer = presignedUrl.split('/videos/')[1].split('?')[0];

            const updateRes = await putData('portal/inject/updateBatch', {
                employee: fullName || 'ADMIN',
                videoFk: videoPathOnServer,
                fentryid: payloadFentryids,
            });

            if (updateRes?.code === 0) {
                const isLastGroupUploaded = useOperationStore.getState().isLastGroupUploaded;
                console.log('LOG : useVideoUpload : isLastGroupUploaded:', isLastGroupUploaded)

                if (isLastGroupUploaded) {
                    setManyOperation({
                        isLastGroupUploadSuccess: true,
                    });
                }
                showToast('Cập nhật video thành công');
            } else {
                showToast('Cập nhật video thất bại ' + updateRes?.msg);
            }
        } catch (err) {
            showToast('Cập nhật video thất bại');
        } finally {
            markIdle();
            setVideoUploading(false);
            try {
                const pathWithoutFile = path.replace('file://', '');
                const exists = await RNFS.exists(pathWithoutFile);
                if (exists) {
                    await RNFS.unlink(pathWithoutFile);
                }
            } catch (e) {
                console.log('LOG : useVideoUpload : cleanup temp file error', e);
            }
        }
    }, [fullName]);

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
