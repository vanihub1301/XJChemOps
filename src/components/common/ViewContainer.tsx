import React from 'react';
import { Platform, SafeAreaView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

interface ViewContainerProps {
    children: React.ReactNode;
    background?: string;
    hasScrollableContent?: boolean
}

const ViewContainer = ({ background, children, hasScrollableContent = false }: ViewContainerProps) => {
    const platform = Platform.OS;
    const height = Dimensions.get('window').height;
    const inset = useSafeAreaInsets();
    const isLargeScreen = height > 800 && inset.bottom === 0 && inset.top === 0;
    const bottomInset = isLargeScreen ? (hasScrollableContent ? 30 : 80) : (hasScrollableContent ? 0 : (inset.bottom === 0 ? 30 : inset.bottom));
    const finalHeight = height - inset.bottom - inset.top;

    const config = {
        height: finalHeight,
        bottomInset: platform === 'android' ? bottomInset : 0,
    };

    console.log('LOG : ViewContainer:', {
        platform: platform,
        inset: inset,
        isLargeScreen: isLargeScreen,
        bottomInset: bottomInset,
        height: height,
        finalHeight: finalHeight,
    });

    return (
        <SafeAreaView className={`flex-1 ${background || 'bg-white'}`} mode={'padding'} edges={['top', 'bottom', 'left', 'right']}>
            <View
                style={{
                    height: config.height,
                    paddingBottom: config.bottomInset,
                }}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};

export default React.memo(ViewContainer);
