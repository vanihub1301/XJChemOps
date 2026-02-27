import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface RowInputProps extends TextInputProps {
    placeholder?: string;
    disable?: boolean;
    InputValue: string | number;
    onChangeText?: (v: string) => void;
    useBottomSheetInput?: boolean;
    showClearButton?: boolean;
}

const RowInput = ({
    placeholder,
    InputValue,
    onChangeText,
    disable,
    useBottomSheetInput = false,
    showClearButton = false,
    ...rest
}: RowInputProps) => {

    const displayValue = InputValue?.toString() || '';
    const [focus, setFocus] = React.useState<boolean>(false);

    const hasValue = InputValue !== null && InputValue !== undefined && displayValue.length > 0;
    const InputComponent = useBottomSheetInput ? BottomSheetTextInput : TextInput;

    return (
        <View className="flex-row items-center justify-end">
            <InputComponent
                editable={!disable}
                value={displayValue}
                placeholder={placeholder}
                placeholderTextColor={'#9CA3AF'}
                onChangeText={onChangeText}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                className="text-right px-0 py-0 ma-0"
                {...rest}
            />
            {!disable && showClearButton && hasValue && (
                <TouchableOpacity
                    onPress={() => onChangeText && onChangeText('')}
                    className="ml-2"
                >
                    <MaterialIcons name="close" size={18} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default React.memo(RowInput);
