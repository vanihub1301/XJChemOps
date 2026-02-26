import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOperationStore } from '../../store/operationStore';
import Card from '../../components/common/Card';
import List from '../../components/common/List';
import { formatDateCustom } from '../../utils/dateTime';
import { useAuthStore } from '../../store/authStore';
import { Chemical } from '../../types/drum';

interface HistoryBatchProps {
    videoUploading: boolean;
}

const HistoryBatch: React.FC<HistoryBatchProps> = ({ videoUploading }) => {
    const { batchsStore, orderStore } = useOperationStore();
    const { fullName } = useAuthStore();

    const historyOperation = useMemo(() => [
        ...(videoUploading ? [{ type: 'VIDEO_UPLOADING' }] : []),
        ...batchsStore
            .filter(item => item.videoFk)
            .sort((a, b) => new Date(a.confirmTime).getTime() - new Date(b.confirmTime).getTime())
            .reverse(),
        {
            type: 'START_OPERATION',
            confirmTime: orderStore?.process?.startDrum,
        },
    ], [batchsStore, orderStore?.process?.startDrum, videoUploading]);

    const renderHistoryItem = useCallback(
        ({ item, index }: { item: Chemical; index: number }) => {
            const isLast = index === historyOperation.length - 1;

            if ((item as any).type === 'VIDEO_UPLOADING') {
                return (
                    <ViewBox gap="md" className="flex-row items-start">
                        <ViewBox className="items-center w-6">
                            <ActivityIndicator size="small" color="#6165EE" style={{ marginTop: 4 }} />
                            <ViewBox background="lightGray" className="w-0.5 flex-1 mt-1 min-h-20" />
                        </ViewBox>
                        <ViewBox className="flex-1" gap="xs">
                            <Text color="black" variant="labelStrong">Đang tải video lên...</Text>
                            <Text color="primary" variant="captionMedium">Vui lòng không thoát ứng dụng</Text>
                        </ViewBox>
                    </ViewBox>
                );
            }

            return (
                <ViewBox gap="md" className="flex-row items-start">
                    <ViewBox className="items-center w-6">
                        <ViewBox
                            radius="full"
                            background={isLast ? 'lightGray' : 'crayola'}
                            className="w-2.5 h-2.5 mt-2"
                        />
                        {!isLast && (
                            <ViewBox
                                background="lightGray"
                                className="w-0.5 flex-1 mt-1 min-h-20"
                            />
                        )}
                    </ViewBox>

                    {isLast ? (
                        <ViewBox className="flex-1" gap="xs">
                            <ViewBox className="flex-row justify-between">
                                <Text color="black" variant="labelStrong">
                                    Bắt đầu vận hành
                                </Text>
                                <Text color="primary" variant="captionMedium">
                                    {formatDateCustom(item.confirmTime, { format: 'HH:mm' })}
                                </Text>
                            </ViewBox>
                            <Text color="primary" variant="captionMedium">
                                Người vận hành: {fullName || 'ADMIN'}
                            </Text>
                        </ViewBox>
                    ) : (
                        <ViewBox className="flex-1" gap="xs">
                            <ViewBox className="flex-row justify-between">
                                <Text color="black" variant="labelStrong">
                                    Đã đổ {item.materialName} ({item.processCode})
                                </Text>
                                <Text color="primary" variant="captionMedium">
                                    {formatDateCustom(item.realConfirmTime, { format: 'HH:mm' })}
                                </Text>
                            </ViewBox>
                            <Text color="primary" variant="captionMedium">
                                Khối lượng: {item.actualWeight}kg | Quét: S01
                            </Text>
                        </ViewBox>
                    )}
                </ViewBox>
            );
        }, [historyOperation, fullName]);

    return (
        <Card className="flex-1" gap={'md'}>
            <ViewBox gap={'xs'} className="flex-row items-center">
                <MaterialCommunityIcons name="history" size={20} color="#6165EE" />
                <Text color={'black'} variant={'labelLargeStrong'}>LỊCH SỬ VẬN HÀNH</Text>
            </ViewBox>
            <List
                list={historyOperation as any[]}
                renderListHeader={() => (<></>)}
                renderItem={renderHistoryItem}
                enableRefresh={false}
            />
        </Card>
    );
};

export default HistoryBatch;
