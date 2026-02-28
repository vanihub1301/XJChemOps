import { useCallback } from 'react';
import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { showToast } from '../service/toast';
import { systemSetting } from '../modules/systemSetting/SystemSetting';

type PermissionResult = 'granted' | 'denied';

const IOS_CAMERA = PERMISSIONS.IOS.CAMERA;
const ANDROID_CAMERA = PERMISSIONS.ANDROID.CAMERA;

export function usePermissions() {
    const checkCameraPermission = useCallback(async (): Promise<boolean> => {
        const permission = Platform.OS === 'ios' ? IOS_CAMERA : ANDROID_CAMERA;
        return (await check(permission)) === RESULTS.GRANTED;
    }, []);

    const requestCameraPermission = useCallback(async (): Promise<boolean> => {
        const permission = Platform.OS === 'ios' ? IOS_CAMERA : ANDROID_CAMERA;
        return (await request(permission)) === RESULTS.GRANTED;
    }, []);

    const ensureCameraPermission = useCallback(async (): Promise<PermissionResult> => {
        const permission = Platform.OS === 'ios' ? IOS_CAMERA : ANDROID_CAMERA;
        const granted = (await check(permission)) === RESULTS.GRANTED;

        if (granted) return 'granted';

        const requested = (await request(permission)) === RESULTS.GRANTED;
        return requested ? 'granted' : 'denied';
    }, []);

    const ensureMediaPermission = useCallback(async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                const statuses = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                ]);

                return (
                    statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
                    PermissionsAndroid.RESULTS.GRANTED
                );
            }

            const status = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            );

            return status === PermissionsAndroid.RESULTS.GRANTED;
        }

        const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
        const status = await check(permission);

        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
            return true;
        }

        if (status === RESULTS.BLOCKED) {
            Linking.openSettings();
            return false;
        }

        const requested = await request(permission);
        return (
            requested === RESULTS.GRANTED ||
            requested === RESULTS.LIMITED
        );
    }, []);

    const requestWritePermission = useCallback(async (): Promise<boolean> => {
        if (Platform.OS !== 'android') { return true; }

        const ok = await systemSetting.canWrite();
        if (ok) { return true; }

        await systemSetting.requestWritePermission();

        return false;
    }, []);

    const goToSettings = useCallback((navigation: any, permission: string) => {
        const mapPermission = {
            camera: 'Cần quyền truy cập Camera',
            media: 'Cần quyền truy cập Media',
        };

        const mapDescription = {
            camera: 'Ứng dụng cần quyền truy cập camera để quay video. Vui lòng bật quyền trong Cài đặt.',
            media: 'Ứng dụng cần quyền truy cập media để quay video. Vui lòng bật quyền trong Cài đặt.',
        };

        Alert.alert(
            mapPermission[permission],
            mapDescription[permission],
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                    onPress: () => {
                        showToast('User cancelled permission request');
                    },
                },
                {
                    text: 'Mở Cài đặt',
                    onPress: () => {
                        Linking.openSettings();
                    },
                },
            ]
        );
    }, []);
    return {
        checkCameraPermission,
        requestCameraPermission,
        ensureCameraPermission,
        requestWritePermission,
        ensureMediaPermission,
        goToSettings,
    };
}
