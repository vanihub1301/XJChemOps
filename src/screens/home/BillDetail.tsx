import React from 'react';
import { StyleSheet } from 'react-native';
import ViewContainer from '../../components/common/ViewContainer';
import ViewHeader from '../../components/common/ViewHeader';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import Card from '../../components/common/Card';
import { AppNavigationProps } from '../../types/navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import PillBadge from '../../components/common/PillBadge';
import { formatDateCustom } from '../../utils/dateTime';

const BillDetail = ({ route }: AppNavigationProps<'BillDetail'>) => {
    const { order } = route.params;

    const orderFields = [
        {
            label: 'Mã đơn hàng',
            value: order.code,
            icon: <MaterialCommunityIcons name="file-document" size={20} color="#9B95EF" />,
        },
        {
            label: 'Màu sắc',
            value: order.color,
            icon: <MaterialCommunityIcons name="palette" size={20} color="#9B95EF" />,
        },
        {
            label: 'Độ dày',
            value: order.thickness ? order.thickness + 'mm' : 'N/A',
            icon: <MaterialCommunityIcons name="format-line-weight" size={20} color="#9B95EF" />,
        },
        {
            label: 'Khối lượng',
            value: order.actualWeight ? order.actualWeight + 'kg' : 'N/A',
            icon: <FontAwesome5 name="weight-hanging" size={20} color="#9B95EF" />,
        },
        {
            label: 'Thời gian bắt đầu',
            value: order.startDrum ? formatDateCustom(order.startDrum, { format: 'HH:mm dd/MM/yyyy' }) : 'N/A',
            icon: <MaterialCommunityIcons name="clock-start" size={20} color="#9B95EF" />,
        },
        {
            label: 'Thời gian hoàn thành',
            value: order.finishTime ? formatDateCustom(order.finishTime, { format: 'HH:mm dd/MM/yyyy' }) : 'N/A',
            icon: <MaterialCommunityIcons name="clock-check" size={20} color="#9B95EF" />,
        },
    ];

    return (
        <ViewContainer hasScrollableContent={true}>
            <ViewHeader title="Chi tiết đơn hàng" border={true} />
            <ViewBox padding="lg" gap="lg" className="flex-1">
                <Card background="white" radius="xxxl" style={styles.shadowCard}>
                    <ViewBox gap="md" className="items-center justify-center py-8">
                        <ViewBox background="blurGreen" radius="full" className="w-20 h-20 items-center justify-center">
                            <FontAwesome5 name="check" size={40} color="#1DC376" />
                        </ViewBox>
                        <ViewBox gap="xs" className="items-center">
                            <Text variant="labelLargeStrong" color="black">
                                {order.code}
                            </Text>
                            <PillBadge
                                label="Đã hoàn thành"
                                background="lightGreen"
                                textColor="green"
                                radius="xxl"
                            />
                        </ViewBox>
                    </ViewBox>
                </Card>

                <Card background="white" radius="xxxl" style={styles.shadowCard}>
                    <ViewBox gap="md">
                        <Text variant="labelLargeStrong" color="black">
                            THÔNG TIN ĐƠN HÀNG
                        </Text>
                        {orderFields.map((field, index) => (
                            <ViewBox
                                key={index}
                                className="flex-row justify-between items-center py-3"
                                style={index < orderFields.length - 1 ? styles.borderBottom : {}}
                            >
                                <ViewBox gap="sm" className="flex-row items-center flex-1">
                                    {field.icon}
                                    <Text variant="label" color="lightGray">
                                        {field.label}
                                    </Text>
                                </ViewBox>
                                <Text variant="labelStrong" color="black" className="flex-shrink">
                                    {field.value}
                                </Text>
                            </ViewBox>
                        ))}
                    </ViewBox>
                </Card>
            </ViewBox>
        </ViewContainer>
    );
};

const styles = StyleSheet.create({
    shadowCard: {
        shadowColor: 'gray',
        elevation: 2,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
});

export default BillDetail;
