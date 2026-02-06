import React, { useEffect, useRef } from 'react';
import { Animated, Image, ImageBackground, StyleSheet } from 'react-native';
import ViewContainer from '../common/ViewContainer';
import { ViewBox } from '../common/ViewBox';
import { Text } from '../common/Text';

export const SplashScreen = ({ text = 'ĐANG KHỞI TẠO HỆ THỐNG...' }: { text?: string }) => {

    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
        }).start();
    }, []);

    const width = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '90%'],
    });

    return (
        <ViewContainer hasScrollableContent={true}>
            <ImageBackground
                source={require('../../assets/images/background.jpg')}
                resizeMode="cover"
                className="flex-1"
            >
                <ViewBox padding={'lg'} className="flex-1 mb-7">
                    <ViewBox gap={'lg'} className="justify-center items-center flex-1">
                        <ViewBox radius={'xl'}>
                            <Image className="w-24 h-24 rounded-xl" source={require('../../assets/images/logo.png')} />
                        </ViewBox>
                        <ViewBox gap={'md'} className="flex-col items-center">
                            <Text color={'black'} variant={'largeTitle'}>Inject</Text>
                            <Text variant={'pageTitleRegular'}>HỆ THỐNG QUẢN LÝ HIỆN ĐẠI</Text>
                        </ViewBox>

                    </ViewBox>
                    <ViewBox gap={'md'} className="justify-center items-center">
                        <ViewBox radius={'xl'} className="overflow-hidden w-[70%] h-3" background={'lavender'}>
                            <Animated.View style={[styles.bar, { width }]} />
                        </ViewBox>
                        <Text className="tracking-widest" color={'lightGray'} variant={'label'}>{text}</Text>
                    </ViewBox>
                </ViewBox>
            </ImageBackground>
        </ViewContainer >
    );
};

const styles = StyleSheet.create({

    bar: {
        height: '100%',
        backgroundColor: '#3C18E7',
    },
});
