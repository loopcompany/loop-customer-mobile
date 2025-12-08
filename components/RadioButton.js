import { View, Text, FlatList, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { uri } from '../services/URL';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7 } from '../theme/Color';
import { addStep, decrement, increment, updateRadioButton } from '../slices/stepSlice';
import { formatPrice } from '../helpers/Common';
import SwitchButton from './SwitchButton';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useState } from 'react';

export default function RadioButton({ step, data, setLoading }) {

    const dispatch = useDispatch();
    const category = useSelector(state => state.category?.data);
    const [show, setShow] = useState(false)
    const token = useSelector(state => state.auth?.token);
    
    const fetchConditionalSteps = async (id) => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/steps/fetch-conditional`, { categoryId: category?.id, fieldId: data?.id, fieldDetailId: id }, {headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }})

            dispatch(addStep({ fieldId: data?.id, fieldDetailId: id, step, steps: response.data }))
        } catch (error) {
            console.log(error?.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const renderPrice = (item) => {
        if (item.price > 0 && item.show_price == 1 && item?.value) {
            const total = item.has_counter ? item.price * item.value : item.price;
            return (
                <Text style={NewStyles.text}>+ {formatPrice(total)} تومان</Text>
            );
        }
        return null;
    };

    const renderCounter = (item) => (
        <View style={NewStyles.rowWrapper}>
            {renderPrice(item)}
            <View style={{ flex: 1 }}>
                <View style={[NewStyles.rowWrapper, { width: 100 }]}>
                    <Pressable style={NewStyles.add} onPress={() => { dispatch(increment({ fieldId: data?.id, fieldDetailId: item.id, step })); }}>
                        <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                    </Pressable>
                    <Text style={[NewStyles.text10, { textAlign: 'center' }]}>{item.value}</Text>
                    <Pressable style={NewStyles.remove} onPress={() => { if (item.value > 0) { dispatch(decrement({ fieldId: data?.id, fieldDetailId: item.id, step })); } }} >
                        <Ionicons name='remove' size={24} color={themeColor0.bgColor(1)} />
                    </Pressable>
                </View>
            </View>
        </View>
    );

    return (
        <View style={NewStyles.seperator1}>
            <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name && <Ionicons name={data?.icon_name} size={24} color={themeColor4.bgColor(1)} />}
                    <Text style={NewStyles.title4}>{data?.title}</Text>
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>
            {show && data?.des &&
                <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border5 }}>
                    <Text style={NewStyles.text10}>{data?.des}</Text>
                </View>
            }
            {show && <FlatList
                style={{ gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item?.id?.toString()}
                data={data?.field_details}
                initialNumToRender={30}
                renderItem={({ item }) =>
                    <View style={{ gap: 10 }}>
                        
                        <TouchableOpacity onPress={() => {
                            dispatch(updateRadioButton({ fieldId: data?.id, fieldDetailId: item.id, step }))
                            if (data?.is_conditional == 1) {
                                fetchConditionalSteps(item.id);
                            }
                        }} style={[{ backgroundColor: themeColor4.bgColor(1), padding: 10, ...NewStyles.border5 }, item?.value > 0 && { backgroundColor: themeColor0.bgColor(0.2) }]}>
                            <Text style={NewStyles.text10}>{item.title}</Text>
                        </TouchableOpacity>


                        {item.has_counter == 1 && item.value ? renderCounter(item) : renderPrice(item)}
                        {item?.des ? <Text style={NewStyles.text}>{item?.des}</Text> : null}
                    </View>
                }
            />}
        </View>
    )
}