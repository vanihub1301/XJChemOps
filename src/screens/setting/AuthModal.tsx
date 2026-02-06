import React, { useState } from 'react';
import { Modal, StyleSheet } from 'react-native';
import { Button } from '../../components/common/Button';
import { Text } from '../../components/common/Text';
import { ViewBox } from '../../components/common/ViewBox';
import Input from '../../components/input/Input';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface AuthModalProps {
    visible: boolean;
    onConfirm: (password: string) => void;
    onCancel: () => void;
    title?: string;
    subtitle?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

const AuthModal = ({
    visible,
    onConfirm,
    onCancel,
    title = 'Xác thực cài đặt',
    subtitle = 'Vui lòng xác thực quyền truy cập',
    confirmLabel = 'XÁC NHẬN',
    cancelLabel = 'Hủy',
}: AuthModalProps) => {
    const [password, setPassword] = useState('');

    const handleConfirm = () => {
        onConfirm(password);
        setPassword('');
    };

    const handleCancel = () => {
        setPassword('');
        onCancel();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <ViewBox className="flex-1 bg-black/50 justify-center items-center px-6">
                <ViewBox
                    background="white"
                    radius="xxxl"
                    padding="xl"
                    className="w-full max-w-md"
                >
                    <ViewBox className="items-center mb-6">
                        <ViewBox
                            background="blurLavender"
                            radius="xl"
                            padding="md"
                            className="w-16 h-16 items-center justify-center"
                        >
                            <MaterialCommunityIcons name="lock" size={24} color="#6165EE" />
                        </ViewBox>
                    </ViewBox>

                    <Text
                        variant="sectionTitle"
                        color="black"
                        className="text-center mb-2"
                    >
                        {title}
                    </Text>

                    <Text
                        variant="labelRegular"
                        color="primary"
                        className="text-center mb-10"
                    >
                        {subtitle}
                    </Text>
                    <Input
                        label="MẬT KHẨU"
                        placeholder="Nhập mật khẩu để truy cập..."
                        InputValue={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        numberOfLines={1}
                    />
                    <Button
                        variant="fifth"
                        radius="xl"
                        label={confirmLabel}
                        onPress={handleConfirm}
                        className="w-full mt-2"
                        size={'lg'}
                        disabled={!password}
                        style={styles.button}
                    />

                    <Button
                        variant="cancel"
                        radius="xl"
                        label={cancelLabel}
                        onPress={handleCancel}
                        className="w-full mt-2"
                        size={'lg'}
                    />
                </ViewBox>
            </ViewBox>
        </Modal>
    );
};

const styles = StyleSheet.create({
    button: {
        shadowColor: '#6266F1',
        elevation: 15,
    },
});
export default AuthModal;
