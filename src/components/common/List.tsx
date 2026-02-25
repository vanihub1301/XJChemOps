import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ListRenderItem, StyleSheet } from 'react-native';
import { Text } from './Text';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ViewBox } from './ViewBox';

interface ListProps<T> {
    list: readonly T[];
    renderItem: ListRenderItem<T>;
    renderListHeader?: React.ComponentType<any> | React.ReactElement | null;
    loadingMore?: boolean;
    apiLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    loadMore?: () => void;
    keyExtractor?: (item: T, index: number) => string;
    emptyText?: string;
    primaryColor?: string;
    scrollEnabled?: boolean;
    nestedScrollEnabled?: boolean;
    enableRefresh?: boolean;
    initialNumToRender?: number;
    maxToRenderPerBatch?: number;
    removeClippedSubviews?: boolean;
}

const List = <T extends {}>({
    list,
    renderItem,
    renderListHeader,
    loadingMore,
    apiLoading,
    refreshing,
    onRefresh,
    loadMore,
    keyExtractor,
    emptyText = 'Hiện tại chưa có dữ liệu',
    primaryColor = '#3D8417',
    scrollEnabled = true,
    nestedScrollEnabled = false,
    enableRefresh = true,
    initialNumToRender = 10,
    maxToRenderPerBatch = 10,
    removeClippedSubviews = false,
}: ListProps<T>) => {
    const renderEmpty = useCallback(() => {
        if (apiLoading) { return null; }
        return (
            <ViewBox className="flex-1 justify-center items-center py-10" gap="md">
                <ViewBox background="gray" radius="full" className="w-12 h-12 justify-center items-center mb-2">
                    <MaterialCommunityIcons name="inbox-remove-outline" size={24} color="gray" />
                </ViewBox>
                <Text variant="label" color="lightGray" className="text-center px-8">
                    {emptyText}
                </Text>
            </ViewBox>
        );
    }, [apiLoading, emptyText]);

    const renderFooter = useCallback(() => {
        if (!loadingMore && !apiLoading) { return null; }
        return <ActivityIndicator color={primaryColor} />;
    }, [loadingMore, apiLoading, primaryColor]);

    return (
        <FlatList
            data={list}
            renderItem={renderItem}
            style={styles.paddingBottom}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderListHeader}
            stickyHeaderIndices={renderListHeader ? [0] : undefined}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            scrollEnabled={scrollEnabled}
            nestedScrollEnabled={nestedScrollEnabled}
            refreshControl={
                enableRefresh ? (
                    <RefreshControl
                        refreshing={refreshing || false}
                        onRefresh={onRefresh}
                        colors={[primaryColor]}
                        tintColor={primaryColor}
                    />
                ) : undefined
            }
            initialNumToRender={initialNumToRender}
            maxToRenderPerBatch={maxToRenderPerBatch}
            windowSize={5}
            showsVerticalScrollIndicator={false}
            updateCellsBatchingPeriod={100}
            removeClippedSubviews={removeClippedSubviews}
        />
    );
};

const styles = StyleSheet.create({
    paddingBottom: {
        paddingBottom: 30,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    },
});

export default React.memo(List) as typeof List;
