import React from 'react';
import { Modal, View, ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../components/common/Button';
import { Text } from '../../components/common/Text';
import { ViewBox } from '../../components/common/ViewBox';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../../components/common/Card';
import { useOperationStore } from '../../store/operationStore';

interface ChemicalAlertModalProps {
    visible: boolean;
    onRecord: () => void;
    onDismiss: () => void;
}

const ChemicalAlertModal = ({
    visible,
    onRecord,
    onDismiss,
}: ChemicalAlertModalProps) => {
    const { currentChemicals } = useOperationStore();
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <ViewBox
                    background="white"
                    radius="xxxl"
                    padding="xl"
                    className="w-full max-w-md max-h-[80%]"
                >
                    <View className="items-center mb-6">
                        <ViewBox
                            background="blurLavender"
                            radius="full"
                            padding="md"
                            className="w-16 h-16 items-center justify-center"
                        >
                            <MaterialIcons name="notifications-active" size={32} color="#6165EE" />
                        </ViewBox>
                    </View>

                    <Text
                        variant="sectionTitle"
                        color="black"
                        className="text-center mb-2"
                    >
                        Đã đến thời gian đổ
                    </Text>

                    <Text
                        variant="labelRegular"
                        color="primary"
                        className="text-center mb-6"
                    >
                        Vui lòng thực hiện đổ hóa chất theo yêu cầu
                    </Text>

                    <Text
                        variant="captionSemibold"
                        color="primary"
                        className="mb-2"
                    >
                        HÓA CHẤT CẦN ĐỔ ({currentChemicals.length})
                    </Text>

                    <ScrollView
                        className="mb-6 max-h-[300px]"
                        showsVerticalScrollIndicator={true}
                    >
                        <ViewBox gap="sm">
                            {currentChemicals.map((chemical: any, _index: number) => (
                                <Card
                                    key={chemical.id}
                                    background="blurPurple"
                                    radius="xl"
                                    padding="md"
                                >
                                    <ViewBox className="flex-row items-center" gap="sm">
                                        <ViewBox
                                            background="white"
                                            radius="md"
                                            padding="sm"
                                            className="w-10 h-10 items-center justify-center"
                                            border={'gray'}
                                        >
                                            <Ionicons
                                                name="flask"
                                                size={20}
                                                color="#6165EE"
                                            />
                                        </ViewBox>
                                        <ViewBox className="flex-1">
                                            <Text variant="labelSemibold" color="black">
                                                {chemical.processCode} | {chemical.materialName}
                                            </Text>
                                            <Text variant="captionSemibold" color="crayola">
                                                Trọng lượng: {chemical.actualWeight}kg
                                            </Text>
                                        </ViewBox>
                                    </ViewBox>
                                </Card>
                            ))}
                        </ViewBox>
                    </ScrollView>

                    <Button
                        variant="primary"
                        radius="xl"
                        label="Ghi hình Đổ Hóa Chất"
                        onPress={onRecord}
                        className="w-full flex-row items-center justify-center"
                        size="lg"
                        iconPosition="left"
                        style={styles.button}
                    >
                        <MaterialCommunityIcons
                            name="video"
                            size={20}
                            color="white"
                        />
                    </Button>

                    <Button
                        variant="cancel"
                        radius="xl"
                        label="Bỏ qua cảnh báo"
                        onPress={onDismiss}
                        className="w-full flex-row items-center justify-center"
                        size="lg"
                        iconPosition="left"
                    />
                </ViewBox>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    button: {
        shadowColor: '#4E47E7',
        elevation: 10,
    },
});
export default ChemicalAlertModal;
