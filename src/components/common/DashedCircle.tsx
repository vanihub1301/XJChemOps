import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
};

const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const DashedCircle = ({ children }) => {
    const size = 200;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const dash = radius * 0.4;
    const gap = radius * 0.7;
    const separation = strokeWidth * 0.6;

    const strokeColor = '#6165EE';

    const notchCenter = 100;
    const notchSize = 100;

    const notchStart = notchCenter - notchSize / 2;
    const notchEnd = notchCenter + notchSize / 2;

    const mainArc = describeArc(
        center,
        center,
        radius,
        notchEnd + separation,
        notchStart + 360 - separation
    );

    const notchArc = describeArc(
        center,
        center,
        radius,
        notchStart + separation,
        notchEnd - separation
    );
    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                <Path
                    d={mainArc}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                <Path
                    d={notchArc}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${dash} ${gap}`}
                    strokeLinecap="round"
                    opacity={0.6}
                />
            </Svg>

            <View style={styles.childrenContainer}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    childrenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default DashedCircle;
