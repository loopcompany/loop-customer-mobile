import { FlatList, Platform, RefreshControl, StyleSheet } from 'react-native';
import MessageItem from './MessageItem';
import { themeColor1 } from '@theme/Color';
import FooterSpacer from '@components/FooterSpacer';

export default function MessagesList({ messages, onRefresh, refreshing }) {
    return (
        <FlatList
            ListFooterComponent={<FooterSpacer />}
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
            inverted={true}
            refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={onRefresh} />}
            data={messages}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item }) => <MessageItem message={item} />}
        />
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingTop: 20,
        paddingBottom: 70
    }
})