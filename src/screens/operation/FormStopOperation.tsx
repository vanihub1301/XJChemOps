import React, { useEffect, useRef, useState } from 'react';
import ViewContainer from '../../components/common/ViewContainer';
import ViewHeader from '../../components/common/ViewHeader';
import { AppNavigationProps } from '../../types/navigation';
import Card from '../../components/common/Card';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import Input from '../../components/input/Input';
import BottomSheetSelect from '../../components/bottomsheet/BottomSheetSelect';
import SelectBox from '../../components/common/SelectBox';
import BottomSheet from '@gorhom/bottom-sheet';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatDateCustom } from '../../utils/dateTime';
import { showToast } from '../../service/toast';
import { useAPI } from '../../service/api';
import { useOperationStore } from '../../store/operationStore';

const FormStopOperation = ({ navigation }: AppNavigationProps<'FormStopOperation'>) => {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [selectedReasonLabel, setSelectedReasonLabel] = useState<string>('');
    const [otherReason, setOtherReason] = useState<string>('');
    const [reasons, setReasons] = useState<any[]>([]);

    const reasonBottomSheetRef = useRef<BottomSheet>(null);

    const { postData, getData, loading } = useAPI();
    const { orderStore } = useOperationStore();

    const orderFields = [
        { label: 'Mã đơn', value: orderStore?.orderNo, icon: <MaterialCommunityIcons name="fingerprint" size={24} color="#6266F1" /> },
        { label: 'Màu sắc', value: orderStore?.color, icon: <Ionicons name="color-palette-outline" size={24} color="#6266F1" /> },
        { label: 'Trọng lượng', value: orderStore?.actualWeight ? orderStore?.actualWeight + 'kg' : '', icon: <MaterialCommunityIcons name="weight" size={24} color="#6266F1" /> },
        { label: 'Độ dày', value: orderStore?.thickness ? orderStore?.thickness + 'mm' : '', icon: <MaterialCommunityIcons name="format-line-weight" size={24} color="#6266F1" /> },
        { label: 'Thời gian bắt đầu', value: formatDateCustom(orderStore?.startDrum, { format: 'HH:mm' }), icon: <MaterialCommunityIcons name="clock-outline" size={24} color="#6266F1" /> },
    ];
    const staff = 'NGUYỄN THỊ THOẢNG';

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
        if (!isFormValid()) {
            showToast('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const res = await postData('portal/inject/finish', {
            processFk: orderStore?.process?.id,
            orderBill: orderStore.process.orderNo,
            bomNo: orderStore.process.bomNo,
            reason: +selectedReason,
            remarks: otherReason,
            finishTime: orderStore.currentTime,
            registor: staff,
        }, true);

        if (res?.code === 0) {
            showToast('Đã gửi yêu cầu dừng chu trình');
            navigation.reset({
                index: 1,
                routes: [
                    { name: 'Home' },
                    { name: 'FinishConfirm' },
                ],
            });
        } else {
            showToast(res?.msg);
        }
    };

    const getReason = async () => {
        const res = await getData('portal/inject/reference', { group: 'FINISH' });
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
                <ViewHeader border={true} title="Đăng ký dừng chu trình" />
                <ViewBox padding={'lg'} className="flex-1 items-center">
                    <ViewBox gap={'lg'} className="w-[60%]">
                        <Card padding={'lg'} className="w-full">
                            <ViewBox gap={'sm'} className="flex-row items-center">
                                <ViewBox radius={'full'} background={'red'} className="w-2 h-2" />
                                <Text variant={'captionStrong'}>YÊU CẦU DỪNG CHU TRÌNH</Text>
                            </ViewBox>
                            <ViewBox>
                                <Text color={'black'} variant={'sectionTitle'}>Thông tin đơn hàng</Text>
                                <Text>Vui lòng kiểm tra thông tin đơn hàng và chọn lý do dừng chu trình.</Text>
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
                            <Text variant="sectionTitle" color="black">
                                Lý do dừng chu trình
                            </Text>

                            <SelectBox
                                label="Chọn lý do"
                                selectedChoice={selectedReasonLabel}
                                placeholder="Chọn lý do"
                                handleChoicePress={handleReasonPress}
                            />

                            {selectedReason === 'other' && (
                                <Input
                                    label="Lý do cụ thể"
                                    placeholder="Nhập lý do dừng chu trình"
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
                                <MaterialCommunityIcons name="alert-circle" size={20} color="#D87704" />
                            </ViewBox>
                            <Text className="flex-1" color={'orange'}>
                                Lưu ý: Sau khi gửi yêu cầu, chu trình sản xuất sẽ được dừng lại và bạn sẽ được chuyển về trang chủ. Hãy đảm bảo đã hoàn tất các công việc cần thiết trước khi dừng.
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
                            label="GỬI YÊU CẦU"
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={!isFormValid()}
                            className="flex-row items-center justify-center"
                            iconPosition="left"
                        >
                            <MaterialCommunityIcons name="stop-circle" size={20} color="white" />
                        </Button>
                    </ViewBox>
                </ViewBox>
            </ViewContainer>

            <BottomSheetSelect
                ref={reasonBottomSheetRef}
                onSelection={handleReasonSelection}
                onClose={handleReasonClose}
                sheetType="reason"
                customData={reasons.map((item) => ({ label: item.nameVi, value: item.code }))}
            >
                <></>
            </BottomSheetSelect>

        </>
    );
};

export default FormStopOperation;
