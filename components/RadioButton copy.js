import { View, Text, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { uri } from '../services/URL';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor6, themeColor7 } from '../theme/Color';
import { addStep, decrement, increment, updateRadioButton } from '../slices/stepSlice';
import { formatPrice } from '../helpers/Common';
import SwitchButton from './SwitchButton';

export default function RadioButton({ step, data, setLoading }) {

    const dispatch = useDispatch();
    const category = useSelector(state => state.category?.data);

    const fetchConditionalSteps = async (id) => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/steps/conditional`, { categoryId: category?.id, fieldId: data?.id, fieldDetailId: id })
            dispatch(addStep({ fieldId: data?.id, fieldDetailId: id, step, steps: response.data }))
        } catch (error) {
            console.error(error);
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
            <View style={[NewStyles.row, { gap: 5 }]}>
                <Ionicons name={data?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.title}>{data?.title} {data?.is_required == 1 && <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View>}</Text>
            </View>
            {data?.des && <Text style={NewStyles.text3}>{data?.des}</Text>}
            <FlatList
                style={{ gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item?.id?.toString()}
                data={data?.field_details}
                initialNumToRender={30}
                renderItem={({ item }) =>
                    <View style={{ gap: 10 }}>
                        {/* <BouncyCheckbox
                            size={25}
                            fillColor={themeColor0.bgColor(1)}
                            unFillColor={themeColor5.bgColor(1)}
                            iconStyle={{ borderColor: themeColor0.bgColor(1) }}
                            innerIconStyle={{ borderWidth: 1 }}
                            textStyle={[NewStyles.text3, { textDecorationLine: 'none' }]}
                            text={item.title}
                            isChecked={() => item?.value > 0}
                            onPress={() => {
                                dispatch(updateRadioButton({ fieldId: data?.id, fieldDetailId: item.id, step }))
                                if (data?.is_conditional == 1) {
                                    fetchConditionalSteps(item.id);
                                }
                            }}
                        /> */}
                        <View style={NewStyles.rowWrapper}>
                            <Text style={NewStyles.text3}>{item.title}</Text>
                            <SwitchButton
                                isActive={item?.value >= 1}
                                onChange={() => {
                                    dispatch(updateRadioButton({ fieldId: data?.id, fieldDetailId: item.id, step }))
                                    if (data?.is_conditional == 1) {
                                        fetchConditionalSteps(item.id);
                                    }
                                }}
                            />
                        </View>

                        {item.has_counter == 1 && item.value ? renderCounter(item) : renderPrice(item)}
                        {item?.des ? <Text style={NewStyles.text}>{item?.des}</Text> : null}
                    </View>
                }
            />
        </View>
    )
}