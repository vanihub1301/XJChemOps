import React, { useState, useEffect } from 'react';
import { MainNavigationProps } from '../../types/navigation';
import ViewContainer from '../../components/common/ViewContainer';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import Card from '../../components/common/Card';
import ViewHeader from '../../components/common/ViewHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatDateCustom, parseDateTime } from '../../utils/dateTime';
import { useAPI } from '../../service/api';
import { showToast } from '../../service/toast';
import { useOperationStore } from '../../store/operationStore';
import { useAuthStore } from '../../store/authStore';
import { Alert } from 'react-native';

const OrderConfirm = ({ navigation, route }: MainNavigationProps<'OrderConfirm'>) => {
    const { code } = route.params || {};
    const [orderData, setOrderData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const orderFields = [
        { label: 'Mã đơn', value: orderData?.orderNo, icon: <MaterialCommunityIcons name="fingerprint" size={24} color="#6266F1" /> },
        { label: 'Mã hoá chất', value: orderData?.bomNo, icon: <MaterialCommunityIcons name="barcode" size={24} color="#6266F1" /> },
        { label: 'Màu sắc', value: orderData?.color, icon: <Ionicons name="color-palette-outline" size={24} color="#6266F1" /> },
        { label: 'Trọng lượng', value: orderData?.actualWeight ? orderData?.actualWeight + 'kg' : '', icon: <MaterialCommunityIcons name="weight" size={24} color="#6266F1" /> },
        { label: 'Độ dày', value: orderData?.thickness ? orderData?.thickness + 'mm' : '', icon: <MaterialCommunityIcons name="format-line-weight" size={24} color="#6266F1" /> },
        { label: 'Thời gian bắt đầu', value: formatDateCustom(orderData?.startDrum, { format: 'HH:mm' }), icon: <MaterialCommunityIcons name="clock-outline" size={24} color="#6266F1" /> },
    ];

    const { getData, postData, loading } = useAPI();
    const { setOrderStore, setBatchsStore, setGroupedChemicals } = useOperationStore();
    const { fullName } = useAuthStore();

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

    const checkTimeData = (batchsStore: any[]) => {
        const groupedByTime: { [key: string]: any[] } = {};
        batchsStore.forEach((chemical: any) => {
            const confirmTime = chemical.confirmTime;
            if (!groupedByTime[confirmTime]) {
                groupedByTime[confirmTime] = [];
            }
            groupedByTime[confirmTime].push(chemical);
        });

        const timeKeys = Object.keys(groupedByTime);
        if (timeKeys.length <= 1) {
            Alert.alert('Thông báo', 'Đơn hàng này không có dữ liệu thời gian', [{ text: 'OK', onPress: () => { }, style: 'cancel' },]);
            return false;
        }
        return true;
    };

    const handleConfirm = async () => {
        try {
            if (!orderData) { return; }

            let processData;
            let isNewInit = false;

            const resRunning = await getData('portal/inject/getRunning', { drumNo: orderData.drumNo }, false);

            if (resRunning.code === 0 && resRunning?.data?.process) {
                processData = resRunning.data;
            } else {
                const resInit = await postData(`portal/inject/initProject?fid=${orderData.id}&employee=${fullName}`);

                if (resInit.code !== 0) {
                    Alert.alert('Thông báo', resInit.msg, [{ text: 'OK', onPress: () => { }, style: 'cancel' },]);
                    return;
                }

                const res = await getData('portal/inject/getRunning', { drumNo: orderData.drumNo }, false);
                processData = { ...res.data, dtl: resInit.data.dtl };
                isNewInit = true;
            }

            const { dtl, process, curentTime, config, appInjectPause } = processData;

            if (!checkTimeData(dtl)) { return; }

            const groupedChemicals = groupChemicalsByTime(dtl);

            await Promise.all([
                setOrderStore({
                    process,
                    currentTime: curentTime,
                    config,
                    appInjectPause,
                }),
                setBatchsStore(dtl),
            ]);

            setGroupedChemicals(groupedChemicals);

            navigation.reset({
                index: 0,
                routes: [{
                    name: 'Operation',
                    ...(isNewInit && { params: { init: true } }),
                }],
            });

        } catch (err: any) {
            showToast(err);
        }
    };

    const groupChemicalsByTime = (dtl: any[]) => {
        const groupedByTime = dtl.reduce((acc, chemical) => {
            const { confirmTime } = chemical;
            if (!acc[confirmTime]) {
                acc[confirmTime] = [];
            }
            acc[confirmTime].push(chemical);
            return acc;
        }, {} as Record<string, any[]>);

        return Object.keys(groupedByTime)
            .sort()
            .map(time => ({
                time,
                chemicals: groupedByTime[time],
            }));
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
