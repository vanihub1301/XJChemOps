import { Text } from '../../components/common/Text';
import { ViewBox } from '../../components/common/ViewBox';
import ViewContainer from '../../components/common/ViewContainer';
import { AppNavigationProps } from '../../types/navigation';
import ViewHeader from '../../components/common/ViewHeader';
import React, { useCallback, useEffect, useRef } from 'react';
import { parseDateTime } from '../../utils/dateTime';
import { useVideoStore } from '../../store/videoStore';
import { useAPI } from '../../service/api';
import { Alert, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import BottomSheetSelect from '../../components/bottomsheet/BottomSheetSelect';
import ActiveBatch from './ActiveBatch';
import { useFocusEffect } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import { useAlarmSound } from '../../hooks/useAlarmSound';
import { useOperationStore } from '../../store/operationStore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ChemicalAlertModal from './ChemicalAlertModal';
import { showToast } from '../../service/toast';
import { SplashScreen } from '../../components/app/SplashScreen';
import HistoryBatch from './HistoryBatch';
import { uploadFile } from '../../service/axios';
import { unlink } from 'react-native-fs';

const Operation = ({ navigation, route }: AppNavigationProps<'Operation'>) => {
    const { order, init } = route.params;
    const [modalVisible, setModalVisible] = React.useState(false);
    const [alertedTimes, setAlertedTimes] = React.useState<Set<string>>(new Set());

    const { videoStatus, videoPath } = useVideoStore();
    const { orderStore, batchsStore, groupedChemicals, isPause, setBatchsStore, setOrderStore, setGroupedChemicals, setCurrentChemicals, setIsPause } = useOperationStore();
    const { getData, postData } = useAPI();

    const { play } = useAlarmSound(orderStore?.config?.enableSound);

    const settingBottomSheetRef = useRef<BottomSheet>(null);
    const isFistMount = useRef(true);

    const handleSettingPress = () => {
        settingBottomSheetRef.current?.expand();
    };
    const handleSettingClose = () => {
        settingBottomSheetRef.current?.close();
    };

    const handleUploadVideo = useCallback(async () => {
        try {
            const chemicals = groupedChemicals?.[0]?.chemicals ?? [];
            const fentryid = chemicals.map((i) => i.id).join(',');
            const { code, data, msg } = await uploadFile(videoPath, `video_${Date.now()}.mp4`, 'video/mp4');
            console.log('LOG : Operation : videoPath:', videoPath)
            console.log(`LOG : Operation : { code, data, msg }:`, { code, data, msg })

            if (code !== 0) {
                return showToast(msg);
            }

            const res = await getData('portal/inject/update', {
                employee: 'NGUYỄN THỊ THOẢNG',
                videoFk: data,
                fentryid,
            });

            if (res.code !== 0) {
                return showToast(res.msg);
            }
            showToast('Video đã được ghi thành công');
        } catch {
            showToast('Video đã được ghi thất bại');
        } finally {
            await unlink(videoPath.replace('content://', ''));
        }
    }, [groupedChemicals, videoPath]);

    const handleStopPress = async () => {
        navigation.navigate('FormStopOperation', {
            operation: order,
        });
        // // handleModalRecord();
    };

    const handlePausePress = async () => {
        try {
            Alert.alert(isPause ? 'Tiếp tục' : 'Tạm dừng', `Bạn có chắc chắn muốn ${isPause ? 'tiếp tục' : 'tạm dừng'}?`, [
                {
                    text: 'Hủy',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        const now = new Date(orderStore.currentTime.replace(' ', 'T')).getTime();

                        const nextChemical = groupedChemicals.findIndex(item => new Date(item.time.replace(' ', 'T')).getTime() > now);

                        let result: any;

                        if (isPause) {
                            result = await postData('portal/inject/pause', {
                                processFk: groupedChemicals[nextChemical - 1]?.chemicals[0].processFk,
                                orderBill: order?.orderNo,
                                bomNo: order?.bomNo,
                                continueTime: orderStore?.currentTime,
                            });
                            setIsPause(false);
                        } else {
                            result = await postData('portal/inject/pause', {
                                processFk: batchsStore[nextChemical - 1]?.processFk,
                                orderBill: order?.orderNo,
                                bomNo: order?.bomNo,
                                pauseTime: orderStore?.currentTime,
                            });
                        }

                        if (result.code === 0) {
                            setIsPause(true);
                        } else {
                            showToast(result.msg);
                        }
                    },
                },
            ]);

        } catch (err: any) {
            showToast(err);
        }
    };

    const handleOperatorChange = () => {
        navigation.navigate('OperatorLogin');
    };

    const handleModalRecord = () => {
        setModalVisible(false);
        navigation.navigate('Video', {
            autoRecord: true,
        });
    };

    const handleModalDismiss = () => {
        setModalVisible(false);
    };

    const handleOptionSelection = async (value: any) => {
        switch (value) {
            case 'extra':
                navigation.navigate('ScanQR', {
                    nextScreen: 'OrderConfirm',
                });
                break;
            case 'time':
                navigation.navigate('FormChangeStartTime', {
                    operation: order,
                });
                break;
            default:
                break;
        }
        handleSettingClose();
    };

    useEffect(() => {
        if (!batchsStore || batchsStore.length === 0) {
            setGroupedChemicals([]);
            return;
        }

        if (batchsStore.length === 0) {
            setGroupedChemicals([]);
            return;
        }

        const groupedByTime: { [key: string]: any[] } = {};
        batchsStore.forEach((chemical: any) => {
            const confirmTime = chemical.confirmTime;
            if (!groupedByTime[confirmTime]) {
                groupedByTime[confirmTime] = [];
            }
            groupedByTime[confirmTime].push(chemical);
        });

        const grouped = Object.keys(groupedByTime)
            .sort()
            .map(time => ({
                time,
                chemicals: groupedByTime[time],
            }));
        console.log('LOG : Operation : grouped:', grouped);
        console.log('LOG : Operation : config:', orderStore.config);
        console.log('LOG : Operation : currentTime:', orderStore.currentTime);

        setGroupedChemicals(grouped);
    }, [batchsStore, setGroupedChemicals]);

    useEffect(() => {
        if (groupedChemicals.length === 0) {
            return;
        }

        if (!orderStore?.currentTime) {
            return;
        }

        const serverNowMs = parseDateTime(orderStore.currentTime);

        for (const group of groupedChemicals) {
            if (alertedTimes.has(group.time)) {
                continue;
            }

            const confirmTimeMs = parseDateTime(group.time);
            const timeUntilConfirm = confirmTimeMs - serverNowMs;
            const secondsUntilConfirm = Math.floor(timeUntilConfirm / 1000);

            if (secondsUntilConfirm <= 15 && secondsUntilConfirm > 0) {
                setCurrentChemicals(group.chemicals);
                setModalVisible(true);
                play();
                setAlertedTimes(prev => new Set(prev).add(group.time));
                break;
            }
        }
    }, [groupedChemicals, alertedTimes, play, setCurrentChemicals, orderStore]);

    useEffect(() => {
        const handler = async () => {
            if (videoStatus === 'saved' && videoPath) {
                handleUploadVideo();
                useVideoStore.getState().markIdle();
            }
        };
        handler();
    }, [videoStatus, handleUploadVideo, videoPath]);

    useEffect(() => {
        if (init && groupedChemicals && groupedChemicals.length > 0) {
            const firstGroup = groupedChemicals[0];
            setCurrentChemicals(firstGroup.chemicals);
            setModalVisible(true);
            play();
        }
    }, [init]);

    useEffect(() => {
        if (!order?.drumNo || isFistMount.current) {
            isFistMount.current = false;
            return;
        }

        const fetchRunningData = async () => {
            try {
                const res = await getData('portal/inject/getRunning', { drumNo: order.drumNo });
                if (res.code === 0 && res.data?.process?.dtl) {
                    const { dtl, ...processWithoutDtl } = res.data.process;

                    await Promise.all([
                        setOrderStore({
                            process: processWithoutDtl,
                            currentTime: res.data?.curentTime,
                            config: res.data?.config,
                            appInjectPause: res.data?.appInjectPause,
                        }),
                        setBatchsStore(dtl),
                    ]);
                }
            } catch (error) {
                showToast('Lỗi khi tải dữ liệu');
            }
        };

        fetchRunningData();

        const intervalMs = (parseInt(orderStore?.config?.inspectionTime, 10) || 30) * 1000;
        const interval = setInterval(fetchRunningData, intervalMs);

        return () => clearInterval(interval);
    }, [order?.drumNo, getData, setBatchsStore]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const actionType = e.data.action.type;

            if (actionType === 'GO_BACK' || actionType === 'POP') {
                e.preventDefault();
            }
        });

        return unsubscribe;
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            if (orderStore?.config?.lockScreen === false) {
                KeepAwake.activate();
            }

            return () => {
                KeepAwake.deactivate();
            };
        }, [orderStore?.config?.lockScreen])
    );

    if (!batchsStore) {
        return <SplashScreen text="Đang tải dữ liệu..." />;
    }

    return (
        <>
            <ViewContainer background="bg-[#F9F8FC]" hasScrollableContent={true}>
                <ViewHeader background="white" title={'Đang Vận Hành'} border={true} enableBack={false}>
                    <TouchableOpacity onPress={handleSettingPress}>
                        <MaterialCommunityIcons name="cog" size={30} color="#6165EE" />
                    </TouchableOpacity>
                </ViewHeader>
                <ViewBox className="flex-1" padding={'lg'} gap={'lg'}>
                    <Card className="flex-row items-center justify-between">
                        <ViewBox gap={'xs'}>
                            <ViewBox gap={'sm'} className="flex-row items-center">
                                <MaterialCommunityIcons name="robot-industrial" size={14} color="#6165EE" />
                                <Text variant={'captionStrong'} color={'crayola'}>LỆNH SẢN XUẤT</Text>
                            </ViewBox>
                            <Text color={'black'} variant={'sectionTitle'}>Mã đơn: {order?.orderNo}</Text>
                            <Text variant={'label'} >Vị trí: Bồn {order?.drumNo}</Text>
                        </ViewBox>
                        <ViewBox radius={'xxl'} background={'blurLavender'} padding={'md'}>
                            <MaterialIcons name="factory" size={42} color="#6165EE" />
                        </ViewBox>
                    </Card>

                    <ActiveBatch
                        onStopPress={handleStopPress}
                        onPausePress={handlePausePress}
                        onChangeOperator={handleOperatorChange}
                    />
                    <HistoryBatch />
                </ViewBox>
                <ChemicalAlertModal
                    visible={modalVisible}
                    onRecord={handleModalRecord}
                    onDismiss={handleModalDismiss}
                />
            </ViewContainer>

            <BottomSheetSelect
                ref={settingBottomSheetRef}
                sheetType="setting"
                onSelection={handleOptionSelection}
                snapPoints={['30%']}
                onClose={handleSettingClose}
            >
                <></>
            </BottomSheetSelect>
        </>
    );
};

export default Operation;
