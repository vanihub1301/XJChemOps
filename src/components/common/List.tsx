import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View, ListRenderItem, StyleSheet } from 'react-native';
import { Text } from './Text';

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
    maxItem?: number | null;
    enableRefresh?: boolean;
}

const List = <T extends { id: string | number }>({
    list,
    renderItem,
    renderListHeader,
    loadingMore,
    apiLoading,
    refreshing,
    onRefresh,
    loadMore,
    keyExtractor = (item) => String(item.id),
    emptyText = 'Hiện tại chưa có dữ liệu',
    primaryColor = '#3D8417',
    scrollEnabled = true,
    nestedScrollEnabled = false,
    maxItem = null,
    enableRefresh = true,
}: ListProps<T>) => {
    const [itemHeight, setItemHeight] = React.useState<number | null>(null);
    const listHeight = (maxItem && itemHeight)
        ? itemHeight * maxItem
        : null;

    const renderEmpty = useCallback(() => {
        if (apiLoading) {
            return null;
        }
        return (
            <View>
                <Text style={styles.emptyText}>
                    {emptyText}
                </Text>
            </View>
        );
    }, [apiLoading, emptyText]);

    const renderFooter = useCallback(() => {
        if (!loadingMore && !apiLoading) return null;
        return <ActivityIndicator color={primaryColor} />;
    }, [loadingMore, apiLoading, primaryColor]);

    const renderMeasuredItem: ListRenderItem<T> = (info) => {
        const { index } = info;

        if (index === 0) {
            return (
                <View
                    onLayout={(e) => {
                        if (!itemHeight) {
                            setItemHeight(e.nativeEvent.layout.height);
                        }
                    }}
                >
                    {renderItem(info)}
                </View>
            );
        }

        return renderItem(info);
    };

    return (
        <FlatList
            data={list}
            renderItem={renderMeasuredItem}
            style={[listHeight ? { height: listHeight } : maxItem ? styles.height : null, styles.paddingBottom]}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderListHeader}
            stickyHeaderIndices={[0]}
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
                        colors={[primaryColor]} // Android
                        tintColor={primaryColor} // iOS
                    />
                ) : undefined
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
        />
    );
};

const styles = StyleSheet.create({
    height: {
        height: 30,
    },
    paddingBottom: {
        paddingBottom: 30,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    },
});

export default React.memo(List) as typeof List;
