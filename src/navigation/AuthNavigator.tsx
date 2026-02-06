import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthRoutes } from '../types/navigation';
import Login from '../screens/auth/Login';
// import FaceLogin from '../screens/auth/FaceLogin';
import FaceRegister from '../screens/auth/FaceRegister';

const AuthenticationStack = createStackNavigator<AuthRoutes>();
export const AuthenticationNavigator = () => {
    return (
        <AuthenticationStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'Login'}>
            <AuthenticationStack.Screen name="Login" component={Login} />
            {/* <AuthenticationStack.Screen name="FaceLogin" component={FaceLogin} /> */}
            <AuthenticationStack.Screen name="FaceRegister" component={FaceRegister} />
        </AuthenticationStack.Navigator>
    );
};
