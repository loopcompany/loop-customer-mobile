import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { imageUri, uri } from '../services/URL';
import NewStyles from '../styles/NewStyles';
import {
  themeColor0,
  themeColor1,
  themeColor3,
  themeColor4,
} from '../theme/Color';
import {
  addStep,
  decrement,
  increment,
  updateRadioButton,
} from '../slices/stepSlice';
import { formatPrice, langIsRTL } from '../helpers/Common';
import i18n from 'i18next';
import { LinearGradient } from 'expo-linear-gradient';

const RadioOptionItem = React.memo(
  function RadioOptionItem({
    item,
    isColumn,
    onSelect,
    onIncrement,
    onDecrement,
    borderRadius
  }) {
    const selected = item?.value > 0;

    const totalPrice = useMemo(() => {
      if (item.price > 0 && item.show_price == 1 && item?.value) {
        return item.has_counter ? item.price * item.value : item.price;
      }

      return null;
    }, [item.price, item.show_price, item.value, item.has_counter]);

    return (
      <View style={isColumn ? styles.columnItem : styles.rowItem}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onSelect(item.id)}
          style={[
            isColumn ? styles.columnButton : styles.rowButton,
            selected && styles.selectedButton,
            { borderRadius: Number(borderRadius) }
          ]}
        >
          {!!item?.image_path && (
            <View
              style={[
                styles.imageBox,
                isColumn && styles.imageBoxColumn,
                selected && isColumn && styles.imageBoxSelected,
                { borderRadius: Number(borderRadius) }, 
              ]}
            >
              <Image
                source={{ uri: `${imageUri}/${item.image_path}` }}
                style={[
                  styles.image,
                  isColumn && styles.imageColumn,
                  { borderRadius: Number(borderRadius) }
                ]}
                resizeMode="contain"
                resizeMethod="resize"
              />
            </View>
          )}

          {!isColumn && (
            <Text style={[NewStyles.text10, selected && NewStyles.text4]}>
              {item.title}
            </Text>
          )}
        </TouchableOpacity>

        {!!totalPrice && (
          <Text style={NewStyles.text}>
            + {formatPrice(totalPrice)} تومان
          </Text>
        )}

        {item.has_counter == 1 && item.value ? (
          <View style={NewStyles.rowWrapper}>
            <View style={{ flex: 1 }}>
              <View style={[NewStyles.rowWrapper, { width: 100 }]}>
                <Pressable
                  style={NewStyles.add}
                  onPress={() => onIncrement(item.id)}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={themeColor4.bgColor(1)}
                  />
                </Pressable>

                <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
                  {item.value}
                </Text>

                <Pressable
                  style={NewStyles.remove}
                  onPress={() => {
                    if (item.value > 0) {
                      onDecrement(item.id);
                    }
                  }}
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={themeColor0.bgColor(1)}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {!!item?.des && !isColumn && (
          <View style={styles.descriptionBox}>
            <Text style={NewStyles.text10}>{item.des}</Text>
          </View>
        )}
      </View>
    );
  },
  function areEqual(prev, next) {
    return (
      prev.isColumn === next.isColumn &&
      prev.item.id === next.item.id &&
      prev.item.value === next.item.value &&
      prev.item.title === next.item.title &&
      prev.item.image_path === next.item.image_path &&
      prev.item.price === next.item.price &&
      prev.item.show_price === next.item.show_price &&
      prev.item.has_counter === next.item.has_counter &&
      prev.item.des === next.item.des
    );
  }
);

export default function RadioButton({ step, data, setLoading }) {
  const dispatch = useDispatch();

  const categoryId = useSelector(state => state.category?.data?.id);
  const token = useSelector(state => state.auth?.token);

  const [show, setShow] = useState(false);

  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const isRTL = useMemo(() => langIsRTL(lang), [lang]);

  const isColumn = data?.is_column == 1;
  const borderRadius = Number(data?.border_radius);
  const fieldId = data?.id;
  const isConditional = data?.is_conditional == 1;

  const fieldDetails = data?.field_details ?? [];

  const fetchConditionalSteps = useCallback(
    async id => {
      setLoading(true);

      try {
        const response = await axios.post(
          `${uri}/steps/fetch-conditional`,
          {
            categoryId,
            fieldId,
            fieldDetailId: id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Accept-Language': lang,
            },
          }
        );

        dispatch(
          addStep({
            fieldId,
            fieldDetailId: id,
            step,
            steps: response.data,
          })
        );
      } catch (error) {
        console.log(error?.response?.data);
      } finally {
        setLoading(false);
      }
    },
    [categoryId, fieldId, token, lang, dispatch, step, setLoading]
  );

  const handleSelect = useCallback(
    itemId => {
      dispatch(
        updateRadioButton({
          fieldId,
          fieldDetailId: itemId,
          step,
        })
      );

      if (isConditional) {
        fetchConditionalSteps(itemId);
      }
    },
    [dispatch, fieldId, step, isConditional, fetchConditionalSteps]
  );

  const handleIncrement = useCallback(
    itemId => {
      dispatch(
        increment({
          fieldId,
          fieldDetailId: itemId,
          step,
        })
      );
    },
    [dispatch, fieldId, step]
  );

  const handleDecrement = useCallback(
    itemId => {
      dispatch(
        decrement({
          fieldId,
          fieldDetailId: itemId,
          step,
        })
      );
    },
    [dispatch, fieldId, step]
  );

  const keyExtractor = useCallback(item => String(item.id), []);

  const renderItem = useCallback(
    ({ item }) => (
      <RadioOptionItem
        item={item}
        isColumn={isColumn}
        borderRadius={borderRadius}
        onSelect={handleSelect}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    ),
    [isColumn, handleSelect, handleIncrement, handleDecrement, borderRadius]
  );

  return (
    <View style={NewStyles.seperator1}>
      <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
        <View style={[NewStyles.row, { gap: 10 }]}>
          {data?.icon_name &&
            <Image
              source={{ uri: `${imageUri}/${data?.icon_name}` }}
              style={{ height: 70, width: 70, resizeMode: 'contain' }}
            />
          }
          <Text style={NewStyles.title4}> {data?.title} {data?.is_required == 1 && <Text style={NewStyles.title6}>*</Text>}</Text>
        </View>
        <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
      </Pressable>

      {(data?.des && show) &&
        <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{ alignSelf: 'center', backgroundColor: themeColor3.bgColor(1), paddingHorizontal: 40, paddingVertical: 10, borderWidth: 1, borderColor: themeColor4.bgColor(1) }, NewStyles.border10]}>
          <Text style={NewStyles.title10}>{data?.des}</Text>
        </LinearGradient>
      }

      {show && (
        <FlatList
          key={isColumn ? 'column-list' : 'row-list'}
          data={fieldDetails}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={isColumn ? 3 : 1}
          showsVerticalScrollIndicator={false}

          /**
           * فعلاً این را فعال نکن.
           * روی بعضی لیست‌های تصویری چندستونه بدتر می‌کند.
           */
          removeClippedSubviews={false}

          initialNumToRender={isColumn ? 18 : 12}
          maxToRenderPerBatch={isColumn ? 12 : 8}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          style={{ gap: 10 }}
          contentContainerStyle={
            Platform.OS === 'web'
              ? styles.webContent
              : styles.listContent
          }
          columnWrapperStyle={
            isColumn ? styles.columnWrapper : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: themeColor0.bgColor(1),
    paddingVertical: 10,
  },

  listContent: {
    paddingBottom: 10,
  },

  webContent: {
    gap: 20,
    paddingBottom: 10,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  rowItem: {
    gap: 10,
  },

  columnItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },

  rowButton: {
    backgroundColor: themeColor4.bgColor(1),
    padding: 10,
    gap: 10,
    ...NewStyles.border5,
    ...NewStyles.row,
  },

  columnButton: {
    width: 110,
    height: 110,
    backgroundColor: themeColor4.bgColor(0),
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    ...NewStyles.border100,
  },

  selectedButton: {
    backgroundColor: themeColor0.bgColor(1),
  },

  imageBox: {
    height: 60,
    width: 60,
    backgroundColor: themeColor4.bgColor(1),
    borderWidth: 3,
    borderColor: themeColor1.bgColor(1),
    alignItems: 'center',
    justifyContent: 'center',
    ...NewStyles.border100,
  },

  imageBoxColumn: {
    width: 100,
    height: 100,
  },

  imageBoxSelected: {
    borderColor: themeColor0.bgColor(1),
  },

  image: {
    width: 50,
    height: 50,
    backgroundColor: themeColor4.bgColor(1),
    ...NewStyles.border100,
  },

  imageColumn: {
    width: 80,
    height: 80,
  },

  descriptionBox: {
    backgroundColor: themeColor1.bgColor(1),
    padding: 10,
    ...NewStyles.border5,
  },
});
