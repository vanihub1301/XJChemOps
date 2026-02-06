import React, { useState, useEffect } from 'react';
import { AppNavigationProps } from '../../types/navigation';
import ViewContainer from '../../components/common/ViewContainer';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import Card from '../../components/common/Card';
import ViewHeader from '../../components/common/ViewHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatDateCustom } from '../../utils/dateTime';
import { useAPI } from '../../service/api';
import { showToast } from '../../service/toast';
import { useOperationStore } from '../../store/operationStore';

const OrderConfirm = ({ navigation, route }: AppNavigationProps<'OrderConfirm'>) => {
    const { code } = route.params || {};
    const [orderData, setOrderData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const orderFields = [
        { label: 'Mã đơn', value: orderData?.orderNo, icon: <MaterialCommunityIcons name="fingerprint" size={24} color="#6266F1" /> },
        { label: 'Màu sắc', value: orderData?.color, icon: <Ionicons name="color-palette-outline" size={24} color="#6266F1" /> },
        { label: 'Trọng lượng', value: orderData?.actualWeight ? orderData?.actualWeight + 'kg' : '', icon: <MaterialCommunityIcons name="weight" size={24} color="#6266F1" /> },
        { label: 'Độ dày', value: orderData?.thickness + 'mm', icon: <MaterialCommunityIcons name="format-line-weight" size={24} color="#6266F1" /> },
        { label: 'Thời gian bắt đầu', value: formatDateCustom(orderData?.startDrum, { format: 'HH:mm' }), icon: <MaterialCommunityIcons name="clock-outline" size={24} color="#6266F1" /> },
    ];

    const { getData, postData, loading } = useAPI();
    const { setOrderStore, setBatchsStore } = useOperationStore();

    const fetchData = async (orderNo: string) => {
        try {
            const res = await getData('portal/inject/billInfo', { billno: orderNo });
            if (res.code === 0) {
                setOrderData(res.data);
            } else {
                setError(res.msg);
            }
        } catch (err: any) {
            showToast(err);
        }
    };

    useEffect(() => {
        if (code) {
            fetchData(code);
        } else {
            setError('Mã đơn hàng không hợp lệ');
        }
    }, [code]);

    const handleConfirm = async () => {
        try {
            if (orderData) {
                const resInit = await postData(`portal/inject/initProject?fid=${orderData.id}&employee=NGUYỄN THỊ THOẢNG`);
                if (resInit.code === 0) {
                    await Promise.all([
                        setOrderStore(resInit.data.process),
                        setBatchsStore(resInit.data.process.dtl),
                    ]);
                    navigation.navigate('Operation', {
                        order: orderData,
                    });
                }

                if (resInit.code === -1 && resInit.msg === 'Đơn này đã chạy rồi') {
                    const resRunning = await getData('portal/inject/getRunning', { drumNo: orderData.drumNo }, false);
                    if (resRunning.code === 0 && resRunning?.data?.process) {
                        await Promise.all([
                            setOrderStore(resRunning.data.process),
                            setBatchsStore(resRunning.data.process.dtl),
                        ]);
                        navigation.navigate('Operation', {
                            order: orderData,
                        });
                    } else {
                        showToast(resRunning.msg);
                        navigation.navigate('Operation', {
                            order: orderData,
                        });
                    }
                }
            }
        } catch (err: any) {
            showToast(err);
        }
    };

    if (error || !orderData) {
        return (
            <ViewContainer>
                <ViewHeader border={true} title="Xác nhận đơn sản xuất" />
            </ViewContainer>
        );
    }

    return (
        <ViewContainer background="bg-[#F9F8FC]" hasScrollableContent={true}>
            <ViewHeader border={true} title="Xác nhận đơn sản xuất" />
            <ViewBox padding={'lg'} className="flex-1 items-center">
                <ViewBox gap={'lg'} className="w-[60%]">
                    <Card padding={'lg'} className="w-full">
                        <ViewBox gap={'sm'} className="flex-row items-center">
                            <ViewBox radius={'full'} background={'darkGreen'} className="w-2 h-2" />
                            <Text variant={'captionStrong'}>SẴN SÀNG VẬN HÀNH</Text>
                        </ViewBox>
                        <ViewBox>
                            <Text color={'black'} variant={'sectionTitle'}>Thông tin đơn hàng</Text>
                            <Text>Vui lòng kiểm tra các thông số kỹ thuật bên dưới trước khi bắt đầu vận hành máy.</Text>
                        </ViewBox>
                    </Card>
                    <Card padding="none" className="w-full py-5">
                        {orderFields.map((field, index) => (
                            <ViewBox key={field.label} >
                                <ViewBox className="px-5 py-2 flex-row items-center justify-between">
                                    <ViewBox className="flex-row items-center gap-2">
                                        {field.icon}
                                        <Text variant={'captionSemibold'}>{field.label}</Text>
                                    </ViewBox>
                                    <Text color={'black'} variant={'captionStrong'}>{field.value}</Text>
                                </ViewBox>
                                {index < orderFields.length - 1 && (
                                    <ViewBox className="h-px bg-gray-200" />
                                )}
                            </ViewBox>
                        ))}
                    </Card>
                    <Card background="lightYellow" className="w-full flex-row items-start overflow-hidden">
                        <ViewBox className="mt-1">
                            <MaterialCommunityIcons name="information" size={20} color="#D87704" />
                        </ViewBox>
                        <Text variant={'caption'} className="flex-1" color={'orange'}>
                            Lưu ý: Sau khi xác nhận hệ thống sẽ tính đơn này bắt đầu hoạt động. Hãy đảm bảo da đã được bỏ vào bồn quay và đã sẵn sàng cho việc bỏ hoá chất.
                        </Text>
                    </Card>
                </ViewBox>
            </ViewBox>

            <ViewBox padding={'lg'} className="border-t border-gray-300 py-8 items-center">
                <ViewBox className="w-[60%]">
                    <Button
                        variant="fifth"
                        radius="xl"
                        size="lg"
                        label="XÁC NHẬN BẮT ĐẦU"
                        onPress={handleConfirm}
                        className="flex-row items-center justify-center"
                        iconPosition="left"
                        loading={loading}
                    >
                        <MaterialCommunityIcons name="play-circle" size={20} color="white" />
                    </Button>
                </ViewBox>

            </ViewBox>
        </ViewContainer >
    );
};

export default OrderConfirm;
