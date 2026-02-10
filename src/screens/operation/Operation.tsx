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
import { unlink } from 'react-native-fs';
import { uploadFile } from '../../service/axios';

const Operation = ({ navigation, route }: MainNavigationProps<'Operation'>) => {
    const { order, init } = route.params;
    const [modalVisible, setModalVisible] = React.useState(false);
    const [alertedTimes, setAlertedTimes] = React.useState<Set<string>>(new Set());

    const { videoStatus, videoPath } = useVideoStore();
    const { currentChemicals, orderStore, batchsStore, groupedChemicals, isPause, setCurrentChemicals, setIsPause } = useOperationStore();
    const { getData, postData, putData } = useAPI();

    const { play } = useAlarmSound(orderStore?.config?.enableSound);

    const settingBottomSheetRef = useRef<BottomSheet>(null);

    const handleSettingPress = () => {
        settingBottomSheetRef.current?.expand();
    };
    const handleSettingClose = () => {
        settingBottomSheetRef.current?.close();
    };

    const handleUploadVideo = useCallback(async () => {
        try {
            const fentryid = currentChemicals.map(i => i.id);

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
                employee: 'NGUYỄN THỊ THOẢNG',
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
            await unlink(videoPath);
        }
    }, [groupedChemicals, videoPath, getData, putData]);


    const handleStopPress = async () => {
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
                        const now = new Date(orderStore.currentTime.replace(' ', 'T')).getTime();

                        const nextChemical = groupedChemicals.findIndex(item => new Date(item.time.replace(' ', 'T')).getTime() > now);

                        let result: any;

                        if (isPause) {
                            result = await postData('portal/inject/pause', {
                                processFk: groupedChemicals[nextChemical - 1]?.chemicals[0].processFk,
                                orderBill: order?.orderNo,
                                bomNo: order?.bomNo,
                                continueTime: orderStore?.currentTime,
                            }, true, orderStore?.config?.serverIp + ':' + orderStore?.config?.port);
                            setIsPause(false);
                        } else {
                            result = await postData('portal/inject/pause', {
                                processFk: batchsStore[nextChemical - 1]?.processFk,
                                orderBill: order?.orderNo,
                                bomNo: order?.bomNo,
                                pauseTime: orderStore?.currentTime,
                            }, true, orderStore?.config?.serverIp + ':' + orderStore?.config?.port);
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
                setModalVisible(true);
                play();
                setAlertedTimes(prev => new Set(prev).add(group.time));
                break;
            }
        }
    }, [groupedChemicals, alertedTimes, play, orderStore]);

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
        }
    }, [init]);

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
