import React from 'react';
import Card from '../../components/common/Card';
import { ViewBox } from '../../components/common/ViewBox';
import { Text } from '../../components/common/Text';
import { Image, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PillBadge from '../../components/common/PillBadge';
import CycloneIcon from './CycloneIcon';

const Header = () => {
    const { fullName, rotatingTank, timeLogin } = useAuthStore();

    return (
        <ViewBox className="flex-row flex-wrap gap-3 mb-4">
            <Card style={styles.shadow} className="min-w-[280px] flex-auto flex-row items-center justify-between">
                <ViewBox gap={'md'} className="flex-row items-center justify-between">
                    <ViewBox>
                        <Image source={require('../../assets/images/avatar.png')} className="w-20 h-20 rounded-full border-2 border-white" />
                        <ViewBox border={'white'} background={'darkGreen'} className="border-2 w-5 h-5 rounded-full absolute bottom-0 right-0" />
                    </ViewBox>

                    <ViewBox gap={'xs'}>
                        <Text color={'black'} variant={'labelLargeStrong'}>
                            {fullName || 'ADMIN'}
                        </Text>
                        <PillBadge
                            label={`ID: ${209092}`}
                            background="blurLavender"
                            textColor="crayola"
                        />
                        <ViewBox gap={'xs'} className="flex-row items-center">
                            <MaterialCommunityIcons name="clock" size={20} color="gray" />
                            <Text variant={'captionSemibold'}>Thời gian đăng nhập: {timeLogin}</Text>
                        </ViewBox>

                    </ViewBox>
                </ViewBox>
            </Card>
            <Card style={styles.shadow} className="min-w-[150px] flex-auto flex-row justify-center">
                <ViewBox gap={'sm'} className="flex-1 flex-row items-center justify-center">
                    <ViewBox className="items-center justify-center rotate-45">
                        <CycloneIcon size={30} color="#6366F1" />
                    </ViewBox>
                    <Text color={'black'} variant={'labelLargeStrong'}>
                        {`Bồn ${rotatingTank?.name}`}
                    </Text>
                </ViewBox>
            </Card>
        </ViewBox>

    );
};
const styles = StyleSheet.create({
    shadow: {
        shadowColor: 'gray',
        elevation: 5,
    },
});
export default React.memo(Header);
