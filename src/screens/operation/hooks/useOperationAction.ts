import { useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAPI } from '../../../service/api';
import { useOperationStore } from '../../../store/operationStore';
import { showToast } from '../../../service/toast';
import { useAuthStore } from '../../../store/authStore';

export const useOperationAction = () => {
    const { postData } = useAPI();
    const { orderStore, currentTime, isPause, setIsPause } = useOperationStore();
    const { fullName } = useAuthStore();

    const isPauseRef = useRef(isPause);
    useEffect(() => { isPauseRef.current = isPause; }, [isPause]);

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
                                user: fullName || 'ADMIN',
                            }, true, orderStore?.config?.serverIp + ':' + orderStore?.config?.port);
                        } else {
                            result = await postData('portal/inject/pause', {
                                processFk: orderStore?.process?.id,
                                orderBill: orderStore?.process?.orderNo,
                                bomNo: orderStore?.process?.bomNo,
                                user: fullName || 'ADMIN',
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

    return {
        handlePausePress,
    };
};
