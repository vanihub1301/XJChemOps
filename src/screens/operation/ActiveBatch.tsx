import React, { useCallback } from 'react';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PillBadge from '../../components/common/PillBadge';
import { useOperationStore } from '../../store/operationStore';
import Card from '../../components/common/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Chemical } from '../../types/drum';
import List from '../../components/common/List';
import { StyleSheet } from 'react-native';
import { formatDateCustom } from '../../utils/dateTime';

interface ActiveBatchProps {
    onStopPress: () => void;
    onPausePress: () => void;
    onChangeOperator?: () => void;
}

const ActiveBatch: React.FC<ActiveBatchProps> = ({
    onStopPress,
    onPausePress,
    onChangeOperator,
}) => {
    const { batchsStore, isPause } = useOperationStore();
    const processColors: Record<string, string> = {
        '1': '#4FC3F7',
        '2': '#81C784',
        '3': '#FFD54F',
        '4': '#FF8A65',
        '5': '#BA68C8',
        '6': '#F06292',
        '7': '#4DB6AC',
    };

    const renderItem = useCallback(({ item: chemical }: { item: Chemical }) => {
        return (
            <Card
                key={chemical.id}
                padding={'md'}
                className="mb-4"
                style={styles.boxShadow}
            >
                <ViewBox gap="sm">
                    <ViewBox className="flex-row items-center justify-between">
                        <ViewBox className="flex-row items-center gap-2 flex-1">
                            <ViewBox
                                background={chemical.scanning ? 'blurLavender' : 'blurGray'}
                                radius={'xl'}
                                padding={'sm'}
                                className="w-14 h-14 items-center justify-center"
                                border={'gray'}
                            >
                                <Ionicons
                                    name="flask"
                                    size={26}
                                    color={chemical.scanning ? '#6165EE' : '#9CA3AF'}
                                />
                            </ViewBox>

                            <ViewBox gap="xxs" className="flex-1">
                                <ViewBox className="flex-row items-center">
                                    <Text variant="labelLargeStrong" color="black" numberOfLines={1}>
                                        {chemical.processCode} | {chemical.materialCode}-{chemical.materialName}
                                    </Text>
                                    <Text className="flex-1 text-right pr-20" variant="labelLargeStrong" color="black" numberOfLines={1}>
                                        {chemical.actualWeight}kg
                                    </Text>
                                </ViewBox>
                                <ViewBox className="flex-row items-center">
                                    <ViewBox gap="md" className="flex-row items-center">
                                        {chemical.autoFeed && (
                                            <Text variant="label" numberOfLines={1}>
                                                Đường ống {chemical.pipelineNo}
                                            </Text>
                                        )}
                                    </ViewBox>
                                    <ViewBox gap={'xxs'} className="flex-row items-center flex-1 justify-end pr-20">
                                        <MaterialCommunityIcons
                                            name="clock-outline"
                                            size={18}
                                            color={'#6165EE'}
                                        />
                                        <Text variant="label" color="primary">
                                            Ngày {formatDateCustom(chemical.confirmTime, { format: 'dd' })} Tháng {formatDateCustom(chemical.confirmTime, { format: 'MM' })} {formatDateCustom(chemical.confirmTime, { format: 'HH:mm' })}
                                        </Text>
                                    </ViewBox>
                                </ViewBox>
                            </ViewBox>
                        </ViewBox>

                        {chemical.scanning ? (
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={28}
                                color="#6165EE"
                            />
                        ) : (
                            <ViewBox
                                className="w-7 h-7 rounded-full border-2 border-gray-300"
                            />
                        )}
                    </ViewBox>
                </ViewBox>
            </Card>
        );
    }, []);

    return (
        <ViewBox gap={'md'} className="h-[55%]">
            <ViewBox className="flex-row items-center justify-between">
                <Text color={'black'} variant={'labelLargeStrong'}>DANH SÁCH HOÁ CHẤT</Text>
                <PillBadge
                    label={`${batchsStore?.filter((c: any) => c.scanning)?.length || 0}/${batchsStore?.length || 0} Đã hoàn tất`}
                    background="blurLavender"
                    textColor="crayola"
                />
            </ViewBox>
            <ViewBox gap={'sm'} className="flex-1">
                <List
                    list={batchsStore}
                    renderListHeader={() => (<></>)}
                    renderItem={renderItem}
                    enableRefresh={false}
                />
            </ViewBox>

            {onChangeOperator && (
                <Button
                    label="Thay đổi người vận hành"
                    variant="secondary"
                    radius="xl"
                    size="lg"
                    onPress={onChangeOperator}
                    className="items-center flex-row"
                    iconPosition="left"
                >
                    <MaterialCommunityIcons name="account-switch" size={20} color="#6266F1" />
                </Button>
            )}

            <ViewBox gap={'md'} className="w-full flex-row items-center justify-between">
                <ViewBox className="flex-1">
                    <Button
                        label="DỪNG KHẨN CẤP"
                        variant="third"
                        radius="xl"
                        size="lg"
                        onPress={onStopPress}
                        className="flex-row items-center"
                        iconPosition="left"
                    >
                        <MaterialCommunityIcons name="alert-octagon" size={20} color="white" />
                    </Button>
                </ViewBox>
                <Button
                    label={isPause ? 'Tiếp tục' : 'Tạm dừng'}
                    variant={isPause ? 'primary' : 'secondary'}
                    radius="xl"
                    size="lg"
                    onPress={onPausePress}
                    className="flex-row items-center"
                    iconPosition="left"
                >
                    <MaterialCommunityIcons name={isPause ? 'play-circle' : 'pause-circle'} size={20} color={isPause ? 'white' : '#6266F1'} />
                </Button>
            </ViewBox>
        </ViewBox>
    );
};

const styles = StyleSheet.create({
    boxShadow: {
        shadowColor: 'gray',
        elevation: 3,
    },
});

export default ActiveBatch;
