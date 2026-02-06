import React, { useMemo } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from 'react-native-heroicons/solid';
import { Text } from '../common/Text';
import { HUDType } from '../../types/hud';

interface HUDProps {
    onClose?: () => void;
    type?: HUDType;
    message?: string;
    duration?: number;
    showCloseButton?: boolean;
}

const HUD = ({ onClose, type = 'success', message = 'Success', duration = 1500, showCloseButton = false }: HUDProps) => {
    const scale = React.useRef(new Animated.Value(0.8)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;

    const hudConfig = {
        success: {
            icon: <CheckCircleIcon size={40} color="white" />,
        },
        error: {
            icon: <ExclamationCircleIcon size={40} color="white" />,
        },
        warning: {
            icon: <ExclamationTriangleIcon size={40} color="white" />,
        },
        info: {
            icon: <InformationCircleIcon size={40} color="white" />,
        },
    };

    const config = hudConfig[type] || hudConfig.success;

    const handleClose = React.useCallback(() => {
        Animated.parallel([
            Animated.timing(scale, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose?.();
        });
    }, [scale, opacity, onClose]);

    const animate = React.useCallback(() => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(() => {
            handleClose();
        }, duration);
    }, [scale, opacity, duration, handleClose]);

    React.useEffect(() => {
        animate();
    }, [animate]);

    const animatedStyle = useMemo(() => ({
        opacity,
    }), [opacity]);

    return (
        <Animated.View
            style={[styles.container, animatedStyle]}
        >
            <Animated.View style={[styles.backdrop, { opacity }]} />
            <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
                {config.icon}
                <Text color={'white'} variant={'labelStrong'} className="text-center mt-2">
                    {message}
                </Text>
                {showCloseButton && (
                    <TouchableOpacity
                        onPress={handleClose}
                        className="absolute top-2 right-2"
                    >
                        <XMarkIcon size={24} color="white" />
                    </TouchableOpacity>
                )}
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backdrop: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    content: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: 20,
        padding: 24,
        minWidth: 250,
        minHeight: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default HUD;
