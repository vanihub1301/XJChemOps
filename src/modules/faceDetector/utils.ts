import type { DetectedFace } from './types';

export interface FaceQualityResult {
    isGood: boolean;
    message: string;
    details?: {
        faceCount: number;
        size?: { width: number; height: number };
        angles?: { yaw: number; pitch: number; roll: number };
    };
}

export interface FaceValidationOptions {
    screenWidth: number;

    /**
     * Minimum face size as percentage of screen width (0-1)
     * @default 0.3
     */
    minFaceSizeRatio?: number;

    /**
     * Maximum allowed yaw angle (head turning left/right)
     * @default 20
     */
    maxYawAngle?: number;

    /**
     * Maximum allowed pitch angle (head tilting up/down)
     * @default 20
     */
    maxPitchAngle?: number;

    /**
     * Allow multiple faces
     * @default false
     */
    allowMultipleFaces?: boolean;
}

export const validateFaceQuality = (
    faces: DetectedFace[],
    options: FaceValidationOptions
): FaceQualityResult => {
    const {
        screenWidth,
        minFaceSizeRatio = 0.3,
        maxYawAngle = 20,
        maxPitchAngle = 20,
        allowMultipleFaces = false,
    } = options;

    if (faces.length === 0) {
        return {
            isGood: false,
            message: 'Không phát hiện khuôn mặt',
            details: { faceCount: 0 },
        };
    }

    if (faces.length > 1 && !allowMultipleFaces) {
        return {
            isGood: false,
            message: `Phát hiện ${faces.length} khuôn mặt`,
            details: { faceCount: faces.length },
        };
    }

    const face = faces[0];
    const faceWidth = face.bounds.width;
    const faceHeight = face.bounds.height;
    const yawAngle = Math.abs(face.yawAngle);
    const pitchAngle = Math.abs(face.pitchAngle);
    const rollAngle = Math.abs(face.rollAngle);

    const minSize = screenWidth * minFaceSizeRatio;

    if (faceWidth < minSize || faceHeight < minSize) {
        return {
            isGood: false,
            message: 'Khuôn mặt quá nhỏ, hãy đến gần hơn',
            details: {
                faceCount: 1,
                size: { width: faceWidth, height: faceHeight },
                angles: { yaw: yawAngle, pitch: pitchAngle, roll: rollAngle },
            },
        };
    }

    if (yawAngle > maxYawAngle) {
        return {
            isGood: false,
            message: 'Hãy nhìn thẳng vào camera (không quay trái/phải)',
            details: {
                faceCount: 1,
                size: { width: faceWidth, height: faceHeight },
                angles: { yaw: yawAngle, pitch: pitchAngle, roll: rollAngle },
            },
        };
    }

    if (pitchAngle > maxPitchAngle) {
        return {
            isGood: false,
            message: 'Hãy nhìn thẳng vào camera (không ngẩng/cúi đầu)',
            details: {
                faceCount: 1,
                size: { width: faceWidth, height: faceHeight },
                angles: { yaw: yawAngle, pitch: pitchAngle, roll: rollAngle },
            },
        };
    }

    return {
        isGood: true,
        message: 'Khuôn mặt phù hợp',
        details: {
            faceCount: 1,
            size: { width: faceWidth, height: faceHeight },
            angles: { yaw: yawAngle, pitch: pitchAngle, roll: rollAngle },
        },
    };
};

export const checkEyesOpen = (
    face: DetectedFace,
    threshold = 0.5
): {
    bothOpen: boolean;
    leftOpen: boolean;
    rightOpen: boolean;
    leftProbability: number;
    rightProbability: number;
} => {
    const leftProbability = face.leftEyeOpenProbability ?? -1;
    const rightProbability = face.rightEyeOpenProbability ?? -1;

    if (leftProbability === -1 || rightProbability === -1) {
        console.warn(
            '[checkEyesOpen] Eye open probability not available. ' +
            'Make sure classificationMode is set to "all"'
        );
        return {
            bothOpen: true,
            leftOpen: true,
            rightOpen: true,
            leftProbability: -1,
            rightProbability: -1,
        };
    }

    const leftOpen = leftProbability > threshold;
    const rightOpen = rightProbability > threshold;

    return {
        bothOpen: leftOpen && rightOpen,
        leftOpen,
        rightOpen,
        leftProbability,
        rightProbability,
    };
};

export const checkSmiling = (
    face: DetectedFace,
    threshold = 0.7
): boolean => {
    const smilingProbability = face.smilingProbability ?? -1;

    if (smilingProbability === -1) {
        console.warn(
            '[checkSmiling] Smiling probability not available. ' +
            'Make sure classificationMode is set to "all"'
        );
        return false;
    }

    return smilingProbability > threshold;
};

export const getLargestFace = (
    faces: DetectedFace[]
): DetectedFace | null => {
    if (faces.length === 0) {
        return null;
    }

    return faces.reduce((largest, current) => {
        const currentSize = current.bounds.width * current.bounds.height;
        const largestSize = largest.bounds.width * largest.bounds.height;
        return currentSize > largestSize ? current : largest;
    });
};

export const getFaceCenter = (
    face: DetectedFace
): { x: number; y: number } => {
    return {
        x: face.bounds.x + face.bounds.width / 2,
        y: face.bounds.y + face.bounds.height / 2,
    };
};

export const isFaceInRegion = (
    face: DetectedFace,
    region: { x: number; y: number; width: number; height: number }
): boolean => {
    const faceCenter = getFaceCenter(face);

    return (
        faceCenter.x >= region.x &&
        faceCenter.x <= region.x + region.width &&
        faceCenter.y >= region.y &&
        faceCenter.y <= region.y + region.height
    );
};

export const formatFaceAngles = (face: DetectedFace): string => {
    return `Yaw: ${face.yawAngle.toFixed(1)}°, Pitch: ${face.pitchAngle.toFixed(1)}°, Roll: ${face.rollAngle.toFixed(1)}°`;
};
