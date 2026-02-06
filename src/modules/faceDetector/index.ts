export { detectFacesInImage, detectFacesInFrame } from './FaceDetector';
export {
    validateFaceQuality,
    checkEyesOpen,
    checkSmiling,
    getLargestFace,
    getFaceCenter,
    isFaceInRegion,
    formatFaceAngles,
} from './utils';
export type {
    FaceDetectorOptions,
    DetectedFace,
    Point,
    BoundingBox,
    FaceLandmarks,
    FaceContours,
} from './types';
export type {
    FaceQualityResult,
    FaceValidationOptions,
} from './utils';
