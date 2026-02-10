import ViewContainer from '../../components/common/ViewContainer.tsx';
import { MainNavigationProps } from '../../types/navigation.ts';
import { ViewBox } from '../../components/common/ViewBox.tsx';
import React, { useCallback, useEffect, useState } from 'react';
import { Text } from '../../components/common/Text.tsx';
import Card from '../../components/common/Card.tsx';
import Header from './Header.tsx';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../store/authStore.ts';
import ViewHeader from '../../components/common/ViewHeader.tsx';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import List from '../../components/common/List.tsx';
import AuthModal from '../setting/AuthModal.tsx';
import { formatDateCustom } from '../../utils/dateTime.ts';
import CameraScanSection from './CameraScanSection.tsx';
import { useAPI } from '../../service/api.ts';
import { showToast } from '../../service/toast.ts';

const { width } = Dimensions.get('window');

const MainHome = ({ navigation }: MainNavigationProps<'Home'>) => {
  const numberOrder = 3;

  const [modalVisible, setModalVisible] = useState(false);
  const [listOrder, setListOrder] = useState<any[]>([]);

  const { getData, postData } = useAPI();
  const { rotatingTank } = useAuthStore();

  const handleCodeScanned = (code: string) => {
    if (!rotatingTank?.name) {
      showToast('Vui lòng chọn bồn quay trước khi quét mã QR');
      return;
    }

    navigation.navigate('OrderConfirm', {
      code,
    });
  };

  const handleConfirm = async (_password: string) => {
    try {
      const res = await postData('portal/inject/checkPass', { password: _password });
      if (res.code === 0) {
        setModalVisible(false);
        navigation.navigate('Setting');
      } else {
        showToast(res.msg);
      }
    } catch (error: any) {
      showToast(error);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const fetchData = async () => {
    try {
      const res = await getData('portal/inject/nearBill', { drum: rotatingTank?.name, rows: numberOrder });
      setListOrder(res.data.records);
    } catch (error: any) {
      showToast(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [rotatingTank]);

  const renderListHeader = useCallback(() => (
    <ViewBox background={'white'} className="py-6 flex-row justify-between items-center">
      <Text color={'black'} variant={'labelLargeSemibold'}>DANH SÁCH ĐƠN GẦN ĐÂY</Text>
      <TouchableOpacity onPress={() => navigation.navigate('NearBill')}>
        <Text color={'crayola'} variant={'labelSemibold'}>Xem tất cả</Text>
      </TouchableOpacity>
    </ViewBox>
  ), []);

  const renderOrderItem = useCallback(({ item }: { item: any }) => (
    <Card style={styles.shadowCard} radius="xxxl" key={item.id} className="flex-1 mb-3 flex-row items-center justify-between border border-gray-100">
      <ViewBox gap={'md'} className="flex-row items-center">
        <ViewBox background={'gray'} radius={'full'} className="w-12 h-12 justify-center items-center">
          <Feather name="package" size={24} color="#9AA0B6" />
        </ViewBox>
        <ViewBox gap={'xs'}>
          <Text color={'black'} variant={'labelLargeStrong'}>{item.orderNo}</Text>
          <Text variant={'label'}>{formatDateCustom(item.finishTime, { format: 'HH:mm' })} | {item.color} | {item.thickness ? item.thickness + 'mm' : 'N/A'} | {item.actualWeight ? item.actualWeight + 'kg' : 'N/A'}</Text>
        </ViewBox>
      </ViewBox>
      <ViewBox background={'blurGreen'} radius={'full'} className="w-8 h-8 justify-center items-center">
        <FontAwesome5 name="check" size={14} color="#1DC376" />
      </ViewBox>
    </Card>
  ), []);

  return (
    <ViewContainer hasScrollableContent={true}>
      <ViewHeader border={true} enableBack={false}>
        <ViewBox className="flex-1 my-3 flex-row items-center justify-between">
          <ViewBox gap={'md'} className="flex-row items-center">
            <ViewBox padding={'sm'} background={'lavender'} radius={'full'} className="justify-center items-center">
              <MaterialCommunityIcons name="robot-industrial" size={24} color="#6165EE" />
            </ViewBox>
            <Text color={'black'} variant={'pageTitleSemibold'} className="text-center">Inject</Text>
          </ViewBox>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <ViewBox className="border-2" radius={'full'} padding={'sm'} border={'default'}>
              <MaterialCommunityIcons name="cog" size={30} color="#6165EE" />
            </ViewBox>
          </TouchableOpacity>
        </ViewBox>
      </ViewHeader>
      <ViewBox padding={'lg'} className="flex-1">
        <Header />
        <ViewBox gap={'lg'} className="flex-1 mt-2">
          <ViewBox gap={'md'} className="justify-center items-center h-[60%]">
            <Text color={'black'} variant={'labelStrong'}>MÃ KHU VỰC CHỜ</Text>
            <Card style={styles.shadow} className="w-full flex-1 border-2 border-dashed border-[#E2DDF3] p-0 overflow-hidden" radius="xxxl">
              <CameraScanSection
                onCodeScanned={handleCodeScanned}
                boxSize={width}
                borderRadius={20}
              >
                <ViewBox className="flex-1 items-center justify-around py-4">
                  <ViewBox background={'lightLavender'} padding={'md'} radius={'full'} className="w-[20%] aspect-square justify-center items-center">
                    <MaterialCommunityIcons name="qrcode-scan" size={60} color="#6165EE" />
                  </ViewBox>

                  <ViewBox className="flex-col justify-center items-center">
                    <Text color={'black'} variant={'pageTitleSemibold'}>Quét mã để sản xuất</Text>
                    <Text color={'lightGray'} variant={'labelLargeRegular'} className="text-center px-4">
                      Đưa mã QR của khu vực vào khung ngắm để bắt đầu phiên làm việc
                    </Text>
                  </ViewBox>

                  <ViewBox gap={'xs'} background={'blueSignal'} radius={'full'} className="py-4 px-8 flex-row items-center">
                    <MaterialCommunityIcons name="check-decagram" size={24} color="#fff" />
                    <Text color={'white'} variant={'labelStrong'}>HỆ THỐNG SẴN SÀNG</Text>
                  </ViewBox>
                </ViewBox>
              </CameraScanSection>
            </Card>
          </ViewBox>
          <ViewBox className="flex-1">
            <List
              list={listOrder}
              renderItem={renderOrderItem}
              renderListHeader={renderListHeader}
              refreshing={false}
              onRefresh={fetchData}
            />
          </ViewBox>
        </ViewBox>
      </ViewBox>
      <AuthModal
        visible={modalVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ViewContainer >
  );
};
const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#9B95EF',
    elevation: 5,
  },
  shadowCard: {
    shadowColor: 'gray',
    elevation: 1,
  },
});
export default MainHome;
