import React, { useState, useMemo } from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { Text } from '../../components/common/Text';
import { ViewBox } from '../../components/common/ViewBox';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Octicons from 'react-native-vector-icons/Octicons';
import Card from '../../components/common/Card';
import List from '../../components/common/List';
import InputSearch from '../../components/input/InputSearch';

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
    }, [data, searchText]);

    const handleSelect = (item: any) => {
        onSelect(item);
        setSearchText('');
    };

    const handleClose = () => {
        setSearchText('');
        onClose();
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => handleSelect(item)}>
            <Card
                padding={'lg'}
                background={selectedCode === item.code ? 'lavender' : 'white'}
                border={selectedCode === item.code ? 'signal' : 'none'}
                key={item.id}
                className="flex-1 flex-row items-center"
            >
                <ViewBox gap={'md'} className="flex-1 flex-row items-center">
                    <ViewBox
                        background={'gray'}
                        radius={'full'}
                        className="w-14 h-14 items-center justify-center"
                    >
                        {selectedCode === item.code ? (
                            <FontAwesome5 name="user-check" size={20} color="#5B25EA" />
                        ) : (
                            <FontAwesome5 name="user-alt" size={20} color="gray" />
                        )}
                    </ViewBox>
                    <ViewBox gap={'sm'} className="">
                        <Text color={'black'} variant={'sectionTitleSemibold'}>
                            {item.name}
                        </Text>
                        <Text color={selectedCode === item.code ? 'blueViolet' : 'primary'} variant={'labelSemibold'}>ID: {item.code}</Text>
                    </ViewBox>
                </ViewBox>
                {selectedCode === item.code && (
                    <Octicons name="check-circle-fill" size={25} color="#5B25EA" />
                )}
            </Card>
        </TouchableOpacity>
    );

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
                    <List
                        list={filteredData}
                        renderListHeader={() => (<></>)}
                        renderItem={renderItem}
                        refreshing={false}
                        onRefresh={() => { }}
                        maxItem={3}
                    />
                </ViewBox>
            </View>
        </Modal>
    );
};

export default EmployeeSelectModal;
