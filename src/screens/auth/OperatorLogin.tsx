import React from 'react';
import Login from './Login';
import { AppNavigationProps } from '../../types/navigation';

const OperatorLogin = ({ navigation, route }: AppNavigationProps<'OperatorLogin'>) => {
    return <Login navigation={navigation as any} route={route as any} isReAuthentication={true} />;
};

export default OperatorLogin;
