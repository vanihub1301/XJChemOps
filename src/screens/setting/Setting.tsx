import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Switch, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Setting = ({ }: MainNavigationProps<'Setting'>) => {
    const { setMany, getMany, inspectionTime } = useSettingStore();
    const { postData, getData, loading } = useAPI();
    const { rotatingTank } = useAuthStore();

    const [form, setForm] = useState({
        serverIp: '', port: '', inspectionTime: '',
        enableSound: false, lockScreen: false,
        language: '', volume: '', maxTimeRecord: '', repeatCount: '',
    });
    const [sheetType, setSheetType] = useState<'language' | 'repeatCount'>('language');
    const changedRef = useRef<Set<string>>(new Set());
    const originalValuesRef = useRef<Record<string, any>>({});
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleChange = async (key: string, value: any) => {
        console.log('LOG : handleChange : value:', value)

        const originalVal = originalValuesRef.current[key];
        let isEqual = false;

        if (typeof value === 'boolean') {
            isEqual = originalVal === value;
        } else {
            isEqual = String(originalVal ?? '') === String(value ?? '');
        }

        if (isEqual) {
            changedRef.current.delete(key);
        } else {
            changedRef.current.add(key);
        }
        if (key === 'inspectionTime') {
            let num = Number(value);
            if (Number.isNaN(num)) { num = 0; }
            num = Math.floor(num);
            // if (num > 300) { num = 300; }
            if (num < 1) { num = 1; }
            value = num;
        }
        if (key === 'volume') {
            let num = Number(value);
            if (Number.isNaN(num)) { num = 0; }
            num = Math.floor(num);
            if (num > 100) { num = 100; }
            if (num < 0) { num = 0; }
            value = num;
        }
        if (key === 'maxTimeRecord') {
            let num = Number(value);
            if (Number.isNaN(num)) { num = 0; }
            num = Math.floor(num);
            if (num > 600) { num = 600; }
            if (num < 0) { num = 0; }
            value = num;
        }
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSettingSave = async () => {
        try {
            if (changedRef.current.has('volume') && (+form.volume < 1 || +form.volume > 100)) {
                showToast('Âm lượng phải từ 1 đến 100');
                return;
            }

            const settings = await getMany(['idDrum']);
            if (!settings.idDrum) {
                showToast('Không tìm thấy id máy');
                return;
            }

            try {
                await getData('portal/inject/reference', {}, true, `http://${form.serverIp}:${form.port}`);
            } catch {
                showToast('Không tìm thấy máy chủ, vui lòng kiểm tra lại');
                return;
            }

            const payload: any = { id: settings.idDrum, drumno: rotatingTank?.name };
            changedRef.current.forEach(key => { payload[key] = form[key]; });

            const response = await postData('portal/inject/config', payload, false);
            if (response?.code === 0) {
                showToast('Cài đặt đã được lưu thành công');
                await setMany(payload);
                changedRef.current = new Set();
            } else {
                showToast(response?.msg);
            }
        } catch (error: any) {
            showToast(error.message);
        }
    };

    const handleSave = () => {
        Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn lưu cài đặt?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đồng ý', onPress: handleSettingSave },
        ]);
    };

    const handleSelection = (value: string) => {
        handleChange(sheetType, value);
        bottomSheetRef.current?.close();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const settings = await getMany(['serverIp', 'port', 'inspectionTime', 'enableSound', 'lockScreen', 'language', 'volume', 'maxTimeRecord', 'repeatCount']);
                const newOriginals: Record<string, any> = {};
                Object.entries(settings).forEach(([key, val]) => {
                    newOriginals[key] = key === 'enableSound' || key === 'lockScreen' ? val === 'true' : val ?? '';
                });
                originalValuesRef.current = newOriginals;

                setForm(prev => {
                    const nextForm = { ...prev };
                    let shouldUpdate = false;
                    Object.entries(newOriginals).forEach(([key, val]) => {
                        const formKey = key as keyof typeof nextForm;
                        if (!changedRef.current.has(key)) {
                            if (nextForm[formKey] !== val) {
                                (nextForm as any)[formKey] = val;
                                shouldUpdate = true;
                            }
                        } else {
                            const currentVal = nextForm[formKey];
                            const isEqual = typeof currentVal === 'boolean'
                                ? currentVal === val
                                : String(currentVal ?? '') === String(val ?? '');

                            if (isEqual) {
                                changedRef.current.delete(key);
                                shouldUpdate = true;
                            }
                        }
                    });
                    return shouldUpdate ? nextForm : prev;
                });
            } catch {
                showToast('Lỗi khi tải cài đặt');
            }
        };

        loadData();
        const ms = inspectionTime ? parseInt(inspectionTime) * 1000 : 5000;
        const id = setInterval(loadData, ms);
        return () => clearInterval(id);
    }, [inspectionTime]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ViewBox className="flex-1">
                <ViewContainer background="none" hasScrollableContent={true}>
                    <ViewHeader border={true} title="Cài đặt hệ thống" />
                    <ViewBox padding="lg" className="flex-1">
                        <ViewBox className="mb-6">
                            <SectionLabel title="CẤU HÌNH MÁY CHỦ" />
                            <Card style={styles.shadow} >
                                <ViewBox>
                                    <Input label="Địa chỉ máy chủ" placeholder="Nhập địa chỉ máy chủ"
                                        InputValue={form.serverIp} onChangeText={v => handleChange('serverIp', v)} keyboardType="numeric" showClearButton={false} />
                                    {changedRef.current.has('serverIp') && (
                                        <ViewBox gap={'xs'} className="flex-row items-center px-2">
                                            <MaterialIcons name="warning" size={16} color="red" />
                                            <Text variant={'captionMedium'} color="red">
                                                Địa chỉ máy chủ đã bị thay đổi
                                            </Text>
                                        </ViewBox>
                                    )}
                                </ViewBox>

                                <ViewBox>
                                    <Input label="Cổng (Port)" placeholder="Nhập cổng"
                                        InputValue={form.port} onChangeText={v => handleChange('port', v)} keyboardType="numeric" showClearButton={false} />
                                    {changedRef.current.has('port') && (
                                        <ViewBox gap={'xs'} className="flex-row items-center px-2">
                                            <MaterialIcons name="warning" size={16} color="red" />
                                            <Text variant={'captionMedium'} color="red">
                                                Cổng (Port) đã bị thay đổi
                                            </Text>
                                        </ViewBox>
                                    )}
                                </ViewBox>
                            </Card>
                        </ViewBox>
                        <ViewBox className="mb-6">
                            <SectionLabel title="KIỂM TRA HỆ THỐNG" />
                            <Card style={styles.shadow}>
                                <ViewBox>
                                    <Input label="Thời gian kiểm tra (giây)" placeholder="Nhập thời gian"
                                        InputValue={form.inspectionTime} onChangeText={v => handleChange('inspectionTime', v)} keyboardType="numeric" showClearButton={false} />
                                    {changedRef.current.has('inspectionTime') && (
                                        <ViewBox gap={'xs'} className="flex-row items-center px-2">
                                            <MaterialIcons name="warning" size={16} color="red" />
                                            <Text variant={'captionMedium'} color="red">
                                                Thời gian kiểm tra đã bị thay đổi
                                            </Text>
                                        </ViewBox>
                                    )}
                                </ViewBox>
                            </Card>
                        </ViewBox>
                        <ViewBox className="mb-6">
                            <SectionLabel title="TUỲ CHỈNH ỨNG DỤNG" />
                            <Card gap="none" padding="none" style={styles.shadow}>
                                <SettingRow isChange={changedRef.current.has('volume')} icon={<MaterialCommunityIcons name="soundcloud" size={24} color="#1616E6" />} label="Âm lượng (1 → 100)" >
                                    <RowInput placeholder="Nhập âm lượng" InputValue={form.volume} onChangeText={v => handleChange('volume', v)} keyboardType="numeric" />
                                </SettingRow>
                                <Divider />
                                <SettingRow isChange={changedRef.current.has('maxTimeRecord')} icon={<MaterialCommunityIcons name="video" size={24} color="#1616E6" />} label="Thời gian ghi hình tối đa (giây)">
                                    <RowInput placeholder="Nhập thời gian" InputValue={form.maxTimeRecord} onChangeText={v => handleChange('maxTimeRecord', v)} keyboardType="numeric" />
                                </SettingRow>
                                <Divider />
                                <SettingRow isChange={changedRef.current.has('repeatCount')} icon={<MaterialCommunityIcons name="repeat-variant" size={24} color="#1616E6" />} label="Số lần lặp thông báo">
                                    <TouchableOpacity onPress={async () => { await Keyboard.dismiss(); setSheetType('repeatCount'); bottomSheetRef.current?.expand(); }} className="flex-row items-center gap-2">
                                        <Text color="black" variant="labelRegular">
                                            {form.repeatCount ? `${form.repeatCount} lần` : 'Chọn số lần'}
                                        </Text>
                                        <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
                                    </TouchableOpacity>
                                </SettingRow>
                                <Divider />
                                <SettingRow isChange={changedRef.current.has('enableSound')} icon={<MaterialCommunityIcons name="volume-high" size={24} color="#1616E6" />} label="Bật âm thanh khi có thông báo">
                                    <Switch value={form.enableSound} onValueChange={v => handleChange('enableSound', v)}
                                        trackColor={{ false: '#D1D5DB', true: '#1616E6' }} thumbColor="#FFFFFF" />
                                </SettingRow>
                                <Divider />
                                <SettingRow isChange={changedRef.current.has('lockScreen')} icon={<MaterialCommunityIcons name="eye" size={24} color="#1616E6" />} label="Chặn không khoá màn hình">
                                    <Switch value={form.lockScreen} onValueChange={v => handleChange('lockScreen', v)}
                                        trackColor={{ false: '#D1D5DB', true: '#1616E6' }} thumbColor="#FFFFFF" />
                                </SettingRow>
                            </Card>
                        </ViewBox>
                        <ViewBox className="mb-6">
                            <SectionLabel title="THÔNG TIN KHÁC" />
                            <Card gap="none" padding="none" style={styles.shadow}>
                                <SettingRow icon={<Ionicons name="language-sharp" size={24} color="#6b7280" />} label="Ngôn ngữ">
                                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); setSheetType('language'); bottomSheetRef.current?.expand(); }} className="flex-row items-center gap-2">
                                        <Text color="black" variant="labelRegular">{form.language === 'vi' ? 'Tiếng Việt' : ''}</Text>
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
                        <Button variant="fourth" radius="xl" size="lg" label="LƯU CÀI ĐẶT" onPress={handleSave} className="w-full" disabled={loading || changedRef.current.size === 0} loading={loading} />
                    </ViewBox>
                </ViewContainer>
                <BottomSheetSelect ref={bottomSheetRef} onSelection={handleSelection} onClose={() => bottomSheetRef.current?.close()} sheetType={sheetType}>
                    <></>
                </BottomSheetSelect>
            </ViewBox>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: 'gray',
        elevation: 2,
    },
});

export default Setting;

