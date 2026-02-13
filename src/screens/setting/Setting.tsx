import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import ViewContainer from '../../components/common/ViewContainer';
import ViewHeader from '../../components/common/ViewHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import Input from '../../components/input/Input';
import SelectBox from '../../components/common/SelectBox';
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
    const { setMany, getMany, serverIp, port, inspectionTime, enableSound, lockScreen, language } = useSettingStore();
    const { postData } = useAPI();
    const { rotatingTank } = useAuthStore();

    const [serverAddress, setServerAddress] = useState('');
    const [serverPort, setServerPort] = useState('');
    const [inspectionTimeLocal, setInspectionTimeLocal] = useState('');
    const [enableSoundLocal, setEnableSoundLocal] = useState(false);
    const [lockScreenLocal, setLockScreenLocal] = useState(false);
    const [languageLocal, setLanguageLocal] = useState('');
    const [sheetType, setSheetType] = useState<string>('inspectionTime');

    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleSettingSave = async () => {
        try {
            const settings = await getMany(['idDrum']);
            if (!settings.idDrum) {
                showToast('Không tìm thấy id máy');
                return;
            }
            const response = await postData('portal/inject/config', {
                id: settings.idDrum,
                drumno: rotatingTank?.name,
                inspectionTime: +inspectionTimeLocal,
                enableSound: enableSoundLocal,
                lockScreen: lockScreenLocal,
                language: languageLocal,
                serverIp: serverAddress,
                port: +serverPort,
            });
            if (response?.code === 0) {
                await setMany({
                    serverIp: serverAddress,
                    port: serverPort,
                    inspectionTime: inspectionTimeLocal,
                    lockScreen: lockScreenLocal,
                    enableSound: enableSoundLocal,
                    language: languageLocal,
                });
                showToast('Cài đặt đã được lưu thành công');
            } else {
                showToast(response?.msg);
            }
        } catch (error: any) {
            showToast(error.message);
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
        } else if (sheetType === 'language') {
            setLanguageLocal(value);
        }
        handleClose();
    };

    const handleClose = () => {
        bottomSheetRef.current?.close();
    };

    useEffect(() => {
        const loadData = async () => {
            const settings = await getMany(['serverIp', 'port', 'inspectionTime', 'enableSound', 'lockScreen', 'language']);
            setServerAddress(settings.serverIp || '');
            setServerPort(settings.port || '');
            setInspectionTimeLocal(settings.inspectionTime || '');
            setEnableSoundLocal(settings.enableSound === 'true');
            setLockScreenLocal(settings.lockScreen === 'true');
            setLanguageLocal(settings.language || '');
        }
        loadData();
    }, [serverIp, port, inspectionTime, enableSound, lockScreen, language]);

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
                                onChangeText={setServerAddress}
                                showClearButton={false}
                            />

                            <Input
                                label="Cổng (Port)"
                                placeholder="Nhập cổng"
                                InputValue={serverPort}
                                onChangeText={setServerPort}
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
                            <SelectBox
                                label="Thời gian kiểm tra"
                                selectedChoice={inspectionTimeLocal + ' giây'}
                                placeholder="Chọn thời gian"
                                handleChoicePress={() => handleOpenSheet('inspectionTime')}
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
                                    onValueChange={setEnableSoundLocal}
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
                                    onValueChange={setLockScreenLocal}
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
                    />
                </ViewBox>
            </ViewContainer>
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
