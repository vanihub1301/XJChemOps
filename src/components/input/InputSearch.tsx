import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { XCircleIcon } from 'react-native-heroicons/mini';
import React from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ViewBox } from '../common/ViewBox';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface InputSearchProps extends TextInputProps {
    placeholder?: string;
    required?: boolean;
    disable?: boolean;
    InputValue: string | number;
    onChangeText?: (v: string) => void;
    useBottomSheetInput?: boolean;
}

const InputSearch = ({
    placeholder,
    InputValue,
    onChangeText,
    disable,
    required = false,
    useBottomSheetInput = false,
    ...rest
}: InputSearchProps) => {
    const [focus, setFocus] = React.useState<boolean>(false);

    const displayValue = InputValue?.toString() || '';

    const hasValue = InputValue !== null && InputValue !== undefined && displayValue.length > 0;

    const InputComponent = useBottomSheetInput ? BottomSheetTextInput : TextInput;

    const numberOfLines = rest.numberOfLines || 1;

    const inputStyle = {
        flex: 1,
        color: 'black',
        paddingLeft: 0,
        paddingRight: 0,
        fontSize: 14,
        textAlignVertical: 'top' as const,
        minHeight: numberOfLines * 30,
    };


    return (
        <ViewBox
            radius={'xl'}
            background={'gray'}
            gap={'xs'}
            className={'w-full px-4 py-1 flex-row items-center'}
        >
            <MaterialIcons name="search" size={20} color="gray" />
            <InputComponent
                readOnly={disable}
                value={displayValue}
                placeholder={placeholder}
                placeholderTextColor={'gray'}
                style={[inputStyle, rest.style]}
                onChangeText={onChangeText}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                {...rest}
            />
            {disable !== true && (
                <View className={'flex-row gap-4 items-center'}>
                    {hasValue && (
                        <TouchableOpacity
                            onPress={() => onChangeText && onChangeText('')}
                            className={'pl-3 py-2'}
                        >
                            <XCircleIcon color={'#6b7280'} size={20} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </ViewBox>
    );
};

export default React.memo(InputSearch);
