import React, { useState } from 'react';
import ViewContainer from '../../components/common/ViewContainer';
import ViewHeader from '../../components/common/ViewHeader';
import { ViewBox } from '../../components/common/ViewBox';
import { mockVideoPlaybackData } from '../home/data';
import Card from '../../components/common/Card';
import { TouchableOpacity, ListRenderItem, Modal, StyleSheet } from 'react-native';
import { Text } from '../../components/common/Text';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../../components/common/Button';
import Video from 'react-native-video';
import List from '../../components/common/List';
import { formatDateCustom } from '../../utils/dateTime';

type VideoItem = typeof mockVideoPlaybackData[0];

const VideoPlayback = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const openVideoPlayer = (item: VideoItem) => {
        setSelectedVideo(item);
    };

    const closeVideoPlayer = () => {
        setSelectedVideo(null);
    };

    const renderVideoItem: ListRenderItem<VideoItem> = ({ item }) => (
        <Card gap={'none'} radius="xxl" padding="none" className="overflow-hidden h-[500px] mb-4">
            <ViewBox className="h-[60%] w-full">
                <ViewBox className="h-full w-full">
                    {item.videoUrl ? (
                        <>
                            <Video
                                source={{ uri: item.videoUrl }}
                                style={styles.video}
                                resizeMode="cover"
                                paused={true}
                                muted={true}
                            />
                            <ViewBox className="absolute bottom-5 right-4 px-3" padding={'xs'} radius={'lg'} background={'black'}>
                                <Text color={'white'}>{item.time}</Text>
                            </ViewBox>
                            <TouchableOpacity onPress={() => openVideoPlayer(item)} className="absolute inset-0 items-center justify-center">
                                <ViewBox radius="full" className="bg-[#43579ec1] w-20 h-20 items-center justify-center">
                                    <MaterialCommunityIcons name="play" size={40} color="white" />
                                </ViewBox>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <ViewBox className="w-full h-full bg-gray-200 items-center justify-center">
                            <Text color={'darkGray'}>No video available</Text>
                        </ViewBox>
                    )}
                </ViewBox>
            </ViewBox>
            <ViewBox className="flex-1 px-6 py-4 justify-around">
                <ViewBox className=" flex-row items-center justify-between">
                    <ViewBox gap={'xs'}>
                        <ViewBox gap={'xs'} className="flex-row items-center">
                            <Text variant={'captionStrong'} color={'blueViolet'}>MÃ ĐƠN:</Text>
                            <Text variant={'captionStrong'} color={'black'}>{item.code}</Text>
                        </ViewBox>
                        <Text variant={'labelLargeStrong'} color={'black'}>{item.name}</Text>
                    </ViewBox>
                    <TouchableOpacity onPress={() => { }}>
                        <MaterialCommunityIcons name="trash-can" size={24} color="gray" />
                    </TouchableOpacity>
                </ViewBox>
                <ViewBox gap={'xs'} className="flex-row items-center">
                    <MaterialCommunityIcons name="calendar-blank" size={18} color="gray" />
                    <Text variant={'captionMedium'}>{formatDateCustom(item.createdAt, { format: 'HH:mm dd/MM/yyyy' })}</Text>
                </ViewBox>
                <Button
                    variant="primary"
                    size="lg"
                    label="Xem lại"
                    onPress={() => openVideoPlayer(item)}
                />
            </ViewBox>
        </Card>
    );

    return (
        <ViewContainer hasScrollableContent={true} background="none">
            <ViewHeader
                title="Danh sách Video Ghi hình"
                border={true}
            />
            <ViewBox className="flex-1 px-6 pt-6">
                <List
                    list={mockVideoPlaybackData}
                    renderListHeader={() => (
                        <></>
                    )}
                    renderItem={renderVideoItem}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    keyExtractor={(item) => String(item.id)}
                />
            </ViewBox>

            <Modal
                visible={selectedVideo !== null}
                animationType="slide"
                onRequestClose={closeVideoPlayer}
            >
                <ViewBox className="flex-1 bg-black">
                    <ViewBox className="absolute top-12 right-4 z-10">
                        <TouchableOpacity onPress={closeVideoPlayer}>
                            <MaterialCommunityIcons name="close" size={32} color="white" />
                        </TouchableOpacity>
                    </ViewBox>
                    {selectedVideo?.videoUrl && (
                        <Video
                            source={{ uri: selectedVideo.videoUrl }}
                            resizeMode="contain"
                            controls={true}
                            paused={false}
                            repeat={true}
                            style={styles.video}
                        />
                    )}
                </ViewBox>
            </Modal>
        </ViewContainer>
    );
};
const styles = StyleSheet.create({
    video: {
        width: '100%',
        height: '100%',
    },
});
export default VideoPlayback;
