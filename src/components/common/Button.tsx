import { ActivityIndicator, Pressable, PressableProps, View } from 'react-native';
import React from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Text } from './Text';

const buttonVariants = cva(
    'py-3.5 px-6 items-center justify-center min-w-0',
    {
        variants: {
            variant: {
                default: 'border-none',
                primary: 'border-[#4E47E7] bg-[#4E47E7]',
                secondary: 'border border-[#4E47E7] bg-[white]',
                third: 'bg-[#F43F5F]',
                fourth: 'border-[#1616E6] bg-[#1616E6]',
                fifth: 'border-[#6266F1] bg-[#6266F1]',
                cancel: 'border-none',
                danger: 'border-red-500 border bg-[#bf342a8f]',
            },
            size: {
                default: 'py-2.5 px-5',
                sm: 'py-2 px-4',
                lg: 'py-4 px-8',
            },
            radius: {
                default: 'rounded-2xl',
                sm: 'rounded-md',
                lg: 'rounded-xl',
                xl: 'rounded-2xl',
                xxl: 'rounded-3xl',
                full: 'rounded-full',
            },
            gap: {
                none: '',
                default: 'gap-2',
                sm: 'gap-1',
                lg: 'gap-3',
            },
            disabled: {
                true: 'opacity-50',
                false: '',
            },
            pressed: {
                true: 'opacity-70',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            radius: 'default',
            gap: 'default',
            disabled: false,
            pressed: false,
        },
    }
);

const buttonTextVariants = cva(
    'font-inter-semibold text-center',
    {
        variants: {
            variant: {
                primary: 'text-white',
                secondary: 'text-[#4E47E7]',
                third: 'text-white',
                fourth: 'text-white',
                fifth: 'text-white',
                cancel: 'text-gray-500',
                danger: 'text-[#E85656]',
            },
            disabled: {
                true: 'opacity-90',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
            disabled: false,
        },
    }
);

interface ButtonProps
    extends Omit<PressableProps, 'disabled'>,
    VariantProps<typeof buttonVariants> {
    label?: string;
    children?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    iconPosition?: 'left' | 'right';
    loadingColor?: string;
    textClassName?: string;
}

const Button = React.forwardRef<View, ButtonProps>(
    ({
        className = 'flex-row',
        variant,
        size,
        radius,
        gap,
        label,
        children,
        loading = false,
        disabled = false,
        iconPosition = 'right',
        loadingColor,
        textClassName,
        ...props
    }, ref) => {
        const isDisabled = disabled || loading;
        const finalLoadingColor = loadingColor || (variant === 'secondary' ? '#6266F1' : 'white');

        return (
            <Pressable
                ref={ref}
                disabled={isDisabled}
                {...props}
            >
                {({ pressed }) => (
                    <View
                        className={cn(
                            className,
                            buttonVariants({
                                variant,
                                size,
                                radius,
                                gap,
                                disabled: disabled,
                                pressed: pressed && !isDisabled,
                            }),
                        )}
                    >
                        {loading ? (
                            <ActivityIndicator
                                size={24}
                                color={finalLoadingColor}
                            />
                        ) : null}
                        {!loading && (
                            <>
                                {iconPosition === 'left' && children}
                                <Text
                                    className={`${cn(
                                        buttonTextVariants({
                                            variant,
                                            disabled: disabled,
                                        }),
                                        textClassName,
                                        loading && 'opacity-0'
                                    )}`}
                                >
                                    {label}
                                </Text>
                                {iconPosition === 'right' && children}
                            </>
                        )}
                    </View>
                )}
            </Pressable>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants, buttonTextVariants };
export type { ButtonProps };
