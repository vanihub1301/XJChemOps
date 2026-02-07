import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import ViewContainer from '../../components/common/ViewContainer';
import ViewHeader from '../../components/common/ViewHeader';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import Card from '../../components/common/Card';
import List from '../../components/common/List';
import { AppNavigationProps } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useAPI } from '../../service/api';
import { showToast } from '../../service/toast';
import { formatDateCustom } from '../../utils/dateTime';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const NearBill = ({ navigation }: AppNavigationProps<'NearBill'>) => {
    const [listOrder, setListOrder] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const { getData } = useAPI();
    const { rotatingTank } = useAuthStore();

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const res = await getData('portal/inject/nearBill', { drum: rotatingTank?.name });
            setListOrder(res.data.records);
        } catch (error: any) {
            showToast(error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [rotatingTank]);

    const renderOrderItem = useCallback(({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BillDetail', { order: item })}
            key={item.id}
        >
            <Card
                style={styles.shadowCard}
                radius="xxxl"
                className="flex-1 mb-3 flex-row items-center justify-between border border-gray-100"
            >
                <ViewBox gap={'md'} className="flex-row items-center">
                    <ViewBox background={'gray'} radius={'full'} className="w-12 h-12 justify-center items-center">
                        <Feather name="package" size={24} color="#9AA0B6" />
                    </ViewBox>
                    <ViewBox gap={'xs'}>
                        <Text color={'black'} variant={'labelLargeStrong'}>{item.code}</Text>
                        <Text variant={'label'}>
                            {formatDateCustom(item.finishTime, { format: 'HH:mm' })} | {item.color} | {item.thickness ? item.thickness + 'mm' : 'N/A'} | {item.actualWeight ? item.actualWeight + 'kg' : 'N/A'}
                        </Text>
                    </ViewBox>
                </ViewBox>
                <ViewBox background={'blurGreen'} radius={'full'} className="w-8 h-8 justify-center items-center">
                    <FontAwesome5 name="check" size={14} color="#1DC376" />
                </ViewBox>
            </Card>
        </TouchableOpacity>
    ), [navigation]);

    return (
        <ViewContainer hasScrollableContent={true}>
            <ViewHeader title="Danh sách đơn" border={true} />
            <ViewBox padding="lg" className="flex-1">
                <List
                    list={listOrder}
                    renderItem={renderOrderItem}
                    refreshing={refreshing}
                    onRefresh={fetchData}
                />
            </ViewBox>
        </ViewContainer>
    );
};

const styles = StyleSheet.create({
    shadowCard: {
        shadowColor: 'gray',
        elevation: 1,
    },
});

export default NearBill;
