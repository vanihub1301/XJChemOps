import React from 'react';
import { ViewBox, TypeBox } from './ViewBox';
import { Text, TypeText } from './Text';

interface PillBadgeProps {
    label: string;
    background?: TypeBox['background'];
    padding?: TypeBox['padding'];
    radius?: TypeBox['radius'];
    textColor?: TypeText['color'];
    className?: string;
    icon?: React.ReactNode;
}

const PillBadge: React.FC<PillBadgeProps> = ({
    label,
    background = 'blue',
    textColor = 'blue',
    className = 'px-3 py-1.5 flex-row items-center gap-1',
    padding = 'sm',
    radius = 'xxl',
    icon,
}) => {
    return (
        <ViewBox
            className={className}
            padding={padding}
            radius={radius}
            background={background}
        >
            {icon}
            <Text color={textColor} variant={'captionSemibold'}>
                {label}
            </Text>
        </ViewBox>
    );
};

export default PillBadge;
