import { FlatList, Platform, RefreshControl, StyleSheet } from 'react-native';
import MessageItem from './MessageItem';
import { themeColor1 } from '@theme/Color';
import { memo, useMemo } from 'react';

function MessagesList({ messages, onRefresh, refreshing }) {
    function toTimestamp(value) {
        if (!value) return 0;
        const timestamp = Date.parse(value);
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    function sortForWebChat(messages) {
        return [...messages].sort((first, second) => {
            const secondTime = toTimestamp(second?.created_at);
            const firstTime = toTimestamp(first?.created_at);

            if (secondTime !== firstTime) {
                return secondTime - firstTime;
            }

            const secondId = Number(second?.id) || 0;
            const firstId = Number(first?.id) || 0;
            return secondId - firstId;
        });
    }

    const items = useMemo(() => {
        if (!Array.isArray(messages) || messages.length === 0) return [];
        return sortForWebChat(messages);
    }, [messages]);

    return (
        <div style={styles.wrapper}>
            {items.map((item, index) => (
                <div key={index}>
                    <MessageItem message={item} />
                </div>
            ))}
        </div>
    );
}


export default memo(MessagesList);

const styles = {
    wrapper: {
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column-reverse',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        paddingTop: 20,
        paddingBottom: 70,
    },
};