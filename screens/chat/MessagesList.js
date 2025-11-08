import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import MessegeItem from './MessegeItem';
import { themeColor1 } from '../../theme/Color';

export default function MessagesList({ messeges, onRefresh, refreshing }) {
    return (
        <FlatList
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
            inverted
            refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={onRefresh} />}
            data={messeges}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item }) => <MessegeItem messege={item} />}
        />
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingTop: 20,
        paddingBottom: 70
    }
})