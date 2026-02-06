import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { XCircleIcon } from 'react-native-heroicons/mini';
import React from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Text } from '../common/Text';
import { ViewBox } from '../common/ViewBox';

interface InputProps extends TextInputProps {
    label: string;
    placeholder?: string;
    required?: boolean;
    disable?: boolean;
    showClearButton?: boolean;
    InputValue: string | number;
    onChangeText?: (v: string) => void;
    useBottomSheetInput?: boolean;
}

const Input = ({
    label,
    placeholder,
    InputValue,
    onChangeText,
    disable,
    required = false,
    showClearButton = true,
    useBottomSheetInput = false,
    ...rest
}: InputProps) => {
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
        paddingBottom: 0,
        fontSize: 14,
        textAlignVertical: 'top' as const,
        minHeight: numberOfLines * 30,
    };


    return (
        <View className={'w-full mb-3'}>
            <Text variant={'captionSemibold'}>
                {label}{required && <Text className="text-red-500">*</Text>}
            </Text>
            <ViewBox
                radius={'xl'}
                border={focus ? 'default' : 'default'}
                background={disable ? 'gray' : 'blurGray'}
                className={'mt-2 px-4 py-1 flex-row items-center'}
            >
                <InputComponent
                    readOnly={disable}
                    value={displayValue}
                    placeholder={placeholder}
                    placeholderTextColor={'#9CA3AF'}
                    style={[inputStyle, rest.style]}
                    onChangeText={onChangeText}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    {...rest}
                />
                {(disable !== true && showClearButton) && (
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
        </View>
    );
};

export default React.memo(Input);
