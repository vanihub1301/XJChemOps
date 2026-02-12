import React, { useEffect, useRef, useState } from 'react';
import ViewContainer from '../../components/common/ViewContainer';
import ViewHeader from '../../components/common/ViewHeader';
import { MainNavigationProps } from '../../types/navigation';
import Card from '../../components/common/Card';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import Input from '../../components/input/Input';
import BottomSheetSelect from '../../components/bottomsheet/BottomSheetSelect';
import SelectBox from '../../components/common/SelectBox';
import BottomSheet from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-date-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { showToast } from '../../service/toast';
import { useAPI } from '../../service/api';
import { useOperationStore } from '../../store/operationStore';
import { formatDateCustom, formatWithPattern } from '../../utils/dateTime';
import { useAuthStore } from '../../store/authStore';
import { Reference } from '../../types/drum';

const FormChangeStartTime = ({ navigation }: MainNavigationProps<'FormChangeStartTime'>) => {
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [selectedReasonLabel, setSelectedReasonLabel] = useState<string>('');
    const [otherReason, setOtherReason] = useState<string>('');
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [reasons, setReasons] = useState<Reference[]>([]);

    const reasonBottomSheetRef = useRef<BottomSheet>(null);

    const { putData, getData, loading } = useAPI();
    const { orderStore } = useOperationStore();
    const { fullName } = useAuthStore();


    const orderFields = [
        { label: 'Mã đơn', value: orderStore?.process?.orderNo, icon: <MaterialCommunityIcons name="fingerprint" size={24} color="#6266F1" /> },
        { label: 'Màu sắc', value: orderStore?.process?.color, icon: <Ionicons name="color-palette-outline" size={24} color="#6266F1" /> },
        { label: 'Trọng lượng', value: orderStore?.process?.actualWeight ? orderStore?.process?.actualWeight + 'kg' : '', icon: <MaterialCommunityIcons name="weight" size={24} color="#6266F1" /> },
        { label: 'Độ dày', value: orderStore?.process?.thickness ? orderStore?.process?.thickness + 'mm' : '', icon: <MaterialCommunityIcons name="format-line-weight" size={24} color="#6266F1" /> },
        { label: 'Thời gian bắt đầu', value: formatDateCustom(orderStore?.process?.startDrum, { format: 'HH:mm' }), icon: <MaterialCommunityIcons name="clock-outline" size={24} color="#6266F1" /> },
    ];

    const handleReasonPress = () => {
        reasonBottomSheetRef.current?.expand();
    };

    const handleReasonSelection = (value: string, label: string) => {
        setSelectedReason(value);
        setSelectedReasonLabel(label);
        if (value !== 'other') {
            setOtherReason('');
        }
        reasonBottomSheetRef.current?.close();
    };

    const handleReasonClose = () => {
        reasonBottomSheetRef.current?.close();
    };

    const isFormValid = () => {
        if (!selectedReason) {
            return false;
        }
        if (selectedReason === 'other' && !otherReason.trim()) {
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        try {
            if (!isFormValid()) {
                showToast('Vui lòng điền đầy đủ thông tin');
                return;
            }

            const res = await putData('portal/inject/updateTime', {
                processFk: orderStore?.process?.id,
                orderBill: orderStore?.process?.orderNo,
                bomNo: orderStore?.process?.bomNo,
                reason: +selectedReason,
                remarks: otherReason,
                actualTime: formatWithPattern(startTime, 'yyyy-MM-dd HH:mm:ss'),
                registor: fullName,
            });

            if (res?.code === 0) {
                showToast('Đã cập nhật thời gian bắt đầu');
                navigation.goBack();
            } else {
                showToast(res?.msg);
            }
        } catch (error) {
            showToast('Cập nhật thất bại');
        }
    };

    const getReason = async () => {
        const res = await getData('portal/inject/reference', { group: 'EDIT_TIME' });
        if (res?.code === 0) {
            setReasons(res?.data);
        }
    };

    useEffect(() => {
        getReason();
    }, []);

    return (
        <>
            <ViewContainer background="bg-[#F9F8FC]" hasScrollableContent={true}>
                <ViewHeader border={true} title="Đổi thời gian bắt đầu" />
                <ViewBox padding={'lg'} className="flex-1 items-center">
                    <ViewBox gap={'lg'} className="w-[60%]">
                        <Card padding={'lg'} className="w-full">
                            <ViewBox gap={'sm'} className="flex-row items-center">
                                <ViewBox radius={'full'} background={'orange'} className="w-2 h-2" />
                                <Text variant={'captionStrong'}>ĐIỀU CHỈNH THỜI GIAN</Text>
                            </ViewBox>
                            <ViewBox>
                                <Text color={'black'} variant={'sectionTitle'}>Thông tin đơn hàng</Text>
                                <Text>Vui lòng kiểm tra thông tin và chọn thời gian bắt đầu mới.</Text>
                            </ViewBox>
                        </Card>

                        <Card padding="none" className="w-full py-5">
                            {orderFields.map((field, index) => (
                                <React.Fragment key={index}>
                                    <ViewBox className="px-5 py-2 flex-row items-center justify-between">
                                        <ViewBox className="flex-row items-center gap-2">
                                            {field.icon}
                                            <Text variant={'captionStrong'}>{field.label}</Text>
                                        </ViewBox>
                                        <Text variant={'caption'}>{field.value}</Text>
                                    </ViewBox>
                                    {index < orderFields.length - 1 && (
                                        <ViewBox className="h-px bg-gray-200" />
                                    )}
                                </React.Fragment>
                            ))}
                        </Card>

                        <Card padding={'lg'} gap="md" className="w-full">
                            <ViewBox className="flex-row items-center gap-2">
                                <MaterialCommunityIcons name="clock-edit-outline" size={20} color="#6266F1" />
                                <Text variant="sectionTitle" color="black">
                                    Thời gian bắt đầu mới
                                </Text>
                            </ViewBox>
                            <SelectBox
                                label="Thời gian được chọn"
                                selectedChoice={formatWithPattern(startTime, 'dd/MM/yyyy HH:mm')}
                                placeholder="Chọn thời gian"
                                handleChoicePress={() => setOpenDatePicker(true)}
                            />
                        </Card>

                        <Card padding={'lg'} gap="md" className="w-full">
                            <ViewBox className="flex-row items-center gap-2">
                                <MaterialCommunityIcons name="note-edit-outline" size={20} color="#6266F1" />
                                <Text variant="sectionTitle" color="black">
                                    Lý do điều chỉnh
                                </Text>
                            </ViewBox>

                            <SelectBox
                                label="Chọn lý do"
                                selectedChoice={selectedReasonLabel}
                                placeholder="Chọn lý do"
                                handleChoicePress={handleReasonPress}
                            />

                            {selectedReason === 'other' && (
                                <Input
                                    label="Lý do cụ thể"
                                    placeholder="Nhập lý do điều chỉnh thời gian"
                                    InputValue={otherReason}
                                    onChangeText={setOtherReason}
                                    required
                                    multiline
                                    numberOfLines={4}
                                />
                            )}
                        </Card>

                        <Card background="lightYellow" className="w-full flex-row items-start overflow-hidden">
                            <ViewBox className="mt-1">
                                <MaterialCommunityIcons name="information" size={20} color="#D87704" />
                            </ViewBox>
                            <Text className="flex-1" color={'orange'}>
                                Lưu ý: Việc thay đổi thời gian bắt đầu sẽ ảnh hưởng đến lịch trình sản xuất. Hãy đảm bảo đã thông báo cho các bộ phận liên quan.
                            </Text>
                        </Card>
                    </ViewBox>
                </ViewBox>

                <ViewBox padding={'lg'} className="border-t border-gray-300 py-8 items-center">
                    <ViewBox className="w-[60%]">
                        <Button
                            variant="primary"
                            radius="xl"
                            size="lg"
                            label="CẬP NHẬT THỜI GIAN"
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={!isFormValid()}
                            className="flex-row items-center justify-center"
                            iconPosition="left"
                        >
                            <MaterialCommunityIcons name="clock-check" size={20} color="white" />
                        </Button>
                    </ViewBox>
                </ViewBox>
            </ViewContainer>

            <BottomSheetSelect
                ref={reasonBottomSheetRef}
                onSelection={handleReasonSelection}
                onClose={handleReasonClose}
                sheetType="changeTimeReasons"
                customData={reasons.map((item) => ({ label: item.nameVi, value: item.code }))}
            >
                <></>
            </BottomSheetSelect>
            <DatePicker
                title={'Chọn ngày'}
                confirmText={'OK'}
                cancelText={'Hủy'}
                locale={'vi'}
                modal
                mode="datetime"
                open={openDatePicker}
                date={startTime}
                onConfirm={(selectedDate) => {
                    setOpenDatePicker(false);
                    setStartTime(selectedDate);
                }}
                onCancel={() => setOpenDatePicker(false)}
            />
        </>
    );
};

export default FormChangeStartTime;
