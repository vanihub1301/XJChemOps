import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import ViewContainer from '../../components/common/ViewContainer';
import ViewHeader from '../../components/common/ViewHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import Input from '../../components/input/Input';
import { Button } from '../../components/common/Button';
import Card from '../../components/common/Card';
import { showToast } from '../../service/toast';
import { useSettingStore } from '../../store/settingStore';
import BottomSheetSelect from '../../components/bottomsheet/BottomSheetSelect';
import BottomSheet from '@gorhom/bottom-sheet';
import { useAPI } from '../../service/api';
import { useAuthStore } from '../../store/authStore';
import { MainNavigationProps } from '../../types/navigation';

const Setting = ({ }: MainNavigationProps<'Setting'>) => {
    const { setMany, getMany, inspectionTime } = useSettingStore();
    const { postData, getData, loading } = useAPI();
    const { rotatingTank } = useAuthStore();

    const [serverAddress, setServerAddress] = useState('');
    const [serverPort, setServerPort] = useState('');
    const [inspectionTimeLocal, setInspectionTimeLocal] = useState('');
    const [enableSoundLocal, setEnableSoundLocal] = useState(false);
    const [lockScreenLocal, setLockScreenLocal] = useState(false);
    const [languageLocal, setLanguageLocal] = useState('');
    const [sheetType, setSheetType] = useState<string>('inspectionTime');
    const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleServerAddressChange = (value: string) => {
        setServerAddress(value);
        setChangedFields(prev => new Set(prev).add('serverIp'));
    };

    const handleServerPortChange = (value: string) => {
        setServerPort(value);
        setChangedFields(prev => new Set(prev).add('port'));
    };

    const handleInspectionTimeChange = (value: string) => {
        setInspectionTimeLocal(value);
        setChangedFields(prev => new Set(prev).add('inspectionTime'));
    };

    const handleEnableSoundChange = (value: boolean) => {
        setEnableSoundLocal(value);
        setChangedFields(prev => new Set(prev).add('enableSound'));
    };

    const handleLockScreenChange = (value: boolean) => {
        setLockScreenLocal(value);
        setChangedFields(prev => new Set(prev).add('lockScreen'));
    };

    const handleCheckServer = async ({ serverIp = serverAddress, port = serverPort }: { serverIp: string, port: string }) => {
        try {
            await getData('portal/inject/reference', {}, true, "http://" + serverIp + ":" + port);
            await setMany({ serverIp, port });
            return true
        } catch (error: any) {
            return false;
        }
    };

    const handleSettingSave = async () => {
        try {
            const settings = await getMany(['idDrum']);
            if (!settings.idDrum) {
                showToast('Không tìm thấy id máy');
                return;
            }

            const updatedConfig: any = {
                id: settings.idDrum,
                drumno: rotatingTank?.name,
            };

            if (changedFields.has('inspectionTime')) {
                updatedConfig.inspectionTime = +inspectionTimeLocal;
            }
            if (changedFields.has('serverIp')) {
                updatedConfig.serverIp = serverAddress;
            }
            if (changedFields.has('port')) {
                updatedConfig.port = +serverPort;
            }
            if (changedFields.has('language')) {
                updatedConfig.language = languageLocal;
            }
            if (changedFields.has('enableSound')) {
                updatedConfig.enableSound = enableSoundLocal;
            }
            if (changedFields.has('lockScreen')) {
                updatedConfig.lockScreen = lockScreenLocal;
            }

            const isServerValid = await handleCheckServer({ serverIp: updatedConfig?.serverIp, port: updatedConfig?.port });
            if (!isServerValid) {
                showToast('Không tìm thấy máy chủ, vui lòng kiểm tra lại');
                return;
            }

            const response = await postData('portal/inject/config', updatedConfig, false);
            if (response?.code === 0) {
                showToast('Cài đặt đã được lưu thành công');
                await setMany(updatedConfig);
            } else {
                showToast(response?.msg);
            }
        } catch (error: any) {
            showToast(error.message);
        } finally {
            setChangedFields(new Set());
        }
    };

    const handleSave = () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn lưu cài đặt?',
            [
                {
                    text: 'Hủy',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Đồng ý',
                    onPress: handleSettingSave,
                },
            ]
        );
    };

    const handleOpenSheet = (type: string) => {
        setSheetType(type);
        bottomSheetRef.current?.expand();
    };

    const handleSelection = (value: string) => {
        if (sheetType === 'inspectionTime') {
            setInspectionTimeLocal(value);
            setChangedFields(prev => new Set(prev).add('inspectionTime'));
        } else if (sheetType === 'language') {
            setLanguageLocal(value);
            setChangedFields(prev => new Set(prev).add('language'));
        }
        handleClose();
    };

    const handleClose = () => {
        bottomSheetRef.current?.close();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const settings = await getMany(['serverIp', 'port', 'inspectionTime', 'enableSound', 'lockScreen', 'language']);
                setServerAddress(settings.serverIp || '');
                setServerPort(settings.port || '');
                setInspectionTimeLocal(settings.inspectionTime || '');
                setEnableSoundLocal(settings.enableSound === 'true');
                setLockScreenLocal(settings.lockScreen === 'true');
                setLanguageLocal(settings.language || '');
                setChangedFields(new Set());
            } catch (error) {
                showToast('Lỗi khi tải cài đặt');
            }
        }

        loadData();

        const intervalTime = inspectionTime ? parseInt(inspectionTime) * 1000 : 5000;
        const intervalId = setInterval(loadData, intervalTime);

        return () => clearInterval(intervalId);
    }, [inspectionTime]);

    return (
        <>
            <ViewContainer background="none" hasScrollableContent={true}>
                <ViewHeader border={true} title="Cài đặt hệ thống" />
                <ViewBox padding={'lg'} className="flex-1">
                    <ViewBox className="mb-6">
                        <Text variant="label" color="primary" className="mb-3 tracking-wider">
                            CẤU HÌNH MÁY CHỦ
                        </Text>
                        <Card style={styles.shadow}>
                            <Input
                                label="Địa chỉ máy chủ"
                                placeholder="Nhập địa chỉ máy chủ"
                                InputValue={serverAddress}
                                onChangeText={handleServerAddressChange}
                                keyboardType="numeric"
                                showClearButton={false}
                            />

                            <Input
                                label="Cổng (Port)"
                                placeholder="Nhập cổng"
                                InputValue={serverPort}
                                onChangeText={handleServerPortChange}
                                keyboardType="numeric"
                                showClearButton={false}
                            />
                        </Card>
                    </ViewBox>

                    <ViewBox className="mb-6">
                        <Text variant="label" color="primary" className="mb-3">
                            KIỂM TRA HỆ THỐNG
                        </Text>
                        <Card style={styles.shadow}>
                            <Input
                                label="Thời gian kiểm tra (giây)"
                                placeholder="Nhập thời gian"
                                InputValue={inspectionTimeLocal}
                                onChangeText={handleInspectionTimeChange}
                                keyboardType="numeric"
                                showClearButton={false}
                            />
                        </Card>

                    </ViewBox>

                    <ViewBox className="mb-6">
                        <Text variant="label" color="primary" className="mb-3">
                            TUỲ CHỈNH ỨNG DỤNG
                        </Text>
                        <Card gap="none" padding="none" style={styles.shadow}>
                            <ViewBox
                                padding="md"
                                radius="xl"
                                className="flex-row items-center justify-between"
                            >
                                <ViewBox className="flex-row items-center gap-3 flex-1">
                                    <MaterialCommunityIcons name="volume-high" size={24} color="#1616E6" />
                                    <Text variant="labelLarge" color="black">
                                        Bật âm thanh khi có thông báo
                                    </Text>
                                </ViewBox>
                                <Switch
                                    value={enableSoundLocal}
                                    onValueChange={handleEnableSoundChange}
                                    trackColor={{ false: '#D1D5DB', true: '#1616E6' }}
                                    thumbColor="#FFFFFF"
                                />
                            </ViewBox>
                            <ViewBox className="h-px bg-gray-200" />
                            <ViewBox
                                padding="md"
                                radius="xl"
                                className="flex-row items-center justify-between"
                            >
                                <ViewBox className="flex-row items-center gap-3 flex-1">
                                    <MaterialCommunityIcons name="eye" size={24} color="#1616E6" />
                                    <Text variant="labelLarge" color="black">
                                        Chặn không khoá màn hình
                                    </Text>
                                </ViewBox>
                                <Switch
                                    value={lockScreenLocal}
                                    onValueChange={handleLockScreenChange}
                                    trackColor={{ false: '#D1D5DB', true: '#1616E6' }}
                                    thumbColor="#FFFFFF"
                                />
                            </ViewBox>
                        </Card>

                    </ViewBox>

                    <ViewBox className="mb-6">
                        <Text variant="label" color="primary" className="mb-3">
                            THÔNG TIN KHÁC
                        </Text>
                        <Card gap="none" padding="none" style={styles.shadow}>
                            <ViewBox
                                padding="md"
                                radius="xl"
                                className="flex-row items-center justify-between"
                            >
                                <ViewBox className="flex-row items-center gap-3 flex-1">
                                    <Ionicons name="language-sharp" size={24} color="#6b7280" />
                                    <Text variant="labelLarge" color="black">
                                        Ngôn ngữ
                                    </Text>
                                </ViewBox>
                                <TouchableOpacity onPress={() => handleOpenSheet('language')} className="flex-row items-center gap-2">
                                    <Text variant="labelRegular">
                                        {languageLocal === 'vi' ? 'Tiếng Việt' : ''}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </ViewBox>
                            <ViewBox className="h-px bg-gray-200" />
                            <ViewBox
                                padding="md"
                                radius="xl"
                                className="flex-row items-center justify-between"
                            >
                                <ViewBox className="flex-row items-center gap-3 flex-1">
                                    <MaterialCommunityIcons name="information" size={24} color="#6b7280" />
                                    <Text variant="labelLarge" color="black">
                                        Phiên bản ứng dụng
                                    </Text>
                                </ViewBox>
                                <ViewBox className="flex-row items-center gap-2">
                                    <Text variant="labelRegular" color="primary">
                                        v1.0.0
                                    </Text>
                                </ViewBox>
                            </ViewBox>
                            <ViewBox className="h-px bg-gray-200" />
                            <ViewBox
                                padding="md"
                                radius="xl"
                                className="flex-row items-center justify-between"
                            >
                                <ViewBox className="flex-row items-center gap-3 flex-1">
                                    <MaterialCommunityIcons name="file-document" size={24} color="#6b7280" />
                                    <Text variant="labelLarge" color="black">
                                        Điều khoản sử dụng
                                    </Text>
                                </ViewBox>
                                <ViewBox className="flex-row items-center gap-2">
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="gray" />
                                </ViewBox>
                            </ViewBox>
                        </Card>
                    </ViewBox>
                </ViewBox>
                <ViewBox className="border-t border-gray-300 px-6 py-8">
                    <Button
                        variant="fourth"
                        radius="xl"
                        size="lg"
                        label="LƯU CÀI ĐẶT"
                        onPress={handleSave}
                        className="w-full"
                        disabled={loading}
                        loading={loading}
                    />
                </ViewBox>
            </ViewContainer >
            <BottomSheetSelect
                ref={bottomSheetRef}
                onSelection={handleSelection}
                onClose={handleClose}
                sheetType={sheetType}
            >
                <></>
            </BottomSheetSelect>
        </>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: 'gray',
        elevation: 2,
    },
});

export default Setting;
