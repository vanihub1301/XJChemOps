export interface FaceDetectorOptions {
    /**
     * Performance mode: 'fast' | 'accurate'
     * @default 'fast'
     */
    performanceMode?: 'fast' | 'accurate';

    /**
     * Landmark mode: 'none' | 'all'
     * Detect facial landmarks like eyes, nose, mouth
     * @default 'none'
     */
    landmarkMode?: 'none' | 'all';

    /**
     * Classification mode: 'none' | 'all'
     * Classify smiling and eyes open probability
     * @default 'none'
     */
    classificationMode?: 'none' | 'all';

    /**
     * Contour mode: 'none' | 'all'
     * Detect face contours
     * @default 'none'
     */
    contourMode?: 'none' | 'all';

    /**
     * Minimum face size relative to image
     * @default 0.15
     */
    minFaceSize?: number;

    /**
     * Enable face tracking across frames
     * @default false
     */
    trackingEnabled?: boolean;

    /**
     * Auto scaling mode for coordinates
     * @default false
     */
    autoMode?: boolean;

    /**
     * Window width for auto scaling
     */
    windowWidth?: number;

    /**
     * Window height for auto scaling
     */
    windowHeight?: number;

    /**
     * Camera facing: 'front' | 'back'
     * @default 'front'
     */
    cameraFacing?: 'front' | 'back';
}

export interface Point {
    x: number;
    y: number;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface FaceLandmarks {
    LEFT_CHEEK?: Point;
    LEFT_EAR?: Point;
    LEFT_EYE?: Point;
    MOUTH_BOTTOM?: Point;
    MOUTH_LEFT?: Point;
    MOUTH_RIGHT?: Point;
    NOSE_BASE?: Point;
    RIGHT_CHEEK?: Point;
    RIGHT_EAR?: Point;
    RIGHT_EYE?: Point;
}

export interface FaceContours {
    FACE?: Point[];
    LEFT_CHEEK?: Point[];
    LEFT_EYE?: Point[];
    LEFT_EYEBROW_BOTTOM?: Point[];
    LEFT_EYEBROW_TOP?: Point[];
    LOWER_LIP_BOTTOM?: Point[];
    LOWER_LIP_TOP?: Point[];
    NOSE_BOTTOM?: Point[];
    NOSE_BRIDGE?: Point[];
    RIGHT_CHEEK?: Point[];
    RIGHT_EYE?: Point[];
    RIGHT_EYEBROW_BOTTOM?: Point[];
    RIGHT_EYEBROW_TOP?: Point[];
    UPPER_LIP_BOTTOM?: Point[];
    UPPER_LIP_TOP?: Point[];
}

export interface DetectedFace {
    /**
     * Bounding box around the face
     */
    bounds: BoundingBox;

    /**
     * Face rotation around Z-axis (head tilt)
     */
    rollAngle: number;

    /**
     * Face rotation around X-axis (head pitch - looking up/down)
     */
    pitchAngle: number;

    /**
     * Face rotation around Y-axis (head yaw - looking left/right)
     */
    yawAngle: number;

    /**
     * Face landmarks (only if landmarkMode is 'all')
     */
    landmarks?: FaceLandmarks;

    /**
     * Face contours (only if contourMode is 'all')
     */
    contours?: FaceContours;

    /**
     * Left eye open probability (only if classificationMode is 'all')
     * Value from 0.0 to 1.0, or -1 if not available
     */
    leftEyeOpenProbability?: number;

    /**
     * Right eye open probability (only if classificationMode is 'all')
     * Value from 0.0 to 1.0, or -1 if not available
     */
    rightEyeOpenProbability?: number;

    /**
     * Smiling probability (only if classificationMode is 'all')
     * Value from 0.0 to 1.0, or -1 if not available
     */
    smilingProbability?: number;

    /**
     * Tracking ID (only if trackingEnabled is true)
     */
    trackingId?: number;
}
