import React from 'react';
import ViewContainer from '../../components/common/ViewContainer';
import ViewHeader from '../../components/common/ViewHeader';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import Card from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { AppNavigationProps } from '../../types/navigation';
import PillBadge from '../../components/common/PillBadge';
import { StyleSheet } from 'react-native';

const FinishConfirm = ({ navigation }: AppNavigationProps<'FinishConfirm'>) => {
    const handleFinish = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const handleViewVideo = () => {
        navigation.navigate('VideoPlayback');
    };

    return (
        <ViewContainer background="white" hasScrollableContent={true}>
            <ViewHeader background="white" title="Hoàn tất & Kết thúc" border={true} />
            <ViewBox background="white" className="flex-1 items-center">
                <ViewBox padding="xl" className="flex-1 items-center w-[60%]" gap="xxxl">
                    <ViewBox
                        background="blurLavender"
                        radius="full"
                        className="w-[30%] aspect-square items-center justify-center"
                    >
                        <ViewBox
                            background="blueSignal"
                            radius="full"
                            className="w-[50%] aspect-square items-center justify-center"
                        >
                            <MaterialIcons name="check" size={50} color="white" />
                        </ViewBox>
                    </ViewBox>

                    <ViewBox gap="xs" className="items-center">
                        <Text variant="largeTitle" color="black" className="text-center">
                            Hoàn tất đổ hóa chất
                        </Text>
                        <Text variant="sectionTitleMedium" color="crayola" className="text-center tracking-wider">
                            INJECTION SUCCESSFUL
                        </Text>
                    </ViewBox>

                    <Card gap="md" className="w-full">
                        <ViewBox gap={'xxl'} className="flex-row items-center justify-between py-2 border-b border-gray-200">
                            <Text variant="sectionTitle" color="black">
                                Thông tin đơn hàng
                            </Text>
                            <PillBadge
                                label={'HOÀN THÀNH'}
                                background="lightGreen"
                                textColor="green"
                            />
                        </ViewBox>

                        <ViewBox gap="xl">
                            <ViewBox className="" gap="sm">
                                <Text variant="captionStrong" color="crayola">
                                    MÃ ĐƠN
                                </Text>
                                <ViewBox gap="sm" className="flex-row items-center">
                                    <MaterialCommunityIcons name="file-document" size={20} color="#9B95EF" />
                                    <Text variant="labelStrong" color="black">
                                        PD-2024-001
                                    </Text>
                                </ViewBox>
                            </ViewBox>

                            <ViewBox className="" gap="sm">
                                <Text variant="captionStrong" color="crayola">
                                    TỔNG SỐ HÓA CHẤT
                                </Text>
                                <ViewBox gap="sm" className="flex-row items-center">
                                    <FontAwesome6 name="box-archive" size={20} color="#9B95EF" />
                                    <Text variant="labelStrong" color="black">
                                        12 / 12
                                    </Text>
                                </ViewBox>
                            </ViewBox>

                            <ViewBox className="" gap="sm">
                                <Text variant="captionStrong" color="crayola">
                                    THỜI GIAN HOÀN THÀNH
                                </Text>
                                <ViewBox gap="sm" className="flex-row items-center">
                                    <MaterialCommunityIcons name="clock" size={20} color="#9B95EF" />
                                    <Text variant="labelStrong" color="black">
                                        16:45
                                    </Text>
                                </ViewBox>
                            </ViewBox>
                        </ViewBox>
                    </Card>

                    <ViewBox gap="lg" className="w-full">
                        <Button
                            variant="primary"
                            radius="xl"
                            size="lg"
                            label="KẾT THÚC ĐƠN SẢN XUẤT"
                            onPress={handleFinish}
                            className="w-full"
                            style={styles.button}
                        />
                        <Button
                            variant="secondary"
                            radius="xl"
                            size="lg"
                            label="Xem lại video ghi hình"
                            onPress={handleViewVideo}
                            className="w-full flex-row items-center justify-center"
                            iconPosition="left"
                        >
                            <MaterialCommunityIcons name="video" size={20} color="#6165EE" />
                        </Button>
                    </ViewBox>
                </ViewBox>
            </ViewBox>

        </ViewContainer>
    );
};

const styles = StyleSheet.create({
    button: {
        shadowColor: '#4E47E7',
        elevation: 10,
    },
});

export default FinishConfirm;
