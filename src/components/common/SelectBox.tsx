import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ViewBox } from './ViewBox';
import { Text } from './Text';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const selectBoxVariants = cva(
    'bg-white border border-gray-200 mt-4 px-4 flex-row items-center justify-between',
    {
        variants: {
            size: {
                sm: 'py-2 px-3',
                default: 'py-2.5 px-4',
                lg: 'py-4 px-4',
            },
            radius: {
                default: 'rounded-lg',
                sm: 'rounded-md',
                lg: 'rounded-xl',
                xl: 'rounded-2xl',
                xxl: 'rounded-3xl',
                full: 'rounded-full',
            },
        },
        defaultVariants: {
            size: 'default',
            radius: 'default',
        },
    }
);

interface SelectBoxProps extends VariantProps<typeof selectBoxVariants> {
    label: string;
    selectedChoice: string;
    placeholder?: string;
    handleChoicePress: () => void;
    required?: boolean;
    className?: string;
}

const SelectBox = ({
    label,
    selectedChoice,
    placeholder,
    handleChoicePress,
    required = false,
    size,
    radius,
    className,
}: SelectBoxProps) => {
    return (
        <ViewBox className="w-full">
            <Text variant="captionSemibold">
                {label}{required ? <Text className="text-red-500">*</Text> : null}
            </Text>
            <TouchableOpacity
                onPress={handleChoicePress}
                className={cn(
                    selectBoxVariants({ size, radius }),
                    className
                )}
            >
                <Text className={selectedChoice ? 'text-black' : 'text-gray-400'}>
                    {selectedChoice ? selectedChoice : placeholder}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="gray" />
            </TouchableOpacity>
        </ViewBox>
    );
};

export default React.memo(SelectBox);
export { selectBoxVariants };
export type { SelectBoxProps };
