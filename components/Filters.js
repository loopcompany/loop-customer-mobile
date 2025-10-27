import { FlatList, StyleSheet } from 'react-native';
import React from 'react';

import FilterItem from './FilterItem'; 

export default function Filters({ data, activeIndex, setActiveIndex }) {
    return (
        <FlatList
            contentContainerStyle={styles.contentContainerStyle}
            horizontal inverted showsHorizontalScrollIndicator={false}
            data={data}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item, index }) => <FilterItem item={item} index={index} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />}
        />
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 10,
        paddingHorizontal: '5%'
    },
})