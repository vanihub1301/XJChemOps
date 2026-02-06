import { Alert, Platform, ToastAndroid } from 'react-native';

export const showToast = (message: string) => {
    if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    } else {
        Alert.alert('Thông báo', message);
    }
};
