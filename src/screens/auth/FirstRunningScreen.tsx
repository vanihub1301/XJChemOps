import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { ViewBox } from '../../components/common/ViewBox';
import ViewContainer from '../../components/common/ViewContainer';
import { Text } from '../../components/common/Text';
import Card from '../../components/common/Card';
import List from '../../components/common/List';
import { useAuthStore } from '../../store/authStore';
import ViewHeader from '../../components/common/ViewHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectBox from '../../components/common/SelectBox';
import { Button } from '../../components/common/Button';
import BottomSheetSearch from '../../components/bottomsheet/BottomSheetSearch';
import BottomSheet from '@gorhom/bottom-sheet';
import PillBadge from '../../components/common/PillBadge';
import DashedCircle from '../../components/common/DashedCircle';
import { useAPI } from '../../service/api';
import { IDrum } from '../../types/drum';
import { showToast } from '../../service/toast';

const FirstRunningScreen = () => {
    const [rotatingTank, setRotatingTank] = useState<IDrum | null>(null);
    const [listRotatingTank, setListRotatingTank] = useState<IDrum[]>([]);
    const [searchText, setSearchText] = useState<string>('');

    const { loading, getData, postData } = useAPI();

    const bottomSheetSearchRef = useRef<BottomSheet>(null);

    const handlePressItem = (item: any) => {
        Alert.alert('Xác nhận', `Bạn có muốn chọn "${item.name}" không?`, [
            {
                text: 'Hủy',
                onPress: () => { },
                style: 'cancel',
            },
            {
                text: 'Đồng ý',
                onPress: () => {
                    setRotatingTank(item);
                    bottomSheetSearchRef.current?.close();
                },
            },
        ]);
    };

    const handlePressConfirm = async () => {
        try {
            if (rotatingTank) {
                const res = await postData(`portal/inject/activeDrum?id=${rotatingTank.id}`, {});
                if (res.code === 0) {
                    useAuthStore.getState().setRotatingTank({ rotatingTank: rotatingTank });
                    showToast('Đã chọn vị trí bồn quay');
                } else {
                    showToast(res.msg);
                }
            } else {
                showToast('Vui lòng chọn vị trí bồn quay');
                return;
            }
        } catch (error: any) {
            showToast(error);
        }
    };

    const handleSearchChange = (text: string) => {
        setSearchText(text);
    };

    const renderListHeader = useCallback(() => (
        <ViewBox background={'white'} className="py-4 flex-row items-center justify-between">
            <Text variant={'captionSemibold'}>VỊ TRÍ ĐÃ SỬ DỤNG</Text>
            <ViewBox gap={'xs'} className="flex-row items-center justify-between">
                <Text variant={'captionMedium'}>{listRotatingTank.filter((item: IDrum) => item.isRegister).length}/{listRotatingTank.length}</Text>
                <ViewBox background={'lavender'} className="w-24 h-2 rounded-full overflow-hidden">
                    <ViewBox
                        background={'lightCrayola'}
                        style={{ width: `${listRotatingTank.filter((item: IDrum) => item.isRegister).length / listRotatingTank.length * 100}%` }}
                        className="h-full"
                    />
                </ViewBox>
            </ViewBox>
        </ViewBox>
    ), [listRotatingTank]);

    const fetchData = async () => {
        try {
            const res = await getData('portal/inject/drumInfo', undefined, true);
            setListRotatingTank(res.data);
        } catch (error: any) {
            showToast(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderUsedItem = useCallback(({ item }: { item: IDrum }) => (
        <Card background={'white'} border={'gray'} key={item.id} className="flex-1 mb-4 flex-row items-center">
            <ViewBox gap={'md'} className="flex-1 flex-row items-center">
                <ViewBox background={'lightLavender'} radius={'full'} className="w-12 h-12 items-center justify-center">
                    <Text variant={'labelLargeStrong'} color={'crayola'}>{item.name}</Text>
                </ViewBox>
                <ViewBox gap={'sm'} className="flex-1">
                    <Text color={'black'} variant={'labelLargeStrong'}>{item.code}</Text>
                    <ViewBox gap={'xs'} className="flex-row items-center">
                        <ViewBox background={'lavender'} radius={'full'} className="w-2 h-2 items-center justify-center" />
                        <Text variant={'captionMedium'}>Đã được sử dụng</Text>
                    </ViewBox>
                </ViewBox>
            </ViewBox>
            <ViewBox className="items-center justify-center">
                <MaterialCommunityIcons name="lock" size={24} color="#D0D0FF" />
            </ViewBox>
        </Card>
    ), []);

    const renderItem = useCallback((item: any) => {
        return (
            <Card background={'white'} border={'gray'} className="flex-row items-center mt-4 mx-6">
                <ViewBox gap={'md'} className="flex-1 flex-row items-center">
                    <ViewBox background={'lightLavender'} radius={'full'} className="w-12 h-12 items-center justify-center">
                        <Text variant={'labelLargeStrong'} color={'crayola'}>{item.code}</Text>
                    </ViewBox>
                    <ViewBox gap={'sm'} className="">
                        <Text color={'black'} variant={'labelLargeSemibold'}>Bồn xoay {item.name}</Text>
                        <Text variant={'captionMedium'}>MÃ VỊ TRÍ: {item.code}</Text>
                    </ViewBox>
                </ViewBox>
                <PillBadge
                    label={item.isRegister ? 'Đã đăng ký' : 'Chưa đăng ký'}
                    background={item.isRegister ? 'lightLavender' : 'lightSlate'}
                    textColor={item.isRegister ? 'crayola' : 'slate'}
                    radius={'xxl'}
                />
            </Card>
        );
    }, []);

    return (
        <ViewContainer hasScrollableContent={true}>
            <ViewHeader enableBack={false} textAlign="center" title="Vị trí bồn quay" />
            <ViewBox padding={'lg'} className="flex-1">
                <ViewBox className="items-center justify-around h-[50%]">
                    <ViewBox
                        style={styles.boxShadow}
                        radius={'full'} className="w-[40%] aspect-square items-center justify-center">
                        <ViewBox background={'white'} radius={'full'} className="w-[96%] aspect-square items-center justify-center">
                            <DashedCircle>
                                <ViewBox className="items-center justify-center rotate-45">
                                    <MaterialCommunityIcons name="barrel" size={100} color="#6165EE" />
                                </ViewBox>
                            </DashedCircle>
                        </ViewBox>
                    </ViewBox>
                    <ViewBox gap={'sm'} className="items-center justify-center">
                        <Text className="tracking-widest" variant={'labelLarge'} color={'crayola'}>
                            HỆ THỐNG ĐANG HOẠT ĐỘNG
                        </Text>
                    </ViewBox>
                </ViewBox>
                <ViewBox className="flex-1">
                    <SelectBox
                        label="CHỌN VỊ TRÍ (1-64)"
                        selectedChoice={rotatingTank?.name ? 'Bồn xoay ' + rotatingTank?.name : ''}
                        placeholder="Chọn số bồn..."
                        handleChoicePress={() => bottomSheetSearchRef.current?.expand()}
                        size="lg"
                        radius="xl"
                    />
                    <Button
                        label="XÁC NHẬN VỊ TRÍ"
                        onPress={handlePressConfirm}
                        variant="primary"
                        size={'lg'}
                        radius={'xl'}
                        loading={loading}
                        className="mt-4 flex-row items-center justify-center"
                    >
                        <MaterialCommunityIcons name="check-circle" size={16} color="white" />
                    </Button>
                    <List
                        list={listRotatingTank.filter((item: IDrum) => item.isRegister)}
                        renderItem={renderUsedItem}
                        renderListHeader={renderListHeader}
                        refreshing={false}
                        onRefresh={fetchData}
                    />
                </ViewBox>
            </ViewBox>
            <BottomSheetSearch
                ref={bottomSheetSearchRef}
                label="Danh sách vị trí"
                placeholder="Tìm kiếm vị trí..."
                data={listRotatingTank.filter((item: IDrum) => item.name.toLowerCase().includes(searchText.toLowerCase()))}
                dataLoading={false}
                hasMore={false}
                snapPoints={['80%']}
                loading={false}
                searchText={searchText}
                onSearchChange={handleSearchChange}
                onDataSelect={handlePressItem}
                onLoadMore={() => { }}
                onClose={() => bottomSheetSearchRef.current?.close()}
                renderItemBody={renderItem}
            />
        </ViewContainer>
    );
};

const styles = StyleSheet.create({
    boxShadow: {
        backgroundColor: 'transparent',
        shadowColor: 'gray',
        elevation: 10,
    },
});

export default FirstRunningScreen;
