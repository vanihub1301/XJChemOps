import { Text } from '../../components/common/Text';
import { ViewBox } from '../../components/common/ViewBox';
import ViewContainer from '../../components/common/ViewContainer';
import { MainNavigationProps } from '../../types/navigation';
import ViewHeader from '../../components/common/ViewHeader';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useVideoStore } from '../../store/videoStore';
import { TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import BottomSheetSelect from '../../components/bottomsheet/BottomSheetSelect';
import ActiveBatch from './ActiveBatch';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import { useOperationStore } from '../../store/operationStore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ChemicalAlertModal from './ChemicalAlertModal';
import { SplashScreen } from '../../components/app/SplashScreen';
import HistoryBatch from './HistoryBatch';
import { Chemical } from '../../types/drum';
import { useAuthStore } from '../../store/authStore';
import { useSettingStore } from '../../store/settingStore';
import { useVideoUpload } from './hooks/useVideoUpload';
import { useOperationAction } from './hooks/useOperationAction';
import { useChemicalTimer } from './hooks/useChemicalTimer';

const Operation = ({ navigation, route }: MainNavigationProps<'Operation'>) => {
    const settingBottomSheetRef = useRef<BottomSheet>(null);
    const isFocused = useIsFocused();

    const { videoStatus } = useVideoStore();
    const { lockScreen } = useSettingStore();
    const { fullName } = useAuthStore();
    const { currentTime, orderStore, batchsStore, groupedChemicals, isProcessComplete, reset } = useOperationStore();
    const { videoUploading } = useVideoUpload();
    const { handlePausePress } = useOperationAction();
    const { modalVisible, upcomingChemicals, handleModalRecord, handleModalDismiss } = useChemicalTimer(navigation, isFocused);


    const handleSettingPress = () => {
        settingBottomSheetRef.current?.expand();
    };
    const handleSettingClose = () => {
        settingBottomSheetRef.current?.close();
    };

    const handleStopPress = async () => {
        navigation.navigate('FormStopOperation');
        // handleModalRecord();
        // reset()
    };

    const handleOperatorChange = () => {
        navigation.navigate('OperatorLogin');
        // handleModalRecord();
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

    const orderProcessFallback = useRef<any>(null);

    useEffect(() => {
        if (orderStore?.process) {
            orderProcessFallback.current = orderStore.process;
        }
    }, [orderStore?.process]);

    useEffect(() => {
        if (groupedChemicals.length === 0 && isFocused && videoStatus === 'idle') {
            const process = orderStore?.process || orderProcessFallback.current;
            const payload = {
                processFk: process?.id,
                orderBill: process?.orderNo,
                bomNo: process?.bomNo,
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
