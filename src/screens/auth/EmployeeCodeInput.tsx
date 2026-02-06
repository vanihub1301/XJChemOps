import React, { useState, useRef } from 'react';
import { TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';

interface EmployeeCodeInputProps {
    onComplete: (code: string) => void;
    onCancel?: () => void;
}

const EmployeeCodeInput: React.FC<EmployeeCodeInputProps> = ({ onComplete, onCancel }) => {
    const [code, setCode] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleTextChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text.slice(-1);
        setCode(newCode);

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = () => {
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            onComplete(fullCode);
        }
    };

    return (
        <ViewBox radius={'xxxl'} padding={'xl'} background={'white'} className="shadow-xl mx-2">
            <Text variant={'labelLargeStrong'} className="text-center mb-6">
                Mã nhân viên
            </Text>

            <ViewBox gap={'lg'} className="flex-row mb-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <ViewBox key={index} className="flex-1 aspect-[9/12]">
                        <TextInput
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            value={code[index]}
                            onChangeText={(text) => handleTextChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            textAlign="center"
                            className={`flex-1 text-3xl font-semibold rounded-2xl text-black ${code[index]
                                ? 'border-2 border-green-600 bg-green-50'
                                : 'border-2 border-gray-200 bg-gray-50'
                                }`}
                            keyboardType="numeric"
                            maxLength={1}
                        />
                    </ViewBox>
                ))}
            </ViewBox>

            <ViewBox className="flex-row justify-center items-center gap-2 mt-4 mb-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <ViewBox
                        key={index}
                        className={`w-2 h-2 rounded-full ${code[index] ? 'bg-green-700 w-3 h-3' : 'bg-gray-300'
                            }`}
                    />
                ))}
            </ViewBox>

            <ViewBox gap={'sm'}>
                <Button
                    label={'Đăng nhập'}
                    onPress={handleSubmit}
                    disabled={code.join('').length < 6}
                    variant={'secondary'}
                    radius={'xl'}
                />
                {onCancel && (
                    <Button
                        label={'Hủy'}
                        onPress={onCancel}
                        variant={'primary'}
                        radius={'xl'}
                    />
                )}
            </ViewBox>
        </ViewBox>
    );
};

export default EmployeeCodeInput;
