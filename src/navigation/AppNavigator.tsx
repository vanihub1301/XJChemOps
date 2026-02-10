import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AppRoutes } from '../types/navigation';
import { AuthenticationNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

const AppStack = createStackNavigator<AppRoutes>();

interface AppNavigatorProps {
    isSignedIn: boolean;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ isSignedIn }) => {
    return (
        <AppStack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={isSignedIn ? 'Main' : 'Authentication'}
            key={isSignedIn ? 'signedIn' : 'auth'}
        >
            {isSignedIn ? (
                <AppStack.Screen name="Main" component={MainNavigator} />
            ) : (
                <AppStack.Screen name="Authentication" component={AuthenticationNavigator} />
            )}
        </AppStack.Navigator>
    );
};
