import { Text } from '../../components/common/Text';
import { ViewBox } from '../../components/common/ViewBox';
import ViewContainer from '../../components/common/ViewContainer';
import { MainNavigationProps } from '../../types/navigation';
import ViewHeader from '../../components/common/ViewHeader';
import React, { useCallback, useEffect, useRef } from 'react';
import { parseDateTime } from '../../utils/dateTime';
import { useVideoStore } from '../../store/videoStore';
import { useAPI } from '../../service/api';
import { Alert, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import BottomSheetSelect from '../../components/bottomsheet/BottomSheetSelect';
import ActiveBatch from './ActiveBatch';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
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
import { Chemical } from '../../types/drum';
import { useAuthStore } from '../../store/authStore';
import { useSettingStore } from '../../store/settingStore';

const Operation = ({ navigation, route }: MainNavigationProps<'Operation'>) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [alertedTimes, setAlertedTimes] = React.useState<Set<string>>(new Set());
    const [upcomingChemicals, setUpcomingChemicals] = React.useState<Chemical[]>([]);
    const [videoUploading, setVideoUploading] = React.useState(false);
    const { videoStatus, videoPath, markIdle } = useVideoStore();
    const { lockScreen, enableSound, alarmUrl } = useSettingStore();

    const { currentTime, currentChemicals, orderStore, batchsStore, groupedChemicals, isPause, isProcessComplete, setIsPause, reset, setMany, maxDuration } = useOperationStore();
    const { getData, postData, putData } = useAPI();
    const { play, stop } = useAlarmSound(enableSound, alarmUrl);
    const { fullName } = useAuthStore();

    const lastServerTimeRef = useRef<{ serverMs: number; localTick: number } | null>(null);
    const groupedChemicalsRef = useRef(groupedChemicals);
    const currentChemicalsRef = useRef(currentChemicals);
    const alertedTimesRef = useRef(alertedTimes);
    const isPauseRef = useRef(isPause);
    const maxDurationRef = useRef(maxDuration);
    const settingBottomSheetRef = useRef<BottomSheet>(null);
    const initRef = useRef(true);
    const isFocused = useIsFocused();
    const upcomingVideoStopMsRef = useRef<number>(0);

    const handleSettingPress = () => {
        settingBottomSheetRef.current?.expand();
    };
    const handleSettingClose = () => {
        settingBottomSheetRef.current?.close();
    };

    const handleUploadVideo = useCallback(async (videoPath: string) => {
        try {
            setVideoUploading(true);
            console.log('LOG : Operation : currentChemicals:', currentChemicalsRef.current)
            const fentryid = currentChemicalsRef.current.map(i => i.id);

            const presignedUrl = await getData('portal/inject/video-url');
            if (!presignedUrl) {
                showToast('Không lấy được link upload');
                return;
            }

            const uploadRes = await uploadFile(videoPath, presignedUrl);

            if (uploadRes?.status !== 200) {
                showToast('Video đã được ghi thất bại');
                return;
            }

            showToast('Video đã được ghi thành công');

            const videoPathOnServer = presignedUrl.split('/videos/')[1].split('?')[0];

            const updateRes = await putData('portal/inject/updateBatch', {
                employee: fullName || 'NGUYỄN THỊ THOẢNG',
                videoFk: videoPathOnServer,
                fentryid: fentryid,
            });

            if (updateRes?.code === 0) {
                showToast('Cập nhật video thành công');
            } else {
                showToast('Cập nhật video thất bại ' + updateRes?.msg);
            }
        } catch (err) {
            showToast('Cập nhật video thất bại');
        } finally {
            markIdle();
            setVideoUploading(false);
        }
    }, []);

    const handleStopPress = async () => {
        navigation.navigate('FormStopOperation');
        // handleModalRecord();
        // reset()
    };

    const handlePausePress = async () => {
        try {
            Alert.alert(isPauseRef.current ? 'Tiếp tục' : 'Tạm dừng', `Bạn có chắc chắn muốn ${isPauseRef.current ? 'tiếp tục' : 'tạm dừng'}?`, [
                {
                    text: 'Hủy',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        let result: any;

                        if (isPauseRef.current) {
                            result = await postData('portal/inject/pause', {
                                processFk: orderStore?.process?.id,
                                orderBill: orderStore?.process?.orderNo,
                                bomNo: orderStore?.process?.bomNo,
                                pauseTime: orderStore?.appInjectPause?.pauseTime,
                                continueTime: currentTime,
                            }, true, orderStore?.config?.serverIp + ':' + orderStore?.config?.port);
                        } else {
                            result = await postData('portal/inject/pause', {
                                processFk: orderStore?.process?.id,
                                orderBill: orderStore?.process?.orderNo,
                                bomNo: orderStore?.process?.bomNo,
                                pauseTime: currentTime,
                            }, true, orderStore?.config?.serverIp + ':' + orderStore?.config?.port);
                        }

                        if (result.code === 0) {
                            setIsPause(!isPauseRef.current);
                        } else {
                            showToast(result.msg);
                        }
                    },
                },
            ]);

        } catch (err: any) {
            showToast(err.message);
        }
    };

    const handleOperatorChange = () => {
        navigation.navigate('OperatorLogin');
        // handleModalRecord();
    };

    const handleModalRecord = () => {
        setModalVisible(false);

        const estimatedServerNowMs = lastServerTimeRef.current
            ? lastServerTimeRef.current.serverMs + (Date.now() - lastServerTimeRef.current.localTick)
            : Date.now();

        const remainingSecs = Math.max(0, Math.floor((upcomingVideoStopMsRef.current - estimatedServerNowMs) / 1000));
        console.log('LOG : handleModalRecord : stopMs:', upcomingVideoStopMsRef.current, 'estimatedNow:', estimatedServerNowMs, 'remaining:', remainingSecs);
        navigation.navigate('Video', {
            autoRecord: true,
            chemicals: upcomingChemicals,
            videoDurationSeconds: remainingSecs,
        });
    };

    const handleModalDismiss = () => {
        setModalVisible(false);
        stop();
    };

    const handleOptionSelection = async (value: string) => {
        switch (value) {
            case 'extra':
                navigation.navigate('ScanQR', {
                    nextScreen: 'OrderConfirm',
                });
                break;
            case 'time':
                navigation.navigate('FormChangeStartTime');
                break;
            default:
                break;
        }
        handleSettingClose();
    };

    useEffect(() => {
        if (currentTime) {
            console.log('LOG : Operation : orderStore?.currentTime:', orderStore?.currentTime)
            console.log('LOG : Operation : currentTime:', currentTime)
            lastServerTimeRef.current = {
                serverMs: parseDateTime(currentTime),
                localTick: Date.now(),
            };
        }
    }, [currentTime]);

    useEffect(() => { currentChemicalsRef.current = currentChemicals; }, [currentChemicals]);

    useEffect(() => {
        groupedChemicalsRef.current = groupedChemicals;
        if (groupedChemicals.length === 0 && isFocused && videoStatus === 'idle') {
            const payload = {
                processFk: orderStore?.process?.id,
                orderBill: orderStore.process.orderNo,
                bomNo: orderStore.process.bomNo,
                reason: 1,
                remarks: '',
                finishTime: currentTime,
                registor: fullName || 'Nguyễn Văn A',
            }
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'Home' },
                    { name: 'FinishConfirm', params: { payload, scanCount: `${batchsStore?.filter((c: Chemical) => c.videoFk)?.length || 0}/${batchsStore?.length || 0}` } }],
            });
        }
    }, [groupedChemicals, navigation, isFocused, videoStatus]);

    useEffect(() => {
        if (isProcessComplete && isFocused && videoStatus === 'idle') {
            const payload = {
                processFk: orderStore?.process?.id,
                orderBill: orderStore.process.orderNo,
                bomNo: orderStore.process.bomNo,
                reason: 1,
                remarks: '',
                finishTime: currentTime,
                registor: fullName || 'Nguyễn Văn A',
            }
            reset();
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'Home' },
                    { name: 'FinishConfirm', params: { payload, scanCount: `${batchsStore?.filter((c: Chemical) => c.videoFk)?.length + 1 || 0}/${batchsStore?.length || 0}` } }],
            });
        }
    }, [isProcessComplete, isFocused, navigation, videoStatus]);

    useEffect(() => { alertedTimesRef.current = alertedTimes; }, [alertedTimes]);

    useEffect(() => { isPauseRef.current = isPause; }, [isPause]);
    useEffect(() => { maxDurationRef.current = maxDuration; }, [maxDuration]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!lastServerTimeRef.current || groupedChemicalsRef.current.length === 0) {
                return;
            }

            const elapsedMs = Date.now() - lastServerTimeRef.current.localTick;
            const estimatedServerNowMs = lastServerTimeRef.current.serverMs + elapsedMs;

            for (const group of groupedChemicalsRef.current) {
                if (alertedTimesRef.current.has(group.time)) {
                    continue;
                }

                const confirmTimeMs = parseDateTime(group.time);
                const secondsUntilConfirm = Math.floor((confirmTimeMs - estimatedServerNowMs) / 1000);
                console.log('LOG : Operation : secondsUntilConfirm:', secondsUntilConfirm)

                if (secondsUntilConfirm > 0) {
                    if (secondsUntilConfirm <= 10) {
                        setUpcomingChemicals(group.chemicals);

                        const allGroups = groupedChemicalsRef.current;
                        const idx = allGroups.findIndex((g: any) => g.time === group.time);
                        const nextGrp = allGroups[idx + 1];
                        const capSec = (maxDurationRef.current ?? 5) * 60;
                        if (nextGrp) {
                            const stopMs = parseDateTime(nextGrp.time) - 30 * 1000;
                            const capStopMs = confirmTimeMs + capSec * 1000;
                            upcomingVideoStopMsRef.current = Math.min(stopMs, capStopMs);
                        } else {
                            const operateMin = group.chemicals[0]?.operateTime ?? 1;
                            const stopMs = confirmTimeMs + operateMin * 60 * 1000 - 30 * 1000;
                            const capStopMs = confirmTimeMs + capSec * 1000;
                            upcomingVideoStopMsRef.current = Math.min(stopMs, capStopMs);
                        }

                        setModalVisible(true);
                        play();
                        setAlertedTimes(prev => new Set(prev).add(group.time));
                        initRef.current = false;
                    }
                    break;
                }
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handler = async () => {
            if (videoStatus === 'saved' && videoPath) {
                await handleUploadVideo(videoPath);
            }
        };
        handler();
    }, [videoStatus, videoPath]);

    useEffect(() => {
        if (initRef.current && groupedChemicals && groupedChemicals.length > 0 && currentChemicals.length > 0 && !currentChemicals[0]?.videoFk) {
            setUpcomingChemicals(currentChemicals);

            const firstTime = currentChemicals[0].confirmTime;
            const idx = groupedChemicals.findIndex((g: any) => g.time === firstTime);
            const nextGrp = groupedChemicals[idx + 1];
            const capSec = (maxDuration ?? 5) * 60;
            const confirmMs = parseDateTime(firstTime);
            const capStopMs = confirmMs + capSec * 1000;
            if (nextGrp) {
                const stopMs = parseDateTime(nextGrp.time) - 30 * 1000;
                upcomingVideoStopMsRef.current = Math.min(stopMs, capStopMs);
            } else {
                const operateMin = currentChemicals[0]?.operateTime ?? 1;
                const stopMs = confirmMs + operateMin * 60 * 1000 - 30 * 1000;
                upcomingVideoStopMsRef.current = Math.min(stopMs, capStopMs);
            }

            setModalVisible(true);
            play();
            setAlertedTimes(prev => new Set(prev).add(currentChemicals[0].confirmTime));
            initRef.current = false;
        }
    }, [groupedChemicals, currentChemicals]);

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
            if (lockScreen === true) {
                KeepAwake.activate();
            }

            return () => {
                KeepAwake.deactivate();
            };
        }, [lockScreen])
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
                            <Text color={'black'} variant={'sectionTitle'}>Mã đơn: {orderStore?.process?.orderNo}</Text>
                            <Text variant={'label'} >Đơn thuốc: {orderStore?.process?.bomNo}</Text>
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
                    <HistoryBatch videoUploading={videoUploading} />
                </ViewBox>
                <ChemicalAlertModal
                    visible={modalVisible}
                    chemicals={upcomingChemicals}
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
