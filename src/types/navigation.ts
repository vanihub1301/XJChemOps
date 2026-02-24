import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Chemical } from './drum';

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

export interface MainNavigationProps<RouteName extends keyof MainRoutes> {
    navigation: CompositeNavigationProp<
        StackNavigationProp<MainRoutes, RouteName>,
        StackNavigationProp<AppRoutes>
    >;
    route: RouteProp<MainRoutes, RouteName>;
}

export type AppRoutes = {
    Authentication: undefined;
    Main: undefined;
};

export type MainRoutes = {
    Home: undefined;
    Setting: undefined;
    Operation: undefined;
    NearBill: undefined;
    BillDetail: { order: any; };
    FinishConfirm: { payload: any, scanCount: string };
    VideoPlayback: undefined;
    FormStopOperation: undefined;
    FormChangeStartTime: undefined;
    OrderConfirm: { code: string };
    Video: { autoRecord?: boolean; chemicals?: Chemical[] } | undefined;
    ScanQR: { nextScreen?: string, reset?: boolean };
    OperatorLogin: undefined;
};

export type AuthRoutes = {
    Login: undefined;
    FaceLogin: undefined;
    FaceRegister: undefined;
};
