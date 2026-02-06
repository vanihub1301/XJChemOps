import { VariantProps, cva } from 'class-variance-authority';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { cn } from '../../utils/cn';

cssInterop(View, { className: 'style' });

type TypeBox = {
    background:
    'none' | 'white' | 'black' | 'gray' | 'lightGray' | 'darkGray' | 'blue' | 'steelBlue' | 'lightBlue' | 'green' | 'lightGreen' | 'blurGreen' |
    'yellow' | 'lightYellow' | 'cyan' | 'purple' | 'pink' | 'orange' | 'lightOrange' | 'blurOrange' | 'lightSlate' | 'slate' | 'blurSlate' | 'darkSlate' |
    'lightAmber' | 'amber' | 'blurAmber' | 'transparent' | 'system' | 'blurRed' | 'lightRed' | 'red' | 'crayola' | 'lavender' | 'lightLavender' |
    'blurLavender' | 'blurCrayola' | 'lightCrayola' | 'darkGreen' | 'blurGray' | 'blurPurple' | 'blurBlack',
    padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    margin: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl',
    radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl' | 'full',
    border: 'none' | 'default' | 'primary' | 'gray' | 'signal' | 'success' | 'error',
    shadow: 'none' | 'sm' | 'md' | 'lg',
};

const viewBoxVariants = cva('', {
    variants: {
        background: {
            none: '',
            white: 'bg-white',
            cyan: 'bg-cyan-200',
            lightCrayola: 'bg-[#6165EE]',
            blurCrayola: 'bg-[#9B95EF]',
            crayola: 'bg-[#3C18E7]',
            lightLavender: 'bg-[#F7F7FF]',
            lavender: 'bg-[#E2DDF3]',
            blurLavender: 'bg-[#EEF2FE]',

            blurRed: 'bg-red-50',
            lightRed: 'bg-red-200',
            red: 'bg-red-500',

            black: 'bg-black',
            blurBlack: 'bg-[#00000090]',
            blurGray: 'bg-gray-50',
            gray: 'bg-gray-100',
            lightGray: 'bg-gray-200',
            darkGray: 'bg-gray-500',

            lightBlue: 'bg-blue-100',
            blue: 'bg-blue-200',
            blurBlue: 'bg-blue-50',
            blueSignal: 'bg-[#4E47E7]',

            blurGreen: 'bg-[#EFFDF4]',
            lightGreen: 'bg-green-100',
            green: 'bg-green-200',
            darkGreen: 'bg-green-500',

            lightYellow: 'bg-yellow-50',
            yellow: 'bg-yellow-200',

            blurPurple: 'bg-[#F9F8FC]',
            lightPurple: 'bg-purple-100',
            purple: 'bg-purple-200',

            pink: 'bg-pink-200',

            blurOrange: 'bg-orange-50',
            lightOrange: 'bg-orange-100',
            orange: 'bg-orange-200',

            lightSlate: 'bg-slate-100',
            darkSlate: 'bg-slate-700',
            slate: 'bg-slate-200',
            blurSlate: 'bg-[#303A45]',

            lightAmber: 'bg-amber-100',
            amber: 'bg-amber-200',
            blurAmber: 'bg-amber-50',

            transparent: 'bg-transparent',
            system: 'bg-[#F2F2F2]',
        },
        padding: {
            none: '',
            xs: 'p-1',
            sm: 'p-2',
            md: 'p-4',
            lg: 'p-6',
            xl: 'p-8',
        },
        margin: {
            none: '',
            xs: 'm-1',
            sm: 'm-2',
            md: 'm-4',
            lg: 'm-6',
            xl: 'm-8',
        },
        gap: {
            none: '',
            xxs: 'gap-1',
            xs: 'gap-2',
            sm: 'gap-3',
            md: 'gap-4',
            lg: 'gap-6',
            xl: 'gap-10',
            xxl: 'gap-12',
            xxxl: 'gap-16',
        },
        radius: {
            none: '',
            sm: 'rounded-sm',
            md: 'rounded-md',
            lg: 'rounded-lg',
            xl: 'rounded-xl',
            xxl: 'rounded-2xl',
            xxxl: 'rounded-3xl',
            xxxxl: 'rounded-4xl',
            full: 'rounded-full',
        },
        border: {
            none: '',
            default: 'border border-gray-200',
            gray: 'border border-gray-100',
            black: 'border border-black',
            white: 'border border-white',
            primary: 'border border-blue-500',
            success: 'border border-green-500',
            lightCrayola: 'border border-[#6266F1]',
            signal: 'border border-[#C9C0F7]',
            blueSignal: 'border border-[#5B25EA]',
            error: 'border border-red-500',
        },
        shadow: {
            none: '',
            sm: 'shadow-sm',
            md: 'shadow-md',
            lg: 'shadow-lg',
        },
    },
    defaultVariants: {
        background: 'none',
        padding: 'none',
        gap: 'none',
        radius: 'none',
        border: 'none',
        shadow: 'none',
    },
});

const ViewBoxClassContext = React.createContext<string | undefined>(undefined);

function ViewBox({
    className,
    background,
    padding,
    gap,
    radius,
    border,
    shadow,
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof View> &
    VariantProps<typeof viewBoxVariants>) {
    const viewBoxClassName = React.useContext(ViewBoxClassContext);
    return (
        <View
            className={cn(
                viewBoxVariants({ background, padding, gap, radius, border, shadow }),
                viewBoxClassName,
                className
            )}
            {...props}
        >
            {children}
        </View>
    );
}

export { ViewBox, type TypeBox, ViewBoxClassContext, viewBoxVariants };
