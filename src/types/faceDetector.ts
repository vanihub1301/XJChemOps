export interface FaceBounds {
    x: number;
    y: number;
    width: number;
    height: number;
    boundingCenterX: number;
    boundingCenterY: number;
    boundingExactCenterX: number;
    boundingExactCenterY: number;
}

export interface FaceContourPoint {
    x: number;
    y: number;
}

export interface FaceContours {
    FACE: FaceContourPoint[];
    LEFT_EYEBROW_TOP: FaceContourPoint[];
    LEFT_EYEBROW_BOTTOM: FaceContourPoint[];
    RIGHT_EYEBROW_TOP: FaceContourPoint[];
    RIGHT_EYEBROW_BOTTOM: FaceContourPoint[];
    LEFT_EYE: FaceContourPoint[];
    RIGHT_EYE: FaceContourPoint[];
    UPPER_LIP_TOP: FaceContourPoint[];
    UPPER_LIP_BOTTOM: FaceContourPoint[];
    LOWER_LIP_TOP: FaceContourPoint[];
    LOWER_LIP_BOTTOM: FaceContourPoint[];
    NOSE_BRIDGE: FaceContourPoint[];
    NOSE_BOTTOM: FaceContourPoint[];
    LEFT_CHEEK: FaceContourPoint[];
    RIGHT_CHEEK: FaceContourPoint[];
}

export interface DetectedFace {
    rollAngle: number;
    pitchAngle: number;
    yawAngle: number;
    leftEyeOpenProbability: number;
    rightEyeOpenProbability: number;
    smilingProbability: number;
    bounds: FaceBounds;
    contours: FaceContours;
}
