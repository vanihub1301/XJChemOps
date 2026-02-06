import React, { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../../service/navigation';

// const NAVIGATION_STATE_KEY = `NAVIGATION_STATE_KEY`;

// export type FontSource = Parameters<typeof loadFonts>[0];


type LoadAssetsProps = {
    // assets?: any[];
    //  fonts?: FontSource;
    children: ReactElement;
};

const LoadAssets = ({ children }: LoadAssetsProps) => {

    return (
        <NavigationContainer ref={navigationRef} >{children}</NavigationContainer>
    );
};

export default LoadAssets;
