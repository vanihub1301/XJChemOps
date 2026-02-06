import { NativeModules } from 'react-native';
import { VisionCameraProxy } from 'react-native-vision-camera';
import type { Frame } from 'react-native-vision-camera';
import type { DetectedFace, FaceDetectorOptions } from './types';

interface ImageFaceDetectorModule {
    detectFaces(
        uri: string,
        options?: FaceDetectorOptions
    ): Promise<DetectedFace[]>;
}

const { ImageFaceDetector } = NativeModules;

if (!ImageFaceDetector) {
    throw new Error(
        'ImageFaceDetector native module is not available. ' +
        'Make sure VisionCameraFaceDetectorPluginPackage is added to MainApplication.kt'
    );
}

const frameProcessorPlugin = VisionCameraProxy.initFrameProcessorPlugin('detectFaces', {});

export const detectFacesInImage = async (
    uri: string,
    options?: FaceDetectorOptions
): Promise<DetectedFace[]> => {
    try {
        const result = await (ImageFaceDetector as ImageFaceDetectorModule).detectFaces(
            uri,
            options
        );
        return result || [];
    } catch (error) {
        console.error('[FaceDetector] Error detecting faces in image:', error);
        return [];
    }
};

export const detectFacesInFrame = (
    frame: Frame,
    options?: FaceDetectorOptions
): DetectedFace[] => {
    'worklet';

    if (!frameProcessorPlugin) {
        return [];
    }

    try {
        const result = frameProcessorPlugin.call(frame, options as any || {}) as unknown as DetectedFace[];
        return result || [];
    } catch (error) {
        return [];
    }
};

export default ImageFaceDetector as ImageFaceDetectorModule;
