/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            fontFamily: {
                'inter-black': ['Inter-Black'],
                'inter-bold': ['Inter-Bold'],
                'inter-semibold': ['Inter-SemiBold'],
                'inter-medium': ['Inter-Medium'],
                'inter-regular': ['Inter-Regular'],
                'inter-light': ['Inter-Light'],
                'inter-thin': ['Inter-Thin'],
            },
        },
    },
    plugins: [],
};
