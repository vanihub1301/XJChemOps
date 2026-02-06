import { TouchableOpacity } from 'react-native';
import { Text } from './Text';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { TypeBox, ViewBox } from './ViewBox';
import Entypo from 'react-native-vector-icons/Entypo';

interface MPViewHeaderProps {
    title?: string;
    background?: TypeBox['background'];
    children?: React.ReactNode;
    enableBack?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
    border?: boolean;
    goBack?: () => void;
}

const ViewHeader = ({ title, children, border = false, enableBack = true, color = 'black', goBack, textAlign = 'center', background = 'transparent' }: MPViewHeaderProps) => {
    const navigation = useNavigation();
    return (
        <ViewBox background={background || 'transparent'} gap={'md'} className={`${border ? 'border-b border-gray-300 ' : ''} flex-row px-6 items-center`}>
            {enableBack && (
                <TouchableOpacity className="my-6" onPress={goBack ? goBack : () => navigation.goBack()}>
                    <Entypo name="chevron-thin-left" size={30} color={color} />
                </TouchableOpacity>
            )}
            {title && (
                <Text color={'black'} variant={'pageTitleSemibold'} className={`flex-1 my-6 text-${textAlign}`}>
                    {title}
                </Text>
            )}
            {children}
        </ViewBox>
    );
};

export default React.memo(ViewHeader);
