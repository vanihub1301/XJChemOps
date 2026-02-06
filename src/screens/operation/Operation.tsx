import { Text } from '../../components/common/Text';
import { ViewBox } from '../../components/common/ViewBox';
import ViewContainer from '../../components/common/ViewContainer';
import { AppNavigationProps } from '../../types/navigation';
import ViewHeader from '../../components/common/ViewHeader';
import React, { useCallback, useEffect, useRef } from 'react';
import { formatDateCustom, parseDateTime } from '../../utils/dateTime';
import { useVideoStore } from '../../store/videoStore';
import { useAPI } from '../../service/api';
import { useSettingStore } from '../../store/settingStore';
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
import { getFileInfo } from '../../utils/file';

const Operation = ({ navigation, route }: AppNavigationProps<'Operation'>) => {
    const { order } = route.params;
    const [now, setNow] = React.useState(Date.now());
    const [fakeLoading, setFakeLoading] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [alertedTimes, setAlertedTimes] = React.useState<Set<string>>(new Set());

    const { videoStatus, videoPath } = useVideoStore();
    const { batchsStore, groupedChemicals, isPause, setBatchsStore, setIsAlert, setGroupedChemicals, setCurrentChemicals, setIsPause } = useOperationStore();
    const { checkInterval } = useSettingStore();
    const { getData, postData } = useAPI();

    const { play } = useAlarmSound();

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
            const fileInfo = getFileInfo(videoPath);
            const videoFile = await uploadFile(videoPath, fileInfo.fileName, fileInfo.mimeType);
            console.log('LOG : Operation : videoFile:', videoFile)
            const batchUpdate = await getData('portal/inject/update', {
                employee: 'NGUYỄN THỊ THOẢNG',
                videoFk: videoFile.data,
                fentryid: []
            });
            console.log('LOG : Operation : batchUpdate:', batchUpdate)

            // showToast('Video đã được ghi thành công');

        } catch (error) {

        }

    }, []);

    const handleStopPress = () => {
        navigation.navigate('FormStopOperation', {
            operation: order,
        });
        // handleModalRecord();
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
                        const nextChemical = batchsStore.findIndex(
                            (item) => new Date(item.confirmTime.replace(' ', 'T')).getTime() > Date.now()
                        );
                        let result: any;

                        if (isPause) {
                            result = await postData('portal/inject/pause', {
                                processFk: batchsStore[nextChemical - 1]?.processFk,
                                orderBill: order?.orderNo,
                                bomNo: order?.bomNo,
                                continueTime: formatDateCustom(new Date().toISOString(), { format: 'yyyy-MM-dd HH:mm:ss' }),
                            });
                            console.log('LOG : handlePausePress : result:', result);
                            setIsPause(false);
                        } else {
                            result = await postData('portal/inject/pause', {
                                processFk: batchsStore[nextChemical - 1]?.processFk,
                                orderBill: order?.orderNo,
                                bomNo: order?.bomNo,
                                pauseTime: formatDateCustom(new Date().toISOString(), { format: 'yyyy-MM-dd HH:mm:ss' }),
                            });
                        }

                        if (result.code === 0) {
                            setIsPause(true);
                        } else {
                            showToast(result.msg);
                        }
                        console.log('LOG : handlePausePress : result:', result);
                    },
                },
            ]);

        } catch (err: any) {
            showToast(err);
        }
    };

    const handleOperatorChange = () => {
        navigation.navigate('Authentication');
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

        const pendingChemicals = batchsStore.filter((chemical: any) => !chemical.isAppend);

        if (pendingChemicals.length === 0) {
            setGroupedChemicals([]);
            return;
        }

        const groupedByTime: { [key: string]: any[] } = {};
        pendingChemicals.forEach((chemical: any) => {
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
        console.log('LOG : Operation : grouped:', grouped)

        setGroupedChemicals(grouped);
    }, [batchsStore, setGroupedChemicals]);

    useEffect(() => {
        if (groupedChemicals.length === 0) {
            return;
        }

        for (const group of groupedChemicals) {
            if (alertedTimes.has(group.time)) {
                continue;
            }

            const confirmTimeMs = parseDateTime(group.time);
            const timeUntilConfirm = confirmTimeMs - now;
            const secondsUntilConfirm = Math.floor(timeUntilConfirm / 1000);

            if (secondsUntilConfirm <= 15 && secondsUntilConfirm > 0) {
                setCurrentChemicals(group.chemicals);
                setModalVisible(true);
                play();
                setIsAlert(true);
                setAlertedTimes(prev => new Set(prev).add(group.time));
                break;
            }
        }
    }, [now, groupedChemicals, alertedTimes, play, setIsAlert, setCurrentChemicals]);

    useEffect(() => {
        const handler = async () => {
            if (videoStatus === 'saved' && videoPath) {
                handleUploadVideo();
                useVideoStore.getState().markIdle();
                setIsAlert(false);
            }
        };
        handler();
    }, [videoStatus, setIsAlert, handleUploadVideo, videoPath]);

    useEffect(() => {
        setNow(Date.now());

        const interval = setInterval(() => {
            setNow(Date.now());
        }, 30_000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!order?.drumNo || isFistMount.current) {
            isFistMount.current = false;
            return;
        }

        const fetchRunningData = async () => {
            try {
                const res = await getData('portal/inject/getRunning', { drumNo: order.drumNo });
                if (res.code === 0 && res.data?.process?.dtl) {
                    setBatchsStore(res.data.process.dtl);
                }
            } catch (error) {
                showToast('Lỗi khi tải dữ liệu');
            }
        };

        fetchRunningData();

        const intervalMs = (parseInt(checkInterval, 10) || 30) * 1000;
        const interval = setInterval(fetchRunningData, intervalMs);

        return () => clearInterval(interval);
    }, [order?.drumNo, checkInterval, getData, setBatchsStore]);

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
            KeepAwake.activate();
            return () => {
                KeepAwake.deactivate();
            };
        }, [])
    );

    if (!batchsStore) {
        return <SplashScreen text="Đang tải dữ liệu..." />;
    }

    return (
        <>
            <ViewContainer background="bg-[#F9F8FC]" hasScrollableContent={true}>
                <ViewHeader background="white" title={'Đang Vận Hành'} border={true} >
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
                        loading={fakeLoading}
                        disabled={fakeLoading}
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
