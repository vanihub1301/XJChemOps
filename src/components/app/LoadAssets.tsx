import React, { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../../service/navigation';

type LoadAssetsProps = {
    children: ReactElement;
};

const LoadAssets = ({ children }: LoadAssetsProps) => {

    return (
        <NavigationContainer ref={navigationRef} >{children}</NavigationContainer>
    );
};

export default LoadAssets;
