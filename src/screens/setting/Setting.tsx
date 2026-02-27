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
import RowInput from '../../components/input/RowInput';
import { SettingRow, Divider, SectionLabel } from './SettingRow';

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
    const [volumeLocal, setVolumeLocal] = useState('');
    const [maxTimeRecordLocal, setMaxTimeRecordLocal] = useState('');
    const [repeatCountLocal, setRepeatCountLocal] = useState('');
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

    const handleVolumeChange = (value: string) => {
        setVolumeLocal(value);
        setChangedFields(prev => new Set(prev).add('volume'));
    };

    const handleMaxTimeRecordChange = (value: string) => {
        setMaxTimeRecordLocal(value);
        setChangedFields(prev => new Set(prev).add('maxTimeRecord'));
    };

    const handleCheckServer = async ({ serverIp = serverAddress, port = serverPort }: { serverIp: string, port: string }) => {
        try {
            await getData('portal/inject/reference', {}, true, 'http://' + serverIp + ':' + port);
            await setMany({ serverIp, port });
            return true;
        } catch (error: any) {
            return false;
        }
    };

    const handleCheckInput = (value: string, type: string) => {
        if (type === 'volume') {
            if (+value < 1 || +value > 100) {
                showToast('Âm lượng phải từ 1 đến 100');
                return false;
            }
        }
        return true;
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
            if (changedFields.has('volume')) {
                updatedConfig.volume = +volumeLocal;
            }
            if (changedFields.has('maxTimeRecord')) {
                updatedConfig.maxTimeRecord = +maxTimeRecordLocal;
            }
            if (changedFields.has('repeatCount')) {
                updatedConfig.repeatCount = +repeatCountLocal;
            }

            const isServerValid = await handleCheckServer({ serverIp: updatedConfig?.serverIp, port: updatedConfig?.port });
            if (!isServerValid) {
                showToast('Không tìm thấy máy chủ, vui lòng kiểm tra lại');
                return;
            }
            if (!handleCheckInput(volumeLocal, 'volume')) {
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
        if (sheetType === 'language') {
            setLanguageLocal(value);
            setChangedFields(prev => new Set(prev).add('language'));
        } else if (sheetType === 'repeatCount') {
            setRepeatCountLocal(value);
            setChangedFields(prev => new Set(prev).add('repeatCount'));
        }
        handleClose();
    };

    const handleClose = () => {
        bottomSheetRef.current?.close();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const settings = await getMany(['serverIp', 'port', 'inspectionTime', 'enableSound', 'lockScreen', 'language', 'volume', 'maxTimeRecord', 'repeatCount']);
                setServerAddress(settings.serverIp || '');
                setServerPort(settings.port || '');
                setInspectionTimeLocal(settings.inspectionTime || '');
                setEnableSoundLocal(settings.enableSound === 'true');
                setLockScreenLocal(settings.lockScreen === 'true');
                setLanguageLocal(settings.language || '');
                setVolumeLocal(settings.volume || '');
                setMaxTimeRecordLocal(settings.maxTimeRecord || '');
                setRepeatCountLocal(settings.repeatCount || '');
                setChangedFields(new Set());
            } catch (error) {
                showToast('Lỗi khi tải cài đặt');
            }
        };

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
                        <SectionLabel title="CẤU HÌNH MÁY CHỦ" />
                        <Card style={styles.shadow}>
                            <Input label="Địa chỉ máy chủ" placeholder="Nhập địa chỉ máy chủ" InputValue={serverAddress} onChangeText={handleServerAddressChange} keyboardType="numeric" showClearButton={false} />
                            <Input label="Cổng (Port)" placeholder="Nhập cổng" InputValue={serverPort} onChangeText={handleServerPortChange} keyboardType="numeric" showClearButton={false} />
                        </Card>
                    </ViewBox>

                    <ViewBox className="mb-6">
                        <SectionLabel title="KIỂM TRA HỆ THỐNG" />
                        <Card style={styles.shadow}>
                            <Input label="Thời gian kiểm tra (giây)" placeholder="Nhập thời gian" InputValue={inspectionTimeLocal} onChangeText={handleInspectionTimeChange} keyboardType="numeric" showClearButton={false} />
                        </Card>
                    </ViewBox>

                    <ViewBox className="mb-6">
                        <SectionLabel title="TUỲ CHỈNH ỨNG DỤNG" />
                        <Card gap="none" padding="none" style={styles.shadow}>
                            <SettingRow icon={<MaterialCommunityIcons name="soundcloud" size={24} color="#1616E6" />} label="Âm lượng (1 → 100)">
                                <RowInput placeholder="Nhập âm lượng" InputValue={volumeLocal} onChangeText={handleVolumeChange} keyboardType="numeric" />
                            </SettingRow>
                            <Divider />
                            <SettingRow icon={<MaterialCommunityIcons name="video" size={24} color="#1616E6" />} label="Thời gian ghi hình tối đa (giây)">
                                <RowInput placeholder="Nhập thời gian" InputValue={maxTimeRecordLocal} onChangeText={handleMaxTimeRecordChange} keyboardType="numeric" />
                            </SettingRow>
                            <Divider />
                            <SettingRow icon={<MaterialCommunityIcons name="repeat-variant" size={24} color="#1616E6" />} label="Số lần lặp thông báo">
                                <TouchableOpacity onPress={() => handleOpenSheet('repeatCount')} className="flex-row items-center gap-2">
                                    <Text color={'black'} variant="labelRegular">
                                        {repeatCountLocal ? `${repeatCountLocal} lần` : 'Chọn số lần'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </SettingRow>
                            <Divider />
                            <SettingRow icon={<MaterialCommunityIcons name="volume-high" size={24} color="#1616E6" />} label="Bật âm thanh khi có thông báo">
                                <Switch value={enableSoundLocal} onValueChange={handleEnableSoundChange} trackColor={{ false: '#D1D5DB', true: '#1616E6' }} thumbColor="#FFFFFF" />
                            </SettingRow>
                            <Divider />
                            <SettingRow icon={<MaterialCommunityIcons name="eye" size={24} color="#1616E6" />} label="Chặn không khoá màn hình">
                                <Switch value={lockScreenLocal} onValueChange={handleLockScreenChange} trackColor={{ false: '#D1D5DB', true: '#1616E6' }} thumbColor="#FFFFFF" />
                            </SettingRow>
                        </Card>
                    </ViewBox>

                    <ViewBox className="mb-6">
                        <SectionLabel title="THÔNG TIN KHÁC" />
                        <Card gap="none" padding="none" style={styles.shadow}>
                            <SettingRow icon={<Ionicons name="language-sharp" size={24} color="#6b7280" />} label="Ngôn ngữ">
                                <TouchableOpacity onPress={() => handleOpenSheet('language')} className="flex-row items-center gap-2">
                                    <Text color={'black'} variant="labelRegular">{languageLocal === 'vi' ? 'Tiếng Việt' : ''}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </SettingRow>
                            <Divider />
                            <SettingRow icon={<MaterialCommunityIcons name="information" size={24} color="#6b7280" />} label="Phiên bản ứng dụng">
                                <Text variant="labelRegular" color="primary">v1.0.0</Text>
                            </SettingRow>
                            <Divider />
                            <SettingRow icon={<MaterialCommunityIcons name="file-document" size={24} color="#6b7280" />} label="Điều khoản sử dụng">
                                <MaterialCommunityIcons name="chevron-right" size={20} color="gray" />
                            </SettingRow>
                        </Card>
                    </ViewBox>

                </ViewBox>
                <ViewBox className="border-t border-gray-300 px-6 py-8">
                    <Button variant="fourth" radius="xl" size="lg" label="LƯU CÀI ĐẶT" onPress={handleSave} className="w-full" disabled={loading} loading={loading} />
                </ViewBox>
            </ViewContainer >
            <BottomSheetSelect ref={bottomSheetRef} onSelection={handleSelection} onClose={handleClose} sheetType={sheetType}>
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

