import React from 'react';
import Login from '../auth/Login';
import { MainNavigationProps } from '../../types/navigation';

const OperatorLogin = ({ navigation, route }: MainNavigationProps<'OperatorLogin'>) => {
    return <Login navigation={navigation as any} route={route as any} isReAuthentication={true} />;
};

export default OperatorLogin;
