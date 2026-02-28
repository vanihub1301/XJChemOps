import React from 'react';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';

export const SettingRow = ({ isChange, icon, label, children }: { isChange?: boolean; icon: React.ReactNode; label: string; children: React.ReactNode }) => (
    <ViewBox padding="md" radius="xl" className="flex-row items-center justify-between">
        <ViewBox className="flex-row items-center gap-3 flex-1">
            {icon}
            <Text variant="labelLarge" color="black" className="text-center">
                {label}
            </Text>
            {isChange && <Text variant={'captionMedium'} color="red"> Đã bị thay đổi</Text>}
        </ViewBox>
        {children}
    </ViewBox>
);

export const Divider = () => <ViewBox className="h-px bg-gray-200" />;

export const SectionLabel = ({ title }: { title: string }) => (
    <Text variant="label" color="primary" className="mb-3">{title}</Text>
);
