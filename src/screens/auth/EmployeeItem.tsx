import React from 'react';
import { TouchableOpacity } from 'react-native';
import Card from '../../components/common/Card';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Octicons from 'react-native-vector-icons/Octicons';

export const EmployeeItem = React.memo(({
    item,
    selectedCode,
    onPress,
}: {
    item: any;
    selectedCode?: string;
    onPress: (item: any) => void;
}) => {
    const isSelected = selectedCode === item.code;

    return (
        <TouchableOpacity onPress={() => onPress(item)}>
            <Card
                padding={'lg'}
                background={isSelected ? 'lavender' : 'white'}
                border={isSelected ? 'signal' : 'none'}
                className="flex-1 flex-row items-center"
            >
                <ViewBox gap={'md'} className="flex-1 flex-row items-center">
                    <ViewBox
                        background={'gray'}
                        radius={'full'}
                        className="w-14 h-14 items-center justify-center"
                    >
                        {isSelected ? (
                            <FontAwesome5 name="user-check" size={20} color="#5B25EA" />
                        ) : (
                            <FontAwesome5 name="user-alt" size={20} color="gray" />
                        )}
                    </ViewBox>
                    <ViewBox gap={'sm'}>
                        <Text color={'black'} variant={'sectionTitleSemibold'}>
                            {item.name}
                        </Text>
                        <Text color={isSelected ? 'blueViolet' : 'primary'} variant={'labelSemibold'}>
                            ID: {item.code}
                        </Text>
                    </ViewBox>
                </ViewBox>
                {isSelected && (
                    <Octicons name="check-circle-fill" size={25} color="#5B25EA" />
                )}
            </Card>
        </TouchableOpacity>
    );
});
