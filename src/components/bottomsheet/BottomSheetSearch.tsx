import React, { useMemo, useCallback, forwardRef } from 'react';
import { ActivityIndicator, Dimensions, Keyboard, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../common/Text';
import { ViewBox } from '../common/ViewBox';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InputSearch from '../input/InputSearch';

const { height } = Dimensions.get('window');

interface BottomSheetSearchProps {
    label: string;
    placeholder?: string;
    data: any[];
    searchText?: string;
    dataLoading?: boolean;
    hasMore?: boolean;
    snapPoints?: string[];
    loading?: boolean;
    onSearchChange?: (text: string) => void;
    onDataSelect?: (payload: any) => void;
    onLoadMore?: () => void;
    onClose: () => void;
    renderItemBody?: (item: any, index: number) => React.ReactNode;
}

const BottomSheetSearch = forwardRef<BottomSheetMethods, BottomSheetSearchProps>(({
    label = '',
    placeholder = '',
    data,
    searchText = '',
    dataLoading = false,
    hasMore = false,
    snapPoints = ['50%'],
    loading = false,
    onSearchChange = () => { },
    onDataSelect = () => { },
    onLoadMore = () => { },
    onClose = () => { },
    renderItemBody,
    ...rest
}, ref) => {
    const inset = useSafeAreaInsets();
    const isLargeScreen = height > 800 && inset.bottom === 0 && inset.top === 0;
    const bottomInset = isLargeScreen ? 80 : inset.bottom;

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        onClose();
    }, [onClose]);

    const header = useMemo(
        () => (
            <ViewBox background={'white'} className="px-6">
                <ViewBox className="mb-5 relative py-2 items-center justify-between flex-row">
                    <Text color={'black'} variant={'sectionTitle'}>{label}</Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={handleClose}>
                        <ViewBox background={'blurLavender'} padding={'sm'} radius={'full'} className="items-center justify-center">
                            <MaterialIcons name="close" size={20} color="black" />
                        </ViewBox>
                    </TouchableOpacity>
                </ViewBox>
                <InputSearch
                    InputValue={searchText}
                    onChangeText={onSearchChange}
                    placeholder={placeholder || 'Nhập tên để tìm kiếm...'}
                />
            </ViewBox>
        ),
        [label, searchText, onSearchChange, handleClose, placeholder]
    );

    const keyExtractor = useCallback((item: any, index: number) =>
        item.id?.toString() || index.toString(),
        []);

    const handleEndReached = useCallback(() => {
        if (hasMore && !dataLoading) {
            onLoadMore();
        }
    }, [hasMore, dataLoading, onLoadMore]);

    const contentContainerStyle = useMemo(() =>
        ({ paddingBottom: bottomInset }),
        [bottomInset]);

    const renderCustomItem = useCallback(({ item, index }: { item: any, index: number }) => {
        if (renderItemBody) {
            return (
                <TouchableOpacity activeOpacity={0.7} onPress={() => onDataSelect(item)}>
                    {renderItemBody(item, index)}
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onDataSelect(item)}
            >
                <Text>{item.name || 'Không xác định'}</Text>
            </TouchableOpacity>
        );
    }, [onDataSelect, renderItemBody]);

    const ListEmptyComponent = useMemo(() =>
        dataLoading ? (
            <ViewBox className="py-4 items-center">
                <ActivityIndicator color={'#3D8417'} className="mt-2" />
            </ViewBox>
        ) : (
            <Text className="text-center py-4">Không tìm thấy kết quả</Text>
        ),
        [dataLoading]);

    const ListFooterComponent = useMemo(() =>
        dataLoading && data.length > 0 ? (
            <ViewBox className="py-4 items-center">
                <ActivityIndicator color={'#3D8417'} className="mt-2" />
            </ViewBox>
        ) : null,
        [dataLoading, data.length]);

    const renderBackdrop = React.useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
            />
        ),
        []
    );

    return (
        <BottomSheet
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            onClose={handleClose}
            enableContentPanningGesture={false}
            enableDynamicSizing={false}
            {...rest}
        >
            {loading ? (
                <ViewBox className="py-4 items-center">
                    <ActivityIndicator color={'#3D8417'} className="mt-2" />
                </ViewBox>
            ) : (
                <BottomSheetFlatList
                    data={data}
                    ListHeaderComponent={header}
                    stickyHeaderIndices={[0]}
                    renderItem={renderCustomItem}
                    keyExtractor={keyExtractor}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.7}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={contentContainerStyle}
                    ListEmptyComponent={ListEmptyComponent}
                    ListFooterComponent={ListFooterComponent}
                    removeClippedSubviews={false}
                />
            )}
        </BottomSheet>
    );
});

export default React.memo(BottomSheetSearch);
