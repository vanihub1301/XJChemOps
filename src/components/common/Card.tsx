import { ViewBox, TypeBox } from './ViewBox';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    padding?: TypeBox['padding'];
    radius?: TypeBox['radius'];
    gap?: TypeBox['gap'];
    background?: TypeBox['background'];
    border?: TypeBox['border'];
    className?: string;
    style?: StyleProp<ViewStyle>;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    radius = 'xxl',
    gap = 'md',
    background = 'white',
    border = 'default',
    ...res
}) => {
    return (
        <ViewBox
            gap={gap}
            padding={padding}
            radius={radius}
            className={`${className}`}
            background={background}
            border={border}
            {...res}
        >
            {children}
        </ViewBox >
    );
};

export default Card;
