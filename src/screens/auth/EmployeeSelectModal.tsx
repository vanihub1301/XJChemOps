import React, { useState, useMemo, useCallback } from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { Text } from '../../components/common/Text';
import { ViewBox } from '../../components/common/ViewBox';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import List from '../../components/common/List';
import InputSearch from '../../components/input/InputSearch';
import { EmployeeItem, ItemProps } from './EmployeeItem';

interface EmployeeSelectModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (item: any) => void;
    data: any[];
    selectedCode?: string;
    title?: string;
    placeholder?: string;
}

const EmployeeSelectModal = ({
    visible,
    onClose,
    onSelect,
    data,
    selectedCode,
    title = 'Chọn nhân viên',
    placeholder = 'Nhập mã nhân viên...',
}: EmployeeSelectModalProps) => {
    const [searchText, setSearchText] = useState('');

    const filteredData = useMemo(() => {
        if (!searchText.trim()) {
            return data;
        }
        const lowerSearch = searchText.toLowerCase();
        return data.filter(
            (item) =>
                item.name?.toLowerCase().includes(lowerSearch) ||
                item.code?.toLowerCase().includes(lowerSearch)
        );
    }, [searchText]);

    const handleSelect = useCallback((item: any) => {
        onSelect(item);
        setSearchText('');
    }, [onSelect]);

    const handleClose = useCallback(() => {
        setSearchText('');
        onClose();
    }, [onClose]);

    const renderItem = useCallback(({ item }: { item: ItemProps }) => (
        <EmployeeItem
            item={item}
            selectedCode={selectedCode}
            onPress={handleSelect}
        />
    ), []);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center">
                <ViewBox
                    background="white"
                    radius="xxxl"
                    padding="lg"
                    className="w-full max-w-lg max-h-[80%]"
                >
                    <ViewBox className="flex-row items-center justify-between mb-4">
                        <Text variant="pageTitle" color="black">
                            {title}
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <ViewBox padding={'xs'} background={'gray'} radius={'full'} className="items-center justify-center">
                                <MaterialCommunityIcons name="close" size={24} color="gray" />
                            </ViewBox>
                        </TouchableOpacity>
                    </ViewBox>

                    <ViewBox className="mb-4">
                        <InputSearch
                            placeholder={placeholder}
                            InputValue={searchText}
                            onChangeText={setSearchText}
                            autoCapitalize="none"
                            numberOfLines={1}
                        />
                    </ViewBox>
                    <ViewBox className="h-[300px]">
                        <List
                            list={filteredData}
                            renderListHeader={() => (<></>)}
                            renderItem={renderItem}
                            enableRefresh={false}
                            initialNumToRender={30}
                            maxToRenderPerBatch={30}
                        />
                    </ViewBox>
                </ViewBox>
            </View>
        </Modal>
    );
};

export default EmployeeSelectModal;
