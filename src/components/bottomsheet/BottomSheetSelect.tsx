import React, { useCallback, forwardRef, useMemo } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import BottomSheet, { BottomSheetBackdrop, BottomSheetProps, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { languages, settings, stopReasons, changeTimeReasons, checkIntervals } from '../../constants/ui';
import { Text } from '../common/Text';
const { height } = Dimensions.get('window');

interface SelectionItem {
    value: number | string;
    label: string;
}

interface SheetConfig {
    data: SelectionItem[];
    title: string;
    field: string;
}

interface CustomBottomSheetProps extends BottomSheetProps {
    onClose: () => void;
    sheetType?: string;
    onSelection?: (
        value: any,
        data?: any
    ) => void;
    customData?: SelectionItem[];
}

const BottomSheetSelect = forwardRef<BottomSheetMethods, CustomBottomSheetProps>(({
    onClose,
    sheetType,
    onSelection,
    customData,
    ...rest
}, ref) => {
    const inset = useSafeAreaInsets();
    const isLargeScreen = height > 800 && inset.bottom === 0 && inset.top === 0;
    const bottomInset = isLargeScreen ? 80 : inset.bottom;

    const sheetConfigs: { [key: string]: SheetConfig } = useMemo(() => ({
        language: {
            data: languages,
            title: 'Chọn ngôn ngữ',
            field: '',
        },
        setting: {
            data: settings,
            title: 'Tuỳ chọn',
            field: '',
        },
        reason: {
            data: stopReasons,
            title: 'Lý do dừng',
            field: '',
        },
        changeTimeReasons: {
            data: changeTimeReasons,
            title: 'Lý do điều chỉnh thời gian',
            field: '',
        },
        checkInterval: {
            data: checkIntervals,
            title: 'Chọn khoảng thời gian kiểm tra',
            field: '',
        },

    }), []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
            />
        ),
        [],
    );

    const filteredData = useMemo(() => {
        if (customData && customData.length > 0) {
            return customData;
        }
        const config = sheetConfigs[sheetType || ''];
        return config?.data || [];
    }, [sheetType, sheetConfigs, customData]);

    const handleSelection = useCallback(
        (value: any, label: any) => {
            const config = sheetConfigs[sheetType || ''];
            if (!config || !onSelection) return;

            onSelection(value, label);
        },
        [sheetType, onSelection, sheetConfigs],
    );

    const config = sheetConfigs[sheetType || ''];

    return (
        <BottomSheet
            ref={ref}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
            index={-1}
            // backgroundStyle={styles.sheet}
            // handleIndicatorStyle={styles.handleIndicator}
            {...rest}
        >
            <BottomSheetScrollView
                stickyHeaderIndices={[0]}
                contentContainerStyle={{
                    paddingBottom: bottomInset,
                }}
                className="flex-1"
            >
                <View className="relative px-4 py-2 items-center justify-center">
                    <Text color={'black'} variant={'labelLarge'} className="text-center mb-4">
                        {config.title}
                    </Text>
                    <TouchableOpacity onPress={onClose} className="absolute right-5 top-2">
                        <XMarkIcon size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {filteredData.map(item => (
                    <TouchableOpacity
                        key={item.value}
                        className="py-6 px-4 border-b border-gray-200"
                        onPress={() => handleSelection(item.value, item.label)}
                    >
                        <Text color={'black'} className="text-base text-center">{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </BottomSheetScrollView>
        </BottomSheet>
    );
});

export default React.memo(BottomSheetSelect);
