import { VariantProps, cva } from 'class-variance-authority';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import { UITextView } from 'react-native-uitextview';
import { cn } from '../../utils/cn';

cssInterop(UITextView, { className: 'style' });
type TypeText = {
    color: 'primary' | 'green' | 'red' | 'yellow' | 'blue' | 'white' | 'black' | 'orange' | 'purple' |
    'darkGray' | 'slate' | 'amber' | 'crayola' | 'lavender' | 'brightGreen';
    variant: 'pageTitle' | 'pageTitleRegular' | 'pageTitleMedium' | 'pageTitleSemibold' | 'sectionTitle' |
    'sectionTitleMedium' | 'sectionTitleThin' | 'labelLargeRegular' |
    'sectionTitleSemibold' | 'sectionTitleRegular' | 'body' | 'bodyStrong' | 'labelLarge' | 'largeTitleMedium' |
    'labelLargeSemibold' | 'label' | 'labelRegular' | 'labelStrong' | 'labelSemibold' | 'labelSmall' | 'caption' |
    'captionStrong' | 'captionSemibold' | 'captionMedium' | 'overline';
}
const textVariants = cva('text-foreground', {
    variants: {
        variant: {
            // Headings
            largeTitle: 'text-4xl font-inter-bold',
            largeTitleSemibold: 'text-4xl font-inter-semibold',
            largeTitleMedium: 'text-4xl font-inter-medium',
            pageTitle: 'text-2xl font-inter-bold',
            pageTitleSemibold: 'text-2xl font-inter-semibold',
            pageTitleMedium: 'text-2xl font-inter-medium',
            pageTitleRegular: 'text-2xl font-inter-regular',
            sectionTitle: 'text-xl font-inter-bold',
            sectionTitleSemibold: 'text-xl font-inter-semibold',
            sectionTitleMedium: 'text-xl font-inter-medium',
            sectionTitleRegular: 'text-xl font-inter-regular',
            sectionTitleThin: 'text-xl font-inter-thin',

            // Body
            body: 'text-base font-inter-regular',
            bodyStrong: 'text-base font-inter-bold',

            // Labels (form, button, list)
            labelLargeStrong: 'text-lg font-inter-bold',
            labelLargeSemibold: 'text-lg font-inter-semibold',
            labelLarge: 'text-lg font-inter-medium',
            labelLargeRegular: 'text-lg font-inter-regular',
            label: 'text-base font-inter-medium',
            labelRegular: 'text-base font-inter-regular',
            labelStrong: 'text-base font-inter-bold',
            labelSemibold: 'text-base font-inter-semibold',
            labelSmall: 'text-sm font-inter-medium',

            // Caption / helper text
            caption: 'text-sm font-inter-regular',
            captionStrong: 'text-sm font-inter-bold',
            captionSemibold: 'text-sm font-inter-semibold',
            captionMedium: 'text-sm font-inter-medium',
            overline: 'text-xs font-inter-bold',
        },

        color: {
            primary: 'text-gray-500',
            lightGray: 'text-gray-400',
            blurGray: 'text-gray-200',
            darkGray: 'text-gray-800',
            brightGreen: 'text-[#27E787]',
            lightGreen: 'text-green-500',
            green: 'text-[#3D8417]',
            red: 'text-red-500',
            yellow: 'text-yellow-500',
            blue: 'text-blue-500',
            blueViolet: 'text-[#5B25EA]',
            white: 'text-white',
            black: 'text-black',
            orange: 'text-orange-800',
            purple: 'text-purple-500',
            slate: 'text-slate-700',
            amber: 'text-amber-700',
            crayola: 'text-[#6165EE]',
            lavender: 'text-[#E2DDF3]',
        },
    },
    defaultVariants: {
        variant: 'body',
        color: 'primary',
    },
});

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
    className,
    variant,
    color,
    ...props
}: React.ComponentPropsWithoutRef<typeof UITextView> &
    VariantProps<typeof textVariants>) {
    const textClassName = React.useContext(TextClassContext);
    return (
        <UITextView
            className={cn(textVariants({ variant, color }), textClassName, className)}
            {...props}
        />
    );
}

export { Text, type TypeText, TextClassContext, textVariants };

