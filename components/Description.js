import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'

import NewStyles from '../styles/NewStyles';
import Filters from './Filters';
import { themeColor0, themeColor1, themeColor3 } from '../theme/Color';

export default function Description({ data }) {

    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View style={{ gap: 20 }}>
            <Filters data={data?.field_details} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
            {data?.field_details?.[activeIndex]?.field_charts?.length > 0 ?
                <View style={NewStyles.seperator1}>
                    {data?.field_details?.[activeIndex]?.des && <Text style={NewStyles.text3}>{data?.field_details?.[activeIndex]?.des}</Text>}
                    <FlatList
                        style={{ gap: 50 }}
                        showsVerticalScrollIndicator={false}
                        data={data?.field_details?.[activeIndex]?.field_charts}
                        keyExtractor={(item) => item?.id?.toString()}
                        renderItem={({ item }) => {
                            return (
                                <View style={[{ borderWidth: StyleSheet.hairlineWidth, borderColor: themeColor3.bgColor(1) }, NewStyles.border10]}>
                                    <View style={[{ backgroundColor: themeColor1.bgColor(1) }, NewStyles.border10]}>
                                        <Text style={[NewStyles.title4, { textAlign: 'center' }]}>{item?.title}</Text>
                                    </View>
                                    <View style={[{ padding: '5%' }, NewStyles.rowWrapper]}>
                                        {item?.first_column ? <Text style={[NewStyles.text, { flex: 1, textAlign: 'right' }]}>{item?.first_column}</Text> : null}
                                        {item?.second_column ? <Text style={[NewStyles.text10, { flex: 1, textAlign: item?.third_column ? 'center' : 'left' }]}>{item?.second_column}</Text> : null}
                                        {item?.third_column ? <Text style={[NewStyles.text10, { flex: 1, textAlign: 'left' }]}>{item?.third_column}</Text> : null}
                                    </View>
                                    <FlatList
                                        showsVerticalScrollIndicator={false}
                                        data={item?.chart_options}
                                        scrollEnabled={false}
                                        keyExtractor={(item) => item?.id?.toString()}
                                        renderItem={({ item: subItem, index }) => {
                                            return (
                                                <View style={[{ padding: '5%' }, NewStyles.rowWrapper, (index % 2 == 0) ? { backgroundColor: themeColor0.bgColor(0.08) } : { backgroundColor: themeColor3.bgColor(0.08) }]}>
                                                    {subItem?.first ? <Text style={[NewStyles.text, { flex: 1, textAlign: 'right' }]} >{subItem?.first}</Text> : null}
                                                    {subItem?.second ? <Text style={[NewStyles.text10, { flex: 1, textAlign: subItem?.third ? 'center' : 'left' }]} >{subItem?.second}</Text> : null}
                                                    {subItem?.third ? <Text style={[NewStyles.text10, { flex: 1, textAlign: 'left' }]} >{subItem?.third}</Text> : null}
                                                </View>
                                            )
                                        }}
                                    />
                                </View>
                            )
                        }}
                    />
                </View>
                :
                <View style={NewStyles.seperator1}>
                    <Text style={NewStyles.text3}>{data?.field_details?.[activeIndex]?.des}</Text>
                </View>
            }
        </View>
    )
}