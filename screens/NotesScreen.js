import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeaders from "../components/ScreenHeaders";
import NewStyles from "../styles/NewStyles";
import { themeColor1, themeColor4, themeColor0, themeColor3 } from "../theme/Color";
import { notesAPI } from "../services/Api";
import { showToastOrAlert } from "../helpers/Common";
import Button from "../components/Button";
import moment from "moment-jalaali";

export default function NotesScreen({ route, navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  // Refresh when navigating back from Add/Edit Note
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotes();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAll();
      
      if (response.success && response.data) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      if (notes.length > 0) {
        showToastOrAlert('خطا در دریافت یادداشت‌ها');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  const handleDelete = (id) => {
    Alert.alert(
      'حذف یادداشت',
      'آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await notesAPI.delete(id);
              if (response.success) {
                showToastOrAlert('یادداشت با موفقیت حذف شد');
                fetchNotes();
              }
            } catch (error) {
              console.error('Error deleting note:', error);
              showToastOrAlert('خطا در حذف یادداشت');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (note) => {
    navigation.navigate('AddEditNote', { note });
  };

  const handleAddNew = () => {
    navigation.navigate('AddEditNote');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = moment(dateString);
    return date.format('jYYYY/jMM/jDD - HH:mm');
  };

  const renderNoteCard = ({ item }) => {
    return (
      <View style={[styles.noteCard, NewStyles.border10]}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color={themeColor3.bgColor(1)} />
            <Text style={[NewStyles.text10, { fontSize: 12, marginRight: 5 }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={styles.iconBtn}
            >
              <Ionicons name="create-outline" size={20} color={themeColor1.bgColor(1)} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.iconBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={[NewStyles.text10, { lineHeight: 24 }]}>
            {item.note}
          </Text>
        </View>

        {item.updated_at !== item.created_at && (
          <View style={styles.editedBadge}>
            <Text style={styles.editedText}>
              ویرایش شده: {formatDate(item.updated_at)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color={themeColor3.bgColor(1)} />
      <Text style={[NewStyles.title10, { marginTop: 20 }]}>
        یادداشتی ثبت نشده است
      </Text>
      <Text style={[NewStyles.text10, { marginTop: 10, textAlign: 'center' }]}>
        برای افزودن یادداشت جدید روی دکمه زیر کلیک کنید
      </Text>
    </View>
  );

  if (loading && notes.length === 0) {
    return (
      <View style={[NewStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
      </View>
    );
  }

  return (
    <View style={NewStyles.container}>
      <ScreenHeaders title="یادداشت‌ها" onBackPress={() => navigation.goBack()} />

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNoteCard}
        contentContainerStyle={[
          styles.listContent,
          notes.length === 0 && { flex: 1 }
        ]}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          title="افزودن یادداشت جدید"
          onPress={handleAddNew}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  noteCard: {
    backgroundColor: themeColor4.bgColor(1),
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColor3.bgColor(0.2),
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  iconBtn: {
    padding: 5,
  },
  cardContent: {
    minHeight: 50,
  },
  editedBadge: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: themeColor3.bgColor(0.2),
  },
  editedText: {
    fontSize: 11,
    color: themeColor3.bgColor(1),
    fontFamily: 'VazirLight',
    textAlign: 'left',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: themeColor3.bgColor(0.2),
  },
});
