import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export interface AuthNavigationProps<RouteName extends keyof AuthRoutes> {
    navigation: CompositeNavigationProp<
        StackNavigationProp<AuthRoutes, RouteName>,
        StackNavigationProp<AppRoutes>
    >;
    route: RouteProp<AuthRoutes, RouteName>;
}

export interface AppNavigationProps<RouteName extends keyof AppRoutes> {
    navigation: StackNavigationProp<AppRoutes, RouteName>;
    route: RouteProp<AppRoutes, RouteName>;
}

export type AppRoutes = {
    Authentication: undefined;
    Home: undefined;
    Setting: undefined;
    Operation: { order?: any; };
    NearBill: undefined;
    FinishConfirm: undefined;
    VideoPlayback: undefined;
    FormStopOperation: { operation?: any; };
    FormChangeStartTime: { operation?: any; };
    OrderConfirm: { code: string };
    Video: { autoRecord?: boolean; currentChemicals?: any } | undefined;
    ScanQR: { nextScreen?: string, reset?: boolean };
};

export type AuthRoutes = {
    Login: undefined;
    FaceLogin: undefined;
    FaceRegister: undefined;
};
