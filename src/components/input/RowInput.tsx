import { TextInput, TextInputProps } from 'react-native';
import React from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Text } from '../common/Text';
import { ViewBox } from '../common/ViewBox';

interface RowInputProps extends TextInputProps {
    label: string;
    placeholder?: string;
    required?: boolean;
    disable?: boolean;
    InputValue: string | number;
    onChangeText?: (v: string) => void;
    useBottomSheetInput?: boolean;
}

const RowInput = ({
    label,
    placeholder,
    InputValue,
    onChangeText,
    disable,
    required = false,
    useBottomSheetInput = false,
    ...rest
}: RowInputProps) => {

    const displayValue = InputValue?.toString() || '';

    const InputComponent = useBottomSheetInput ? BottomSheetTextInput : TextInput;

    return (
        <ViewBox className="flex-row items-center py-3 border-b border-gray-200">
            <Text
                color={'white'}>
                {label}{required && <Text color={'red'}>*</Text>}
            </Text>

            <InputComponent
                editable={!disable}
                value={displayValue}
                placeholder={placeholder}
                placeholderTextColor="#3D8417"
                onChangeText={onChangeText}
                className="flex-1 text-white text-base font-normal p-0 m-0 text-right"
                {...rest}
            />
        </ViewBox>
    );

};

export default React.memo(RowInput);
