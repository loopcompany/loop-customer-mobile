import React, { useState, useEffect,useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from 'react-i18next';
import ScreenHeaders from "../../components/ScreenHeaders";
import NewStyles from "../../styles/NewStyles";
import { themeColor1, themeColor4, themeColor0, themeColor3 } from "../../theme/Color";
import { notesAPI } from "../../services/Api";
import { showToastOrAlert, showAlert } from "../../helpers/Common";
import Button from "../../components/Button";
import { createStyles } from '../../styles/NewStyles';
export default function AddEditNoteScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const noteToEdit = route.params?.note;
  const isEditMode = !!noteToEdit;

  const [noteText, setNoteText] = useState(noteToEdit?.note || '');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(noteToEdit?.note?.length || 0);

  const MAX_CHARS = 2000;

  useEffect(() => {
    setCharCount(noteText.length);
  }, [noteText]);

  const handleSave = async () => {
    // Validation
    if (!noteText.trim()) {
      showAlert(t('Error'), t('Please enter note text'));
      return;
    }

    if (noteText.length > MAX_CHARS) {
      showAlert(t('Error'), t('Note should not exceed {{count}} characters', { count: MAX_CHARS }));
      return;
    }

    try {
      setLoading(true);
      const payload = { note: noteText.trim() };

      let response;
      if (isEditMode) {
        response = await notesAPI.update(noteToEdit.id, payload);
      } else {
        response = await notesAPI.create(payload);
      }

      if (response.success) {
        showToastOrAlert(
          isEditMode ? t('Note successfully updated') : t('Note successfully saved')
        );
        if (Platform.OS == 'web') {
          window.history.back()
        } else {
          navigation.goBack()
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        showAlert(t('Error saving'), errorMessages);
      } else if (error.response?.data?.message) {
        showAlert(t('Error'), error.response.data.message);
      } else {
        showToastOrAlert(t('Error saving note'));
      }
    } finally {
      setLoading(false);
    }
  };
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  return (
    <KeyboardAvoidingView
      style={NewStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeaders
        title={isEditMode ? t('Edit Note') : t('Add Note')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={[NewStyles.text10, { fontSize: 13, lineHeight: 22 }]}>
              {t('Write your personal notes here. You can record reminders, to-do lists, important information, and anything else you need.')}
            </Text>
          </View>

          {/* Note Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={[NewStyles.title10, { fontSize: 14 }]}>
                {t('Note Text')}
                <Text style={styles.required}> *</Text>
              </Text>
            </View>

            <TextInput
              style={[
                styles.textArea,
                NewStyles.border10,
                charCount > MAX_CHARS && styles.textAreaError
              ]}
              placeholder={t('Write your note here...')}
              placeholderTextColor={themeColor3.bgColor(0.5)}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              textAlignVertical="top"
              maxLength={MAX_CHARS + 100} // Allow typing to show error
            />

            {/* Character Counter */}
            <View style={styles.counterRow}>
              <Text
                style={[
                  styles.counterText,
                  charCount > MAX_CHARS && styles.counterError
                ]}
              >
                {charCount} / {MAX_CHARS}
              </Text>
              {charCount > MAX_CHARS && (
                <Text style={styles.errorText}>
                  {t('Character count exceeds limit')}
                </Text>
              )}
            </View>
          </View>

          {/* Tips Box */}
          <View style={styles.tipsBox}>
            <Text style={[NewStyles.title10, { fontSize: 13, marginBottom: 8 }]}>
              {t('💡 Useful tips:')}
            </Text>
            <Text style={[NewStyles.text10, { fontSize: 12, lineHeight: 20 }]}>
              {t('• Use new lines to create lists\n• You can use emojis 😊\n• Write important notes with clear titles\n• Maximum {{count}} characters allowed', { count: MAX_CHARS.toLocaleString('fa-IR') })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title={isEditMode ? t('Save Changes') : t('Save Note')}
          onPress={handleSave}

          loading={loading}
          disabled={loading || !noteText.trim() || charCount > MAX_CHARS}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const createLocalStyles = (NewStyles) =>  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColor0.bgColor(1),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 16,
  },
  infoBox: {
    backgroundColor: themeColor4.bgColor(1),
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderRightWidth: 3,
    borderRightColor: themeColor1.bgColor(1),
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  required: {
    color: '#d32f2f',
    fontSize: 16,
  },
  textArea: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 14,
    fontFamily: 'VazirLight',
    fontSize: 14,
    textAlign: 'right',
    minHeight: 200,
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.3),
  },
  textAreaError: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  counterRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  counterText: {
    fontSize: 12,
    color: themeColor3.bgColor(1),
    fontFamily: 'VazirLight',
  },
  counterError: {
    color: '#d32f2f',
    fontFamily: 'VazirBold',
  },
  errorText: {
    fontSize: 11,
    color: '#d32f2f',
    fontFamily: 'VazirLight',
  },
  tipsBox: {
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: themeColor3.bgColor(0.2),
    width: '100%',
    alignItems: 'center'
  },
});

